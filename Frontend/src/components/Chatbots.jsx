import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://final-mse-2-fsd.onrender.com/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation history on open
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/conversations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/conversation/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const conversation = response.data.conversation;
      setMessages(conversation.messages);
      setConversationId(id);
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
  };

  const deleteConversation = async (id) => {
    try {
      await axios.delete(`${API_URL}/chatbot/conversation/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchConversations();
      if (conversationId === id) {
        startNewChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chatbot/message`, 
        { 
          message: userMessage, 
          conversationId: conversationId 
        },
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const botReply = response.data.response;
      setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
      setConversationId(response.data.conversationId);
      
      // Refresh conversation list
      fetchConversations();
      
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const styles = {
    chatButton: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      borderRadius: '30px',
      backgroundColor: '#667eea',
      color: 'white',
      fontSize: '28px',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s'
    },
    chatWindow: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '550px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 5px 40px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1001,
      fontFamily: 'Segoe UI, sans-serif'
    },
    chatHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    chatBody: {
      flex: 1,
      overflowY: 'auto',
      padding: '15px',
      backgroundColor: '#f9fafb'
    },
    message: {
      marginBottom: '12px',
      display: 'flex',
      flexDirection: 'column'
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#667eea',
      color: 'white',
      padding: '10px 14px',
      borderRadius: '18px',
      maxWidth: '80%',
      fontSize: '14px',
      marginLeft: 'auto'
    },
    botMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#e5e7eb',
      color: '#333',
      padding: '10px 14px',
      borderRadius: '18px',
      maxWidth: '80%',
      fontSize: '14px'
    },
    chatFooter: {
      padding: '15px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      gap: '10px',
      backgroundColor: 'white'
    },
    input: {
      flex: 1,
      padding: '10px',
      border: '1px solid #e5e7eb',
      borderRadius: '20px',
      fontSize: '14px',
      outline: 'none'
    },
    sendButton: {
      padding: '8px 20px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    historyButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '12px'
    },
    historyPanel: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '200px',
      height: '100%',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      transform: showHistory ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s',
      zIndex: 1002,
      overflowY: 'auto'
    },
    typing: {
      fontSize: '12px',
      color: '#999',
      padding: '5px 15px'
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          style={styles.chatButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#764ba2'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.chatHeader}>
            <span>🎓 Grievance Assistant</span>
            <div>
              <button 
                onClick={() => setShowHistory(!showHistory)} 
                style={styles.historyButton}
              >
                📋
              </button>
              <button 
                onClick={() => startNewChat()} 
                style={{...styles.historyButton, marginLeft: '5px'}}
              >
                ✨ New
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{...styles.historyButton, marginLeft: '5px'}}
              >
                ✕
              </button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div style={styles.historyPanel}>
              <div style={{ padding: '15px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                Recent Chats
              </div>
              <div>
                {conversations.map(conv => (
                  <div 
                    key={conv.id}
                    style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: conversationId === conv.id ? '#f3f4f6' : 'white'
                    }}
                    onClick={() => loadConversation(conv.id)}
                  >
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      {conv.lastMessage}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#999' }}>
                    No previous chats
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={styles.chatBody} ref={chatBodyRef}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                <span style={{ fontSize: '48px' }}>🎓</span>
                <p>Hi! I'm your Grievance Assistant.</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                  I can help you with:<br/>
                  • Submitting grievances<br/>
                  • Checking complaint status<br/>
                  • Understanding the process<br/>
                  • Answering common questions
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={styles.message}>
                  <div style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div style={styles.typing}>
                <span>🤖 Assistant is typing</span>
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={styles.chatFooter}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about grievances..."
              style={styles.input}
              disabled={isLoading}
            />
            <button type="submit" style={styles.sendButton} disabled={isLoading}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;