const insightService = require('../services/insightService');
const fileService = require('../services/fileService');
const { validationResult } = require('express-validator');

const createInsight = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, video = {}, article = {} } = req.body;

        // Process files if present
        const processFile = async (file) => {
            return file ? (await fileService.uploadFile(file)).path : undefined;
        };

        const [videoThumbnailUrl, videoUrl, articleThumbnailUrl] = await Promise.all([
            req.files?.videoThumbnail?.[0] ? processFile(req.files.videoThumbnail[0]) : video?.thumbnail,
            (!video?.isExternal && req.files?.videoFile?.[0]) ? processFile(req.files.videoFile[0]) : video?.url,
            req.files?.articleThumbnail?.[0] ? processFile(req.files.articleThumbnail[0]) : article?.thumbnail
        ]);

        const insightId = await insightService.createInsight({
            category,
            video: {
                title: video?.title,
                thumbnail: videoThumbnailUrl,
                url: videoUrl,
                isExternal: video?.isExternal || false
            },
            article: article ? {
                title: article.title,
                description: article.description,
                thumbnail: articleThumbnailUrl,
                content: article.content,
                time: article.time || 10
            } : null
        });

        res.status(201).json({
            message: 'Insight created successfully',
            insightId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getInsights = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await insightService.getAllInsights(page, limit);
        res.json({
            insights: result.insights,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getInsight = async (req, res) => {
    try {
        const insight = await insightService.getInsight(req.params.id);
        res.json(insight);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

const updateInsight = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, video = {}, article = {} } = req.body;
        const existingInsight = await insightService.getInsight(req.params.id);

        // Process files if present
        const processFile = async (file, existingUrl) => {
            return file ? (await fileService.uploadFile(file)).path : existingUrl;
        };

        const [videoThumbnailUrl, videoUrl, articleThumbnailUrl] = await Promise.all([
            req.files?.videoThumbnail?.[0]
                ? processFile(req.files.videoThumbnail[0], existingInsight.video?.thumbnail)
                : video?.thumbnail || existingInsight.video?.thumbnail,

            (!video?.isExternal && req.files?.videoFile?.[0])
                ? processFile(req.files.videoFile[0], existingInsight.video?.url)
                : video?.url || existingInsight.video?.url,

            req.files?.articleThumbnail?.[0]
                ? processFile(req.files.articleThumbnail[0], existingInsight.article?.thumbnail)
                : article?.thumbnail || existingInsight.article?.thumbnail
        ]);

        await insightService.updateInsight(req.params.id, {
            category,
            video: {
                title: video?.title || existingInsight.video?.title,
                thumbnail: videoThumbnailUrl,
                url: videoUrl,
                isExternal: video?.isExternal ?? existingInsight.video?.isExternal ?? false
            },
            article: article ? {
                title: article.title || existingInsight.article?.title,
                description: article.description || existingInsight.article?.description,
                thumbnail: articleThumbnailUrl,
                content: article.content || existingInsight.article?.content,
                time: article.time || existingInsight.article?.time || 10
            } : null
        });

        res.json({ message: 'Insight updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteInsight = async (req, res) => {
    try {
        await insightService.deleteInsight(req.params.id);
        res.json({ message: 'Insight deleted successfully' });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

module.exports = {
    createInsight,
    getInsights,
    getInsight,
    updateInsight,
    deleteInsight
};