const { Router } = require('express');
const {
    createTeamMember,
    getTeamMembers,
    getTeamMember,
    updateTeamMember,
    deleteTeamMember
} = require('../controllers/team');
const authenticate = require('../middleware/auth');
const upload = require('../config/upload');

const router = Router();

router.post('/', authenticate, createTeamMember);
router.get('/', getTeamMembers);
router.get('/:id', getTeamMember);
router.put('/:id', authenticate, updateTeamMember);
router.delete('/:id', authenticate, deleteTeamMember);

module.exports = router;