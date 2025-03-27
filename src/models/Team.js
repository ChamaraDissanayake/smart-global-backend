import pool from '../config/db.js';

export default {
    async create({ name, position, image_path }) {
        const [result] = await pool.query(
            'INSERT INTO team_members (name, position, image_path) VALUES (?, ?, ?)',
            [name, position, image_path]
        );
        return result.insertId;
    },

    async getAll() {
        const [rows] = await pool.query('SELECT * FROM team_members ORDER BY created_at DESC');
        return rows;
    },

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM team_members WHERE id = ?', [id]);
        return rows[0];
    },

    async update(id, { name, position, image_path }) {
        const [result] = await pool.query(
            'UPDATE team_members SET name = ?, position = ?, image_path = ? WHERE id = ?',
            [name, position, image_path, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM team_members WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};