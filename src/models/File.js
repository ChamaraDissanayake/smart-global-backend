import pool from '../config/db.js';

export default {
    async create({ filename, path, content_hash, size }) {
        const [result] = await pool.query(
            'INSERT INTO files (filename, path, content_hash, size) VALUES (?, ?, ?, ?)',
            [filename, path, content_hash, size]
        );
        return result.insertId;
    },

    async findByHash(content_hash) {
        const [rows] = await pool.query(
            'SELECT id, path FROM files WHERE content_hash = ?',
            [content_hash]
        );
        return rows[0];
    },

    async getAll() {
        const [rows] = await pool.query('SELECT * FROM files');
        return rows;
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM files WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async getPath(id) {
        const [rows] = await pool.query('SELECT path FROM files WHERE id = ?', [id]);
        return rows[0]?.path;
    },

    async getAllPaths() {
        const [rows] = await pool.query('SELECT path FROM files');
        return rows.map(row => row.path);
    }
};