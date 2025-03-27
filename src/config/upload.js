import multer from 'multer';

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export default upload;