import { Router } from 'express';
import authRoutes from './auth.js';
import fileRoutes from './files.js';
import insightRoutes from './insights.js';
import whitelistRoutes from './whitelist.js';
import teamRoutes from './team.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/insights', insightRoutes);
router.use('/whitelist', whitelistRoutes);
router.use('/team', teamRoutes);


export default router;