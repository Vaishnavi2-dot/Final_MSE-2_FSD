const axios = require('axios');
const ChatConversation = require('../models/ChatConversation');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// System prompt for grievance management
const SYSTEM_PROMPT = `You are a helpful assistant for a Student Grievance Management System. 
Your role is to help students with:
1. Understanding how to submit a grievance (Academic, Hostel, Transport, or Other issues)
2. Checking the status of their complaints
3. Explaining the grievance redressal process
4. Answering common questions about college facilities

Be polite, professional, and helpful. Keep responses concise (under 150 words).`;

// Get AI response from OpenRouter
const getAIResponse = async (userMessage, conversationHistory = []) => {
  if (!OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not set');
    return "I'm having trouble connecting to the AI service. Please contact support.";
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    console.log('🤖 Calling OpenRouter API with model: openrouter/free');
    
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openrouter/free',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-grievance-manager.onrender.com',
          'X-Title': 'Student Grievance Management System'
        },
        timeout: 30000
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      const aiMessage = response.data.choices[0].message.content;
      console.log('✅ AI Response received');
      return aiMessage;
    } else {
      console.log('⚠️ No content in response');
      return "I understand your question. Could you please provide more details so I can help you better?";
    }

  } catch (error) {
    console.error('❌ OpenRouter Error:', error.response?.data?.error?.message || error.message);
    return "I'm currently experiencing technical difficulties. Please try again later or contact support for assistance with your grievance.";
  }
};

// Send message to chatbot
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

    // Get conversation history (last 10 messages for context)
    const history = conversation.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response
    const aiResponse = await getAIResponse(message, history);

    // Save messages
    conversation.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    );
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
      message: 'Failed to get AI response. Please try again.',
      error: error.message 
    });
  }
};

// Get all conversations for logged-in user
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

// Get specific conversation by ID
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

// Delete conversation
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