import { Router } from 'express';
import {
    createTeamMember,
    getTeamMembers,
    getTeamMember,
    updateTeamMember,
    deleteTeamMember
} from '../controllers/team.js';
import authenticate from '../middleware/auth.js';
import upload from '../config/upload.js';

const router = Router();

router.post('/', authenticate, upload.single('image'), createTeamMember);
router.get('/', getTeamMembers);
router.get('/:id', getTeamMember);
router.put('/:id', authenticate, upload.single('image'), updateTeamMember);
router.delete('/:id', authenticate, deleteTeamMember);

export default router;