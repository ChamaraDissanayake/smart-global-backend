const { Router } = require('express');
const {
  addEmail,
  getEmails,
  removeEmail
} = require('../controllers/whitelist');
const authenticate = require('../middleware/auth');

const router = Router();

router.post('/', authenticate, addEmail);
router.get('/', authenticate, getEmails);
router.delete('/:email', authenticate, removeEmail);

module.exports = router;