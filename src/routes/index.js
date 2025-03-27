import { Router } from 'express';
import authRoutes from './auth.js';
import fileRoutes from './files.js';
import insightRoutes from './insights.js';
import authenticate from '../middleware/auth.js';
import Whitelist from '../models/Whitelist.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/insights', insightRoutes);

// Whitelist routes
router.post('/whitelist', authenticate, async (req, res) => {
    try {
        const { email } = req.body;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        await Whitelist.addEmail(email);
        res.status(201).json({ message: 'Email added to whitelist' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists in whitelist' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.get('/whitelist', authenticate, async (req, res) => {
    try {
        const emails = await Whitelist.getAllEmails();
        res.json(emails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/whitelist/:email', authenticate, async (req, res) => {
    try {
        const { email } = req.params;
        const deleted = await Whitelist.removeEmail(email);

        if (!deleted) {
            return res.status(404).json({ error: 'Email not found in whitelist' });
        }

        res.json({ message: 'Email removed from whitelist' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;