import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export default {
    async create({ email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        return result.insertId;
    },

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }
};