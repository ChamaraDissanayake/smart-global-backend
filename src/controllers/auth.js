import authService from '../services/auth.js';

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        await authService.register(email, password);
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await authService.login(email, password);
        res.json({ token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const token = await authService.requestPasswordReset(email);
        res.json({ message: 'Password reset token generated', token });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        await authService.resetPassword(token, newPassword);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};