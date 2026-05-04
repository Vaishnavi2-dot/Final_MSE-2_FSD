const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  sendMessage,
  getConversations,
  getConversationById,
  deleteConversation
} = require('../controllers/chatbotController');

// All chatbot routes are protected (require login)
router.use(authMiddleware);

// Chat endpoints
router.post('/message', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:id', getConversationById);
router.delete('/conversation/:id', deleteConversation);

module.exports = router;