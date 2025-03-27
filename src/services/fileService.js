import File from '../models/File.js';
import fs from 'fs/promises';
import crypto from 'crypto';
import path from 'path';

export default {
    async uploadFile(file) {
        const fileBuffer = await fs.readFile(file.path);
        const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
        const fileSize = fileBuffer.length;
        const fileExt = path.extname(file.originalname); // Get extension (.png, .mp4, etc.)
        const newFilename = `${fileHash}${fileExt}`; // Hash + extension
        const newPath = path.join('uploads', newFilename); // Full new path

        // Check for existing file by hash
        const existingFile = await File.findByHash(fileHash);
        if (existingFile) {
            await fs.unlink(file.path); // Remove duplicate
            return {
                ...existingFile,
                isDuplicate: true,
                message: 'File already exists'
            };
        }

        // Move and rename the file (adds extension)
        await fs.rename(file.path, newPath);

        // Store in DB with new path
        const fileId = await File.create({
            filename: file.originalname,
            path: newPath, // Now includes extension
            content_hash: fileHash,
            size: fileSize
        });

        return {
            fileId,
            path: newPath,
            size: fileSize,
            isDuplicate: false,
            message: 'File uploaded successfully'
        };
    },

    // cleanupOrphanedFiles remains the same
    async cleanupOrphanedFiles() {
        try {
            const dbFiles = await File.getAllPaths();
            const uploadDir = 'uploads/';
            const physicalFiles = await fs.readdir(uploadDir);

            await Promise.all(physicalFiles.map(async file => {
                const fullPath = path.join(uploadDir, file);
                if (!dbFiles.includes(fullPath)) {
                    await fs.unlink(fullPath).catch(() => { });
                }
            }));
        } catch (err) {
            console.error('Cleanup error:', err);
        }
    }
};