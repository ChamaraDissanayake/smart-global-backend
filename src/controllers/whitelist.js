const whitelistService = require('../services/whitelistService');

const addEmail = async (req, res) => {
    try {
        const { email } = req.body;
        await whitelistService.addEmail(email);
        res.status(201).json({ message: 'Email added to whitelist' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists in whitelist' });
        }
        res.status(500).json({ error: err.message });
    }
};

const getEmails = async (req, res) => {
    try {
        const emails = await whitelistService.getEmails();
        res.json(emails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPendingEmails = async (req, res) => {
    try {
        const emails = await whitelistService.getPendingEmails();
        res.json(emails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const removeEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const deleted = await whitelistService.removeEmail(email);

        if (!deleted) {
            return res.status(404).json({ error: 'Email not found in whitelist' });
        }

        res.json({ message: 'Email removed from whitelist' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addEmail,
    getEmails,
    removeEmail,
    getPendingEmails
};
