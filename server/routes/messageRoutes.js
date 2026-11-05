const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getConversations
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations/all', getConversations);
router.get('/:conversationId', getMessages);

module.exports = router;
