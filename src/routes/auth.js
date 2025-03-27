import { Router } from 'express';
import {
    register,
    login,
    requestPasswordReset,
    resetPassword
} from '../controllers/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;