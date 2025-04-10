const { pool } = require('../config/db');

module.exports = {
    async create(name, position, image_path, bio = '') {
        try {
            if (!name || !position || !image_path) {
                throw new Error('Missing required fields: name, position, or image_path.');
            }

            const [result] = await pool.query(
                'INSERT INTO team_members (name, position, image_path, bio) VALUES (?, ?, ?, ?)',
                [name, position, image_path, bio]
            );

            return result.insertId;
        } catch (err) {
            console.error('Error in Team.create:', err.message);
            throw err;
        }
    },

    async getAll() {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM team_members ORDER BY created_at DESC'
            );
            return rows;
        } catch (err) {
            console.error('Error in Team.getAll:', err.message);
            throw err;
        }
    },

    async getById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM team_members WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (err) {
            console.error('Error in Team.getById:', err.message);
            throw err;
        }
    },

    async update(id, { name, position, image_path, bio = '' }) {
        try {
            if (!name || !position || !image_path) {
                throw new Error('Missing required fields for update.');
            }

            const [result] = await pool.query(
                'UPDATE team_members SET name = ?, position = ?, image_path = ?, bio = ? WHERE id = ?',
                [name, position, image_path, bio, id]
            );

            return result.affectedRows > 0;
        } catch (err) {
            console.error('Error in Team.update:', err.message);
            throw err;
        }
    },

    async delete(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM team_members WHERE id = ?',
                [id]
            );

            return result.affectedRows > 0;
        } catch (err) {
            console.error('Error in Team.delete:', err.message);
            throw err;
        }
    }
};
