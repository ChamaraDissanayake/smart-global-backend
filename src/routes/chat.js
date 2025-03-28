import express from 'express';
import { processChat, getHistory } from '../services/chatService.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { userId, userInput } = req.body;
        if (!userId || !userInput) return res.status(400).json({ error: 'userId and userInput are required' });

        const botResponse = await processChat(userId, userInput);
        res.json({ botResponse });
    } catch (error) {
        console.error('Error processing chat:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const { userId, limit = 10, offset = 0 } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const chatHistory = await getHistory(userId, limit, offset);
        res.json({ chatHistory });
    } catch (error) {
        console.error('Error retrieving chat history:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;
