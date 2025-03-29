const { Router } = require('express');
const authRoutes = require('./auth');
const fileRoutes = require('./files');
const insightRoutes = require('./insights');
const whitelistRoutes = require('./whitelist');
const teamRoutes = require('./team');
const chatRoutes = require('./chat');

const router = Router();

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/insights', insightRoutes);
router.use('/whitelist', whitelistRoutes);
router.use('/team', teamRoutes);
router.use('/chat', chatRoutes);

module.exports = router;