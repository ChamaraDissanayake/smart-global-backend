import { Router } from 'express';
import { uploadFile, getFiles, deleteFile } from '../controllers/files.js';
import fileService from '../services/fileService.js';

const router = Router();

router.post('/upload', uploadFile);
router.get('/', getFiles);
router.delete('/:id', deleteFile);

// Run cleanup on startup and periodically
fileService.cleanupOrphanedFiles();
setInterval(fileService.cleanupOrphanedFiles, 24 * 60 * 60 * 1000); // Daily

export default router;