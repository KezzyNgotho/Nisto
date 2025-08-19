import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FiSend, FiZap, FiUser, FiMessageSquare, FiCpu, FiTrendingUp, FiDollarSign, 
  FiTarget, FiShield, FiSun, FiClock, FiCheck, FiX, FiHeart,
  FiThumbsUp, FiThumbsDown, FiCopy, FiRefreshCw, FiSettings, FiBookOpen
} from 'react-icons/fi';

export default function AIFinancialAssistant() {
  const { user, isAuthenticated, isLoading, sendAIMessage } = useAuth();
  const { showToast } = useNotification();
  const [messages, setMessages] = useState([
    { 
      id: '1',
      type: 'assistant', 
      content: 'Hello! I\'m your AI Financial Assistant. I can help you with budgeting, investment advice, financial planning, and much more. What would you like to know?',
      timestamp: Date.now(),
      reactions: {}
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const quickActions = [
    { icon: <FiDollarSign />, text: 'Budget Analysis', prompt: 'Can you analyze my spending patterns and suggest a budget?' },
    { icon: <FiTrendingUp />, text: 'Investment Advice', prompt: 'What investment strategies would you recommend for my goals?' },
    { icon: <FiTarget />, text: 'Goal Planning', prompt: 'Help me create a financial plan to achieve my goals.' },
    { icon: <FiTrendingUp />, text: 'Portfolio Review', prompt: 'Can you review my current portfolio and suggest improvements?' },
    { icon: <FiShield />, text: 'Risk Assessment', prompt: 'What are the risks in my current financial situation?' },
    { icon: <FiSun />, text: 'Money Saving Tips', prompt: 'Give me some practical tips to save more money.' }
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      reactions: {}
    };
    
    setMessages(msgs => [...msgs, userMessage]);
    setInput('');
    setSending(true);
    setIsTyping(true);

    try {
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Generate AI response
      const aiResponse = generateAIResponse(input.trim());
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        reactions: {}
      };
      
      setMessages(msgs => [...msgs, assistantMessage]);
    } catch (err) {
      showToast({ message: 'Failed to get AI response', type: 'error', icon: <FiMessageSquare /> });
      setMessages(msgs => [...msgs, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
        reactions: {}
      }]);
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('budget') || input.includes('spending')) {
      return "Based on your spending patterns, I recommend creating a 50/30/20 budget: 50% for needs, 30% for wants, and 20% for savings. Would you like me to help you categorize your expenses?";
    } else if (input.includes('invest') || input.includes('portfolio')) {
      return "For investment advice, I'd recommend diversifying across different asset classes. Consider starting with index funds for broad market exposure. What's your risk tolerance and investment timeline?";
    } else if (input.includes('save') || input.includes('money')) {
      return "Great question! Start by tracking all your expenses for a month, then identify areas to cut back. Consider the 1% rule - try to save 1% more each month. Would you like specific tips for your situation?";
    } else if (input.includes('goal') || input.includes('plan')) {
      return "Financial planning starts with clear goals. Let's break this down: What are your short-term (1 year), medium-term (5 years), and long-term (10+ years) financial goals?";
    } else if (input.includes('risk') || input.includes('security')) {
      return "Financial security involves having an emergency fund (3-6 months of expenses), proper insurance, and diversified investments. How much do you currently have saved for emergencies?";
    } else {
      return "I'm here to help with all your financial questions! I can assist with budgeting, investing, saving, debt management, and financial planning. What specific area would you like to focus on?";
    }
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const addReaction = (messageId, reaction) => {
    setMessages(msgs => msgs.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            reactions: { 
              ...msg.reactions, 
              [reaction]: (msg.reactions[reaction] || 0) + 1 
            } 
          }
        : msg
    ));
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    showToast({ message: 'Message copied to clipboard', type: 'success', icon: <FiCopy /> });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Enhanced Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: 48,
          height: 48,
          background: 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(7, 91, 94, 0.3)'
        }}>
          <FiCpu size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1a202c' }}>
            AI Financial Assistant
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#718096', fontSize: '0.9rem' }}>
            Your personal financial advisor powered by AI
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button style={{
            background: 'rgba(7, 91, 94, 0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            color: '#075B5E',
            transition: 'all 0.2s'
          }}>
            <FiSettings size={16} />
          </button>
          <button style={{
            background: 'rgba(7, 91, 94, 0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            color: '#075B5E',
            transition: 'all 0.2s'
          }}>
            <FiBookOpen size={16} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#718096', fontWeight: 600 }}>
          Quick Actions
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem'
        }}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.prompt)}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(7, 91, 94, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#4a5568',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span style={{ color: '#667eea' }}>{action.icon}</span>
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{
        flex: 1,
        padding: '1.5rem 2rem',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              animation: 'slideIn 0.3s ease-out'
            }}>
              {/* Avatar */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: msg.type === 'assistant' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                                 {msg.type === 'assistant' ? <FiCpu size={18} /> : <FiUser size={18} />}
              </div>

              {/* Message Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  background: msg.type === 'assistant' 
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '16px',
                  padding: '1rem 1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: msg.type === 'assistant' 
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(102, 126, 234, 0.2)',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    color: msg.type === 'assistant' ? '#2d3748' : '#4a5568'
                  }}>
                    {msg.content}
                  </div>

                  {/* Message Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#718096'
                    }}>
                      {formatTime(msg.timestamp)}
                    </span>
                    
                    {msg.type === 'assistant' && (
                      <>
                        <button
                          onClick={() => addReaction(msg.id, '👍')}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            color: '#718096',
                            fontSize: '0.8rem'
                          }}
                        >
                          👍 {msg.reactions['👍'] || 0}
                        </button>
                        <button
                          onClick={() => addReaction(msg.id, '👎')}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            color: '#718096',
                            fontSize: '0.8rem'
                          }}
                        >
                          👎 {msg.reactions['👎'] || 0}
                        </button>
                        <button
                          onClick={() => copyMessage(msg.content)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            color: '#718096',
                            fontSize: '0.8rem'
                          }}
                          title="Copy message"
                        >
                          <FiCopy size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
          </div>
        ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}>
                                 <FiCpu size={18} />
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }} />
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'typing 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'typing 1.4s infinite ease-in-out 0.4s'
                  }} />
                </div>
              </div>
            </div>
          )}

        <div ref={chatEndRef} />
        </div>
      </div>

      {/* Enhanced Input */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '1.5rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <form onSubmit={handleSend} style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your finances..."
          disabled={sending || isLoading}
              style={{
                width: '100%',
                minHeight: '50px',
                maxHeight: '120px',
                padding: '0.875rem 1rem',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '12px',
                fontSize: '0.95rem',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={sending || isLoading || !input.trim()}
            style={{
              background: sending || isLoading || !input.trim()
                ? 'rgba(102, 126, 234, 0.3)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.875rem 1.25rem',
              cursor: sending || isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: sending || isLoading || !input.trim()
                ? 'none'
                : '0 4px 12px rgba(102, 126, 234, 0.3)',
              minWidth: '120px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!sending && !isLoading && input.trim()) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!sending && !isLoading && input.trim()) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {sending ? (
              <>
                <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Thinking...
              </>
            ) : (
              <>
                <FiSend size={16} />
                Send
              </>
            )}
        </button>
      </form>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
} 