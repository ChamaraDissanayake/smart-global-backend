import { Router } from 'express';
import {
    createInsight,
    getInsights,
    getInsight,
    updateInsight,
    deleteInsight
} from '../controllers/insights.js';
import authenticate from '../middleware/auth.js';

const router = Router();

router.get('/', getInsights);
router.get('/:id', getInsight);
router.post('/', authenticate, createInsight);
router.put('/:id', authenticate, updateInsight);
router.delete('/:id', authenticate, deleteInsight);

export default router;