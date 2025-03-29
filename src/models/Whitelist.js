const { pool } = require('../config/db');

module.exports = {
    async addEmail(email) {
        const [result] = await pool.query(
            'INSERT INTO whitelist_emails (email) VALUES (?)',
            [email]
        );
        return result.insertId;
    },

    async getAllEmails() {
        const [rows] = await pool.query(
            'SELECT email FROM whitelist_emails ORDER BY created_at DESC'
        );
        return rows.map(row => row.email);
    },

    async removeEmail(email) {
        const [result] = await pool.query(
            'DELETE FROM whitelist_emails WHERE email = ?',
            [email]
        );
        return result.affectedRows > 0;
    },

    async isWhitelisted(email) {
        const [rows] = await pool.query(
            'SELECT 1 FROM whitelist_emails WHERE email = ?',
            [email]
        );
        return rows.length > 0;
    }
};