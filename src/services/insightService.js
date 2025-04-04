const Insight = require('../models/Insight');

module.exports = {
    async createInsight(insightData) {
        try {
            const formattedData = this.prepareInsightData(insightData);
            return await Insight.create(formattedData);
        } catch (error) {
            console.error('Error creating insight:', error);
            throw error;
        }
    },

    async getAllInsights(page = 1, limit = 10) {
        try {
            const result = await Insight.getAll(page, limit);
            return {
                insights: result.insights.map(this.formatInsight),
                total: result.total,
                page: result.page,
                limit: result.limit
            };
        } catch (error) {
            console.error('Error getting insights:', error);
            throw error;
        }
    },

    async getInsight(id) {
        try {
            const insight = await Insight.getById(id);
            if (!insight) throw new Error('Insight not found');
            return this.formatInsight(insight);
        } catch (error) {
            console.error(`Error getting insight ${id}:`, error);
            throw error;
        }
    },

    async updateInsight(id, insightData) {
        try {
            const formattedData = this.prepareInsightData(insightData);
            const updated = await Insight.update(id, formattedData);
            if (!updated) throw new Error('Insight not found');
            return true;
        } catch (error) {
            console.error(`Error updating insight ${id}:`, error);
            throw error;
        }
    },

    async deleteInsight(id) {
        try {
            const deleted = await Insight.delete(id);
            if (!deleted) throw new Error('Insight not found');
            return true;
        } catch (error) {
            console.error(`Error deleting insight ${id}:`, error);
            throw error;
        }
    },

    prepareInsightData(data) {
        return {
            category: data.category,
            video_title: data.video?.title || null,
            video_thumbnail_url: data.video?.thumbnail || null,
            video_url: data.video?.url || null,
            video_is_external: data.video?.isExternal || false,
            article_title: data.article?.title || null,
            article_description: data.article?.description || null,
            article_thumbnail_url: data.article?.thumbnail || null,
            article_content: data.article?.content || null,
            article_reading_time: data.article?.time || 10
        };
    },

    formatInsight(row) {
        return {
            id: row.id.toString(),
            category: row.category,
            ...(row.video_title && {
                video: {
                    title: row.video_title,
                    thumbnail: row.video_thumbnail_url,
                    url: row.video_url,
                    isExternal: Boolean(row.video_is_external)
                }
            }),
            ...(row.article_title && {
                article: {
                    title: row.article_title,
                    description: row.article_description,
                    thumbnail: row.article_thumbnail_url,
                    content: row.article_content,
                    time: row.article_reading_time || 10
                }
            }),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
};