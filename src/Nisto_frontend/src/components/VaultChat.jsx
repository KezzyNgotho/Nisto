import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiMessageCircle, 
  FiSend, 
  FiSmile, 
  FiPaperclip, 
  FiImage, 
  FiFile,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiMoreHorizontal,
  FiEdit3,
  FiTrash2,
  FiReply,
  FiCopy,
  FiUser,
  FiClock,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiUsers,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

function VaultChat({ 
  vaultId, 
  onClose, 
  isExpanded = false, 
  onToggleExpand,
  members = [],
  className = ''
}) {
  const { user, backendService } = useAuth();
  
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  
  // Chat features
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  
  // Message interaction
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // UI state
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  
  // Refs
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!vaultId || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await backendService.getVaultMessages(vaultId);
      if (result.ok) {
        setMessages(result.ok);
        setFilteredMessages(result.ok);
        
        // Auto-scroll to bottom on first load
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Error loading messages');
    } finally {
      setIsLoading(false);
    }
  }, [vaultId, user, backendService]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setReplyingTo(null);
    
    try {
      const messageData = {
        content: messageContent,
        messageType: replyingTo ? 'reply' : 'text',
        replyTo: replyingTo?.id || null,
        vaultId
      };
      
      const result = await backendService.sendVaultMessage(messageData);
      
      if (result.ok) {
        // Add optimistic message
        const optimisticMessage = {
          id: `temp_${Date.now()}`,
          content: messageContent,
          userId: user.principal,
          userName: user.username || 'You',
          timestamp: Date.now(),
          messageType: 'text',
          status: 'sending',
          replyTo: replyingTo,
          reactions: []
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        scrollToBottom();
        
        // Refresh messages to get the real message
        setTimeout(() => loadMessages(), 500);
      } else {
        setError('Failed to send message');
        setNewMessage(messageContent); // Restore message on failure
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message');
      setNewMessage(messageContent); // Restore message on failure
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Send typing indicator to backend (if implemented)
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  // Scroll functions
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isAtBottom);
    
    // Mark messages as read when scrolled to bottom
    if (isAtBottom && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastReadMessageId && lastMessage.userId !== user?.principal) {
        setLastReadMessageId(lastMessage.id);
        setUnreadCount(0);
      }
    }
  };

  // Message search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMessages(messages);
      return;
    }
    
    const filtered = messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase()) ||
      message.userName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  // Message reactions
  const addReaction = async (messageId, emoji) => {
    try {
      const result = await backendService.addMessageReaction(messageId, emoji);
      if (result.ok) {
        loadMessages(); // Refresh to get updated reactions
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Message editing
  const editMessage = async (messageId, newContent) => {
    try {
      const result = await backendService.editVaultMessage(messageId, newContent);
      if (result.ok) {
        setEditingMessage(null);
        loadMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const result = await backendService.deleteVaultMessage(messageId);
      if (result.ok) {
        loadMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // File upload
  const handleFileUpload = async (file) => {
    try {
      // For now, just show file name as message
      // TODO: Implement proper file upload to backend
      const fileMessage = `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      setNewMessage(fileMessage);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending': return <FiClock size={12} className="text-gray-400" />;
      case 'sent': return <FiCheck size={12} className="text-gray-400" />;
      case 'delivered': return <FiCheckCircle size={12} className="text-blue-400" />;
      case 'read': return <FiCheckCircle size={12} className="text-green-400" />;
      case 'failed': return <FiAlertCircle size={12} className="text-red-400" />;
      default: return null;
    }
  };

  // Effects
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === 'Escape') {
      setReplyingTo(null);
      setEditingMessage(null);
      setShowEmojiPicker(false);
    }
  };

  return (
    <div className={`vault-chat ${className}`} style={{
      width: isExpanded ? '450px' : '380px',
      height: '100%',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid rgba(59,130,246,0.1)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FiMessageCircle size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Vault Chat</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
              {members.length} members • {messages.length} messages
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Search messages"
          >
            <FiSearch size={14} />
          </button>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Close chat"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={{
          padding: '0.75rem',
          borderBottom: '1px solid var(--neutral-200)',
          background: 'var(--neutral-50)'
        }}>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--neutral-300)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Online Members */}
      <div style={{
        padding: '0.75rem',
        borderBottom: '1px solid var(--neutral-200)',
        background: 'var(--neutral-50)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <FiUsers size={14} className="text-gray-500" />
          <span style={{ fontSize: '0.75rem', color: 'var(--neutral-600)', fontWeight: 500 }}>
            Online ({onlineUsers.length}):
          </span>
          {members.slice(0, 5).map((member, index) => (
            <div key={member.id || index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              border: '1px solid var(--neutral-300)',
              fontSize: '0.75rem'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                background: '#10B981',
                borderRadius: '50%'
              }} />
              {member.userName || member.name || 'User'}
            </div>
          ))}
          {members.length > 5 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
              +{members.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: 'var(--neutral-500)'
          }}>
            <FiRefreshCw className="animate-spin mr-2" />
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: 'var(--neutral-500)',
            textAlign: 'center'
          }}>
            <FiMessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              {searchQuery ? 'No messages found' : 'No messages yet'}
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
              {searchQuery ? 'Try a different search term' : 'Start the conversation!'}
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isOwnMessage = message.userId === user?.principal;
            const prevMessage = filteredMessages[index - 1];
            const showTimestamp = !prevMessage || 
              new Date(message.timestamp) - new Date(prevMessage.timestamp) > 5 * 60 * 1000; // 5 minutes
            
            return (
              <div key={message.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
              }}>
                {showTimestamp && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--neutral-500)',
                    margin: '0.5rem 0',
                    alignSelf: 'center'
                  }}>
                    {formatMessageTime(message.timestamp)}
                  </div>
                )}
                
                <div
                  style={{
                    maxWidth: '85%',
                    background: isOwnMessage 
                      ? 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)'
                      : 'white',
                    color: isOwnMessage ? 'white' : 'var(--neutral-800)',
                    padding: '0.75rem 1rem',
                    borderRadius: isOwnMessage 
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    border: isOwnMessage ? 'none' : '1px solid var(--neutral-200)',
                    boxShadow: isOwnMessage 
                      ? '0 2px 8px rgba(7, 91, 94, 0.2)'
                      : '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = isOwnMessage 
                      ? '0 4px 12px rgba(7, 91, 94, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = isOwnMessage 
                      ? '0 2px 8px rgba(7, 91, 94, 0.2)'
                      : '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  {!isOwnMessage && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '0.25rem',
                      color: '#075B5E'
                    }}>
                      {message.userName}
                    </div>
                  )}
                  
                  {message.replyTo && (
                    <div style={{
                      background: 'rgba(0,0,0,0.05)',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      fontSize: '0.75rem',
                      borderLeft: '3px solid #075B5E'
                    }}>
                      Replying to: {message.replyTo.content?.substring(0, 50)}...
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    {message.content}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    opacity: 0.7
                  }}>
                    <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                    {isOwnMessage && getMessageStatusIcon(message.status)}
                  </div>
                  
                  {/* Message reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '0.25rem',
                      marginTop: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {message.reactions.map((reaction, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'rgba(0,0,0,0.05)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addReaction(message.id, reaction.reaction);
                          }}
                        >
                          {reaction.reaction} {reaction.count || 1}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Message Actions */}
                {selectedMessage === message.id && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--neutral-200)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <button
                      onClick={() => setReplyingTo(message)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem'
                      }}
                      title="Reply"
                    >
                      <FiReply size={12} /> Reply
                    </button>
                    <button
                      onClick={() => addReaction(message.id, '👍')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      title="React"
                    >
                      <FiSmile size={12} />
                    </button>
                    {isOwnMessage && (
                      <>
                        <button
                          onClick={() => setEditingMessage(message)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                          title="Edit"
                        >
                          <FiEdit3 size={12} />
                        </button>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            color: 'var(--error-500)'
                          }}
                          title="Delete"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--neutral-500)',
            fontStyle: 'italic'
          }}>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'var(--error-50)',
          border: '1px solid var(--error-200)',
          color: 'var(--error-700)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error-500)',
              cursor: 'pointer'
            }}
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Reply Banner */}
      {replyingTo && (
        <div style={{
          padding: '0.75rem',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          color: 'var(--primary-700)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <FiReply size={14} style={{ marginRight: '0.5rem' }} />
            Replying to {replyingTo.userName}: {replyingTo.content.substring(0, 30)}...
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-500)',
              cursor: 'pointer'
            }}
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--neutral-200)',
        background: 'white'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end'
        }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            style={{ display: 'none' }}
            accept="image/*,application/pdf,text/*"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'var(--neutral-100)',
              border: '1px solid var(--neutral-300)',
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--neutral-600)'
            }}
            title="Attach file"
          >
            <FiPaperclip size={16} />
          </button>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                width: '100%',
                minHeight: '44px',
                maxHeight: '120px',
                padding: '0.75rem 1rem',
                border: '1px solid var(--neutral-300)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              rows={1}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            style={{
              background: newMessage.trim() 
                ? 'linear-gradient(135deg, #075B5E 0%, #1C352D 100%)'
                : 'var(--neutral-300)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
            title="Send message"
          >
            {isSending ? (
              <FiRefreshCw size={16} className="animate-spin" />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </div>
        
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--neutral-500)',
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          style={{
            position: 'absolute',
            bottom: '100px',
            right: '20px',
            background: '#075B5E',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10
          }}
          title="Scroll to bottom"
        >
          <FiChevronDown size={18} />
        </button>
      )}

      {/* Styles for typing animation */}
      <style>{`
        .typing-indicator {
          display: flex;
          gap: 2px;
        }
        
        .typing-indicator span {
          width: 4px;
          height: 4px;
          background: var(--neutral-400);
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
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

export default VaultChat;
