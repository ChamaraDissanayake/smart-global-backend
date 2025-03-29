const { pool } = require('../config/db');

module.exports = {
    async create(insightData) {
        const [result] = await pool.query(
            `INSERT INTO insights (
        category, video_title, video_thumbnail_url, video_url,
        article_title, article_description, article_thumbnail_url,
        article_reading_time, article_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                insightData.category,
                insightData.video_title,
                insightData.video_thumbnail_url,
                insightData.video_url,
                insightData.article_title,
                insightData.article_description,
                insightData.article_thumbnail_url,
                insightData.article_reading_time,
                insightData.article_content
            ]
        );
        return result.insertId;
    },

    async getAll() {
        const [rows] = await pool.query('SELECT * FROM insights');
        return rows;
    },

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM insights WHERE id = ?', [id]);
        return rows[0];
    },

    async update(id, insightData) {
        const [result] = await pool.query(
            `UPDATE insights SET
        category = ?, video_title = ?, video_thumbnail_url = ?,
        video_url = ?, article_title = ?, article_description = ?,
        article_thumbnail_url = ?, article_reading_time = ?,
        article_content = ?
      WHERE id = ?`,
            [
                insightData.category,
                insightData.video_title,
                insightData.video_thumbnail_url,
                insightData.video_url,
                insightData.article_title,
                insightData.article_description,
                insightData.article_thumbnail_url,
                insightData.article_reading_time,
                insightData.article_content,
                id
            ]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM insights WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};