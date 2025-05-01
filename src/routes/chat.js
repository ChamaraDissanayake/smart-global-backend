const express = require('express');
const { processChatMessage, getChatHistory, processVisitorChatMessage } = require('../controllers/chat');
const router = express.Router();

router.post('/', processChatMessage);
router.post('/visitor-chat', processVisitorChatMessage);
router.get('/history', getChatHistory);

module.exports = router;