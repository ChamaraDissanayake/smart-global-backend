const { Router } = require('express');
const {
    createInsight,
    getInsights,
    getInsight,
    updateInsight,
    deleteInsight
} = require('../controllers/insights');
const authenticate = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = Router();

// Rate limiting for modification endpoints
const modifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later'
});

router.get('/', getInsights);
router.get('/:id', getInsight);
router.post('/', authenticate, modifyLimiter, createInsight);
router.put('/:id', authenticate, modifyLimiter, updateInsight);
router.delete('/:id', authenticate, modifyLimiter, deleteInsight);

module.exports = router;