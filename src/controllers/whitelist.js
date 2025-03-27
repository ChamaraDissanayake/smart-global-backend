import Whitelist from '../models/Whitelist.js';

export const addEmail = async (req, res) => {
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
};

export const getEmails = async (req, res) => {
    try {
        const emails = await Whitelist.getAllEmails();
        res.json(emails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeEmail = async (req, res) => {
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
};