import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import fs from 'fs/promises';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// Configure file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});


// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

async function initDB() {
    const conn = await pool.getConnection();
    await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `);
    await conn.query(`
        CREATE TABLE IF NOT EXISTS files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            path VARCHAR(512) NOT NULL,
            content_hash VARCHAR(64) UNIQUE,
            size BIGINT
        );
    `);
    await conn.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
    await conn.query(`
        CREATE TABLE IF NOT EXISTS whitelist_emails (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS insights (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            -- Video fields (all optional)
            video_title VARCHAR(255),
            video_thumbnail_url VARCHAR(255),
            video_url VARCHAR(255),
            -- Article fields (all optional)
            article_title VARCHAR(255),
            article_description TEXT,
            article_thumbnail_url VARCHAR(255),
            article_reading_time TINYINT UNSIGNED,  -- Best for small numbers (0-255)
            article_content TEXT
        );
`);
    conn.release();
}
await initDB();

// Auth Middleware
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Routes
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // First check if email is whitelisted
        const [whitelist] = await pool.query(
            'SELECT 1 FROM whitelist_emails WHERE email = ?',
            [email]
        );

        if (whitelist.length === 0) {
            return res.status(403).json({
                error: 'Access denied. Your email is not whitelisted.'
            });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: users[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Secure file upload endpoint with duplicate prevention
app.post('/upload', authenticate, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        // 1. Calculate file hash
        const fileBuffer = await fs.readFile(req.file.path);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const fileSize = fileBuffer.length;

        // 2. Check for existing file with content hash
        const [existing] = await conn.query(
            'SELECT id, path FROM files WHERE content_hash = ? FOR UPDATE',
            [fileHash]
        );

        // 3. Handle duplicate
        if (existing.length > 0) {
            await fs.unlink(req.file.path); // Delete duplicate file
            await conn.commit();
            return res.json({
                message: 'File already exists',
                fileId: existing[0].id,
                path: existing[0].path,
                isDuplicate: true
            });
        }

        // 4. Store new file
        const [result] = await conn.query(
            'INSERT INTO files (filename, path, content_hash, size) VALUES (?, ?, ?, ?)',
            [req.file.originalname, req.file.path, fileHash, fileSize]
        );

        await conn.commit();
        res.json({
            message: 'File uploaded successfully',
            fileId: result.insertId,
            path: req.file.path,
            size: fileSize,
            isDuplicate: false
        });

    } catch (error) {
        await conn.rollback();

        // Cleanup uploaded file if error occurred
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large (max 50MB)' });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'File already exists' });
        }

        console.error('Upload error:', error);
        res.status(500).json({
            error: 'File upload failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        conn.release();
    }
});

// Orphaned file cleanup
async function cleanupOrphanedFiles() {
    try {
        const [dbFiles] = await pool.query('SELECT path FROM files');
        const uploadDir = 'uploads/';
        const physicalFiles = await fs.readdir(uploadDir);

        await Promise.all(physicalFiles.map(async file => {
            const fullPath = `${uploadDir}${file}`;
            const existsInDb = dbFiles.some((dbFile) => dbFile.path === fullPath);
            if (!existsInDb) {
                await fs.unlink(fullPath).catch(() => { });
            }
        }));
    } catch (err) {
        console.error('Cleanup error:', err);
    }
}

// Run cleanup on startup and periodically
cleanupOrphanedFiles();
setInterval(cleanupOrphanedFiles, 24 * 60 * 60 * 1000); // Daily

app.get('/files', async (req, res) => {
    try {
        const [files] = await pool.query('SELECT * FROM files');
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/files/:id', async (req, res) => {
    try {
        const fileId = req.params.id;

        // 1. Get file path from database
        const [files] = await pool.query(
            'SELECT id, path FROM files WHERE id = ?',
            [fileId]
        );

        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found in database' });
        }

        const filePath = files[0].path;

        // 2. Delete physical file
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error('Physical file deletion warning:', err.message);
            // Continue even if physical deletion fails
        }

        // 3. Delete database record
        const [result] = await pool.query(
            'DELETE FROM files WHERE id = ?',
            [fileId]
        );

        res.json({
            message: 'File deleted completely',
            details: {
                dbRecordDeleted: result.affectedRows === 1,
                physicalFileDeleted: true, // Assuming best case
                deletedId: fileId
            }
        });

    } catch (err) {
        res.status(500).json({
            error: err.message,
            note: 'Database record may or may not have been deleted'
        });
    }
});

// User delete
app.delete('/user', authenticate, async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        const { password } = req.body;

        // 1. Verify password
        const [users] = await conn.query(
            'SELECT id, password FROM users WHERE id = ?',
            [req.userId]
        );

        if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
            await conn.rollback();
            return res.status(401).json({ error: 'Invalid password' });
        }

        // 2. Delete password reset tokens first (due to foreign key)
        await conn.query(
            'DELETE FROM password_reset_tokens WHERE user_id = ?',
            [req.userId]
        );

        // 3. Delete user
        const [result] = await conn.query(
            'DELETE FROM users WHERE id = ?',
            [req.userId]
        );

        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        await conn.commit();
        res.json({ message: 'User account deleted successfully' });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Password reset endpoints (unchanged)
app.post('/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = users[0].id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

        await pool.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))',
            [userId, token]
        );

        res.json({
            message: 'Password reset token generated',
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/verify-reset-token', async (req, res) => {
    try {
        const { token } = req.body;
        const [tokens] = await pool.query(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        res.json({ valid: true, userId: tokens[0].user_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const [tokens] = await pool.query(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const userId = tokens[0].user_id;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        await pool.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
            [token]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Whitelist Email Endpoints
app.post('/whitelist', authenticate, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { email } = req.body;

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        await conn.query(
            'INSERT INTO whitelist_emails (email) VALUES (?)',
            [email]
        );

        res.status(201).json({ message: 'Email added to whitelist' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists in whitelist' });
        }
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

app.get('/whitelist', authenticate, async (req, res) => {
    try {
        const [emails] = await pool.query(
            'SELECT email FROM whitelist_emails ORDER BY created_at DESC'
        );
        res.json(emails.map(e => e.email));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/whitelist/:email', authenticate, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { email } = req.params;

        const [result] = await conn.query(
            'DELETE FROM whitelist_emails WHERE email = ?',
            [email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Email not found in whitelist' });
        }

        res.json({ message: 'Email removed from whitelist' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

//Create Insights
app.post('/insights', authenticate, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { category, video, article } = req.body;
        // Validate required fields
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }

        // Prepare article content (store as plain text)
        const articleContent = article?.content || null;

        const query = `
            INSERT INTO insights (
                category,
                video_title,
                video_thumbnail_url,
                video_url,
                article_title,
                article_description,
                article_thumbnail_url,
                article_reading_time,
                article_content
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await conn.query(query, [
            category,
            video?.title || null,
            video?.thumbnail || null,
            video?.url || null,
            article?.title || null,
            article?.description || null,
            article?.thumbnail || null,
            article?.time || null,
            articleContent  // Storing as plain text
        ]);

        res.status(201).json({
            message: 'Insight created successfully',
            insightId: result.insertId
        });

    } catch (err) {
        console.error('Insight creation error:', err);
        res.status(500).json({
            error: 'Failed to create insight',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        conn.release();
    }
});
// Get all Insights
app.get('/insights', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM insights');

        const insights = rows.map(row => ({
            id: row.id.toString(),
            category: row.category,
            ...(row.video_title && {
                video: {
                    title: row.video_title,
                    thumbnail: row.video_thumbnail_url,
                    url: row.video_url
                }
            }),
            ...(row.article_title && {
                article: {
                    title: row.article_title,
                    description: row.article_description,
                    thumbnail: row.article_thumbnail_url,
                    content: row.article_content, // Already parsed by MySQL
                    url: "", // Add if you store article URLs
                    time: row.article_reading_time
                }
            })
        }));

        res.json(insights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single Insight
app.get('/insights/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM insights WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Insight not found' });
        }

        const row = rows[0];
        const insight = {
            id: row.id.toString(),
            category: row.category,
            ...(row.video_title && {
                video: {
                    title: row.video_title,
                    thumbnail: row.video_thumbnail_url,
                    url: row.video_url
                }
            }),
            ...(row.article_title && {
                article: {
                    title: row.article_title,
                    description: row.article_description,
                    thumbnail: row.article_thumbnail_url,
                    content: row.article_content,
                    url: "",
                    time: row.article_reading_time
                }
            })
        };

        res.json(insight);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Insight
app.put('/insights/:id', authenticate, async (req, res) => {
    try {
        const { category, video, article } = req.body;
        const insightId = req.params.id;

        // Handle article content safely
        const articleContent = !article?.content ? null
            : typeof article.content === 'object' ? JSON.stringify(article.content)
                : article.content;

        await pool.query(
            `UPDATE insights SET
                category = ?,
                video_title = ?,
                video_thumbnail_url = ?,
                video_url = ?,
                article_title = ?,
                article_description = ?,
                article_thumbnail_url = ?,
                article_reading_time = ?,
                article_content = ?
            WHERE id = ?`,
            [
                category,
                video?.title,
                video?.thumbnail,
                video?.url,
                article?.title,
                article?.description,
                article?.thumbnail,
                article?.time,
                articleContent,
                insightId
            ]
        );

        res.json({ message: 'Insight updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Insight
app.delete('/insights/:id', authenticate, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM insights WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Insight not found' });
        }

        res.json({ message: 'Insight deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));