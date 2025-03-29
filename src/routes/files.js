const { Router } = require('express');
const { uploadFile, getFiles, deleteFile } = require('../controllers/files');
const fileService = require('../services/fileService');

const router = Router();

router.post('/upload', uploadFile);
router.get('/', getFiles);
router.delete('/:id', deleteFile);

// Run cleanup on startup and periodically
fileService.cleanupOrphanedFiles();
setInterval(fileService.cleanupOrphanedFiles, 24 * 60 * 60 * 1000); // Daily

module.exports = router;