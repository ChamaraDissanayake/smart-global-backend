const { Router } = require('express');
const {
    createInsight,
    getInsights,
    getInsight,
    updateInsight,
    deleteInsight
} = require('../controllers/insights');
const authenticate = require('../middleware/auth');

const router = Router();

router.get('/', getInsights);
router.get('/:id', getInsight);
router.post('/', authenticate, createInsight);
router.put('/:id', authenticate, updateInsight);
router.delete('/:id', authenticate, deleteInsight);

module.exports = router;