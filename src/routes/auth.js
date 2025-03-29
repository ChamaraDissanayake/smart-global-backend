const { Router } = require('express');
const {
    register,
    login,
    requestPasswordReset,
    resetPassword
} = require('../controllers/auth');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;