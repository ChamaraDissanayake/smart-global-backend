import { Router } from 'express';
import {
  addEmail,
  getEmails,
  removeEmail
} from '../controllers/whitelist.js';
import authenticate from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, addEmail);
router.get('/', authenticate, getEmails);
router.delete('/:email', authenticate, removeEmail);

export default router;