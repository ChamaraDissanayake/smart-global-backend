import Insight from '../models/Insight.js';

export default {
    async createInsight(insightData) {
        return await Insight.create(insightData);
    },

    async getAllInsights() {
        const insights = await Insight.getAll();
        return insights.map(insight => this.formatInsight(insight));
    },

    async getInsight(id) {
        const insight = await Insight.getById(id);
        if (!insight) throw new Error('Insight not found');
        return this.formatInsight(insight);
    },

    async updateInsight(id, insightData) {
        const updated = await Insight.update(id, insightData);
        if (!updated) throw new Error('Insight not found');
        return true;
    },

    async deleteInsight(id) {
        const deleted = await Insight.delete(id);
        if (!deleted) throw new Error('Insight not found');
        return true;
    },

    formatInsight(row) {
        return {
            id: row.id.toString(),
            category: row.category,
            ...(row.video_title && {
                video: {
                    title: row.video_title,
                    thumbnail: row.video_thumbnail_url,
                    url: row.video_url
                }
            }),
            ...(row.article_title && {
                article: {
                    title: row.article_title,
                    description: row.article_description,
                    thumbnail: row.article_thumbnail_url,
                    content: row.article_content,
                    url: "",
                    time: row.article_reading_time
                }
            })
        };
    }
};