const { Router } = require('express');
const userRoutes = require('./user');
const fileRoutes = require('./files');
const insightRoutes = require('./insights');
const whitelistRoutes = require('./whitelist');
const teamRoutes = require('./team');
const chatRoutes = require('./chat');

const router = Router();

// Routes
router.use('/user', userRoutes);
router.use('/files', fileRoutes);
router.use('/insights', insightRoutes);
router.use('/whitelist', whitelistRoutes);
router.use('/team', teamRoutes);
router.use('/chat', chatRoutes);

// 404 handler
router.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;