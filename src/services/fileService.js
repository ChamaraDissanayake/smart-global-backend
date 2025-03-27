import File from '../models/File.js';
import fs from 'fs/promises';
import crypto from 'crypto';

export default {
    async uploadFile(file) {
        const fileBuffer = await fs.readFile(file.path);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const fileSize = fileBuffer.length;

        const existingFile = await File.findByHash(fileHash);
        if (existingFile) {
            await fs.unlink(file.path);
            return {
                ...existingFile,
                isDuplicate: true,
                message: 'File already exists'
            };
        }

        const fileId = await File.create({
            filename: file.originalname,
            path: file.path,
            content_hash: fileHash,
            size: fileSize
        });

        return {
            fileId,
            path: file.path,
            size: fileSize,
            isDuplicate: false,
            message: 'File uploaded successfully'
        };
    },

    async cleanupOrphanedFiles() {
        try {
            const dbFiles = await File.getAllPaths();
            const uploadDir = 'uploads/';
            const physicalFiles = await fs.readdir(uploadDir);

            await Promise.all(physicalFiles.map(async file => {
                const fullPath = `${uploadDir}${file}`;
                if (!dbFiles.includes(fullPath)) {
                    await fs.unlink(fullPath).catch(() => { });
                }
            }));
        } catch (err) {
            console.error('Cleanup error:', err);
        }
    }
};