import insightService from '../services/insightService.js';

export const createInsight = async (req, res) => {
    try {
        const { category, video, article } = req.body;
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }

        const insightId = await insightService.createInsight({
            category,
            video_title: video?.title,
            video_thumbnail_url: video?.thumbnail,
            video_url: video?.url,
            article_title: article?.title,
            article_description: article?.description,
            article_thumbnail_url: article?.thumbnail,
            article_reading_time: article?.time,
            article_content: article?.content
        });

        res.status(201).json({
            message: 'Insight created successfully',
            insightId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getInsights = async (req, res) => {
    try {
        const insights = await insightService.getAllInsights();
        res.json(insights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getInsight = async (req, res) => {
    try {
        const insight = await insightService.getInsight(req.params.id);
        res.json(insight);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

export const updateInsight = async (req, res) => {
    try {
        const { category, video, article } = req.body;
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }

        await insightService.updateInsight(req.params.id, {
            category,
            video_title: video?.title,
            video_thumbnail_url: video?.thumbnail,
            video_url: video?.url,
            article_title: article?.title,
            article_description: article?.description,
            article_thumbnail_url: article?.thumbnail,
            article_reading_time: article?.time,
            article_content: article?.content
        });

        res.json({ message: 'Insight updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteInsight = async (req, res) => {
    try {
        await insightService.deleteInsight(req.params.id);
        res.json({ message: 'Insight deleted successfully' });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};