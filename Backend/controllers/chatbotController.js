const axios = require('axios');
const ChatConversation = require('../models/ChatConversation');

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// System prompt tailored for Grievance Management System
const SYSTEM_PROMPT = `You are a helpful assistant for a Student Grievance Management System. 
Your role is to help students with:
1. Understanding how to submit a grievance (Academic, Hostel, Transport, or Other issues)
2. Checking the status of their complaints
3. Explaining the grievance redressal process
4. Answering common questions about college facilities, academic issues, etc.
5. Providing guidance on what to include in a grievance

Be polite, professional, and helpful. If a student wants to submit a grievance, guide them to use the grievance form on the dashboard.
If you don't know something, suggest they contact their faculty advisor or use the grievance system.`;

// Send message to OpenRouter AI
const getAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Prepare messages array with system prompt and history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const requestBody = {
      model: 'openrouter/cypher-alpha:free',  // Free model, can be changed
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9
    };

    const response = await axios.post(OPENROUTER_API_URL, requestBody, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://grievance-manager.onrender.com', // Your site URL
        'X-Title': 'Student Grievance Management System'
      }
    });

    if (response.status === 200 && response.data.choices) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from OpenRouter');
    }
  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    
    // Fallback responses if API fails
    if (error.response?.status === 401) {
      return "I'm having trouble authenticating with the AI service. Please check if the API key is configured correctly.";
    } else if (error.response?.status === 429) {
      return "The AI service is currently busy. Please try again in a moment.";
    } else {
      return "I'm currently experiencing technical difficulties. Please try again later or contact support.";
    }
  }
};

// @route   POST /api/chatbot/message
// @desc    Send message to chatbot and get AI response
// @access  Private (logged-in users only)
const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        user: userId
      });
    }

    if (!conversation) {
      conversation = new ChatConversation({
        user: userId,
        messages: []
      });
    }

    // Get conversation history for context (last 10 messages)
    const conversationHistory = conversation.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response
    const aiResponse = await getAIResponse(message, conversationHistory);

    // Save user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Save AI response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId: conversation._id,
      messageCount: conversation.messages.length
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while processing message',
      error: error.message 
    });
  }
};

// @route   GET /api/chatbot/conversations
// @desc    Get all conversations for logged-in user
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await ChatConversation.find({ user: userId })
      .sort({ updatedAt: -1 })
      .select('_id updatedAt messages');

    const conversationList = conversations.map(conv => ({
      id: conv._id,
      lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 100) || 'No messages',
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length
    }));

    res.status(200).json({
      success: true,
      conversations: conversationList
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching conversations'
    });
  }
};

// @route   GET /api/chatbot/conversation/:id
// @desc    Get specific conversation by ID
// @access  Private
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await ChatConversation.findOne({
      _id: id,
      user: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching conversation'
    });
  }
};

// @route   DELETE /api/chatbot/conversation/:id
// @desc    Delete a conversation
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await ChatConversation.deleteOne({
      _id: id,
      user: userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting conversation'
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationById,
  deleteConversation
};