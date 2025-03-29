const express = require('express');
const { processChat, getChatHistory } = require('../controllers/chat');
const router = express.Router();

router.post('/', processChat);
router.get('/history', getChatHistory);

module.exports = router;