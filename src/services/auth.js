const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Whitelist = require('../models/Whitelist');
const bcrypt = require('bcrypt');

module.exports = {
    async register(email, password) {
        return await User.create({ email, password });
    },

    async login(email, password) {
        const isWhitelisted = await Whitelist.isWhitelisted(email);

        if (!isWhitelisted) {
            throw new Error('Access denied. Your email is not whitelisted.');
        }

        const user = await User.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return token;
    },

    async requestPasswordReset(email) {
        const user = await User.findByEmail(email);
        if (!user) throw new Error('User not found');

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        return token;
    },

    async resetPassword(token, newPassword) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            await User.updatePassword(decoded.userId, newPassword);
            return true;
        } catch (err) {
            throw new Error('Invalid or expired token');
        }
    }
};