import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import BackendService from '../services/BackendService';
import { 
  FiUsers, FiPlus, FiDollarSign, FiTarget, FiTrendingUp, FiCheck, FiX, FiLock, FiUnlock, 
  FiEdit2, FiTrash2, FiUserPlus, FiEye, FiChevronDown, FiChevronUp, FiShield, FiArrowDownCircle, FiArrowUpCircle, 
  FiList, FiSend, FiChevronLeft, FiGlobe, FiMessageCircle, FiMoreVertical, FiSmile, FiPaperclip, FiSearch, FiBell, FiSettings
} from 'react-icons/fi';
import { AiFillCrown } from 'react-icons/ai';

export default function VaultDetails({ vault, details, onBack, user, showToast }) {
  const { theme } = useTheme();
  // Create BackendService instance
  const backendService = React.useRef(new BackendService()).current;
  
  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }
        50% {
          opacity: 0.8;
          transform: translateX(-50%) scale(1.05);
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { 
    depositToVault, withdrawFromVault, editGroupVault, deleteGroupVault, 
    inviteVaultMember, removeVaultMember, changeVaultMemberRole, toggleVaultPrivacy
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [editForm, setEditForm] = useState({
    name: vault?.name || '',
    description: vault?.description || '',
    currency: vault?.currency || '',
    targetAmount: vault?.targetAmount || '',
    isPublic: vault?.isPublic || false
  });
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize BackendService
  useEffect(() => {
    const initBackend = async () => {
      try {
        await backendService.init();
      } catch (error) {
        console.error('Failed to initialize backend service:', error);
      }
    };
    initBackend();
  }, [backendService]);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const chatContainerRef = useRef(null);

  const isOwner = vault?.ownerId === user?.principal;
  const isAdmin = details?.members?.some(m => m.userId === user?.principal && m.role === 'admin');

  // Load real chat messages from backend
  useEffect(() => {
    if (showChat && vault?.id && user?.username) {
      const loadMessages = async () => {
        try {
          console.log('Loading messages for vault:', vault.id);
          console.log('Current user:', user);
          console.log('User principal:', user?.id);
          
          // Load messages directly (vault members are automatically added to chat)
          const result = await backendService.getVaultMessages(vault.id, 50, 0);
          if (result.ok) {
            setChatMessages(result.ok);
          } else {
            console.error('Failed to load messages:', result.err);
            showToast('Failed to load chat messages', 'error');
          }
        } catch (error) {
          console.error('Error loading messages:', error);
          showToast('Error loading chat messages', 'error');
        }
      };
      
      loadMessages();
      
      // Refresh messages every 5 seconds for real-time updates
      const interval = setInterval(loadMessages, 5000);
      
      return () => clearInterval(interval);
    }
  }, [showChat, vault?.id, user?.username, showToast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && chatMessages.length > 0) {
      const scrollToBottom = () => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      };
      
      // Use setTimeout to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
      
      // Update unread count for new messages
      if (lastReadMessageId && chatMessages.length > 0) {
        const lastMessageId = chatMessages[chatMessages.length - 1].id;
        if (lastMessageId !== lastReadMessageId) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
  }, [chatMessages, lastReadMessageId]);

  // Simulate typing indicators
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
        setTypingUsers(prev => prev.filter(u => u !== user?.principal));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping, user]);

  // Load real typing indicators from backend
  useEffect(() => {
    if (showChat && vault?.id) {
      const loadTypingIndicators = async () => {
        try {
          const result = await backendService.getTypingIndicators(vault.id);
          if (result.ok) {
            const typingUserIds = result.ok
              .filter(indicator => indicator.isTyping && indicator.userId !== user?.principal)
              .map(indicator => indicator.userId);
            setTypingUsers(typingUserIds);
          }
        } catch (error) {
          console.error('Error loading typing indicators:', error);
        }
      };
      
      // Load typing indicators every 2 seconds
      const interval = setInterval(loadTypingIndicators, 2000);
      loadTypingIndicators(); // Load immediately
      
      return () => clearInterval(interval);
    }
  }, [showChat, vault?.id, user?.principal]);

  // Handle scroll events
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
      
      // Mark messages as read when scrolling near bottom
      if (isNearBottom && unreadCount > 0) {
        setUnreadCount(0);
        if (chatMessages.length > 0) {
          setLastReadMessageId(chatMessages[chatMessages.length - 1].id);
          
          // Mark messages as read on backend
          if (vault?.id) {
            const messageIds = chatMessages.map(msg => msg.id);
            backendService.markMessagesAsRead(vault.id, messageIds).catch(error => {
              console.error('Error marking messages as read:', error);
            });
          }
        }
      }
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, [showChat, unreadCount, chatMessages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await depositToVault(vault.id, parseFloat(depositAmount), depositDesc);
      if (result.ok) {
        setShowDeposit(false);
        setDepositAmount('');
        setDepositDesc('');
        showToast({ message: 'Deposit successful!', type: 'success', icon: <FiCheck /> });
        onBack();
      } else {
        setError(result.err || 'Failed to deposit');
      }
    } catch (err) {
      setError('Failed to deposit');
      showToast({ message: 'Deposit failed', type: 'error', icon: <FiX /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await withdrawFromVault(vault.id, parseFloat(withdrawAmount), withdrawDesc);
      if (result.ok) {
        setShowWithdraw(false);
        setWithdrawAmount('');
        setWithdrawDesc('');
        showToast({ message: 'Withdrawal successful!', type: 'success', icon: <FiCheck /> });
        onBack();
      } else {
        setError(result.err || 'Failed to withdraw');
      }
    } catch (err) {
      setError('Failed to withdraw');
      showToast({ message: 'Withdrawal failed', type: 'error', icon: <FiX /> });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && vault?.id) {
      try {
        const result = await backendService.sendVaultMessage(
          vault.id, 
          newMessage.trim(), 
          'Text', 
          null
        );
        
        if (result.ok) {
          // Add the new message to the chat
          setChatMessages(prev => [...prev, result.ok]);
      setNewMessage('');
      setIsTyping(false);
      setTypingUsers(prev => prev.filter(u => u !== user?.principal));
        } else {
          console.error('Failed to send message:', result.err);
          showToast('Failed to send message', 'error');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        showToast('Error sending message', 'error');
      }
    }
  };

  const handleTyping = async (e) => {
    setNewMessage(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTypingUsers(prev => [...prev, user?.principal]);
      
      // Update typing status on backend
      if (vault?.id) {
        try {
          await backendService.updateTypingStatus(vault.id, true);
        } catch (error) {
          console.error('Error updating typing status:', error);
        }
      }
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      setTypingUsers(prev => prev.filter(u => u !== user?.principal));
      
      // Update typing status on backend
      if (vault?.id) {
        try {
          await backendService.updateTypingStatus(vault.id, false);
        } catch (error) {
          console.error('Error updating typing status:', error);
        }
      }
    }
  };

  const formatTime = (timestamp) => {
    // Convert BigInt nanoseconds to milliseconds
    let timestampMs;
    if (typeof timestamp === 'bigint') {
      timestampMs = Number(timestamp) / 1000000; // Convert nanoseconds to milliseconds
    } else if (typeof timestamp === 'string' && timestamp.endsWith('n')) {
      timestampMs = parseInt(timestamp.slice(0, -1)) / 1000000; // Remove 'n' and convert
    } else {
      timestampMs = timestamp;
    }
    
    const date = new Date(timestampMs);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (timestamp) => {
    // Convert BigInt nanoseconds to milliseconds
    let timestampMs;
    if (typeof timestamp === 'bigint') {
      timestampMs = Number(timestamp) / 1000000; // Convert nanoseconds to milliseconds
    } else if (typeof timestamp === 'string' && timestamp.endsWith('n')) {
      timestampMs = parseInt(timestamp.slice(0, -1)) / 1000000; // Remove 'n' and convert
    } else {
      timestampMs = timestamp;
    }
    
    const date = new Date(timestampMs);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserAvatar = (userId) => {
    const colors = [theme.colors.primary, theme.colors.success, theme.colors.warning, theme.colors.error, theme.colors.info, theme.colors.primary];
    // Handle undefined/null userId
    if (!userId) return colors[0];
    const colorIndex = userId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

  const addReaction = (messageId, reaction) => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: { ...msg.reactions, [reaction]: (msg.reactions?.[reaction] || 0) + 1 } }
        : msg
    ));
  };

  const formatMessage = (message) => {
    // Handle undefined/null message
    if (!message) return '';
    
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = message.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="vault-details-container" style={{ 
      width: '100%', 
      height: '100vh', 
                      background: `linear-gradient(135deg, ${theme.colors.success}10 0%, ${theme.colors.success}05 100%)`,
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Enhanced Header */}
      <div style={{ 
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
        color: 'white',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(7, 91, 94, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              borderRadius: '50%', 
              width: 36, 
              height: 36, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
          >
            <FiChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, lineHeight: '1.2' }}>{vault?.name}</h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.85rem', lineHeight: '1.3' }}>{vault?.description}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowChat(!showChat)}
            style={{ 
              background: showChat ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: 8, 
              padding: '0.5rem 1rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              boxShadow: showChat ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = showChat ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
          >
            <FiMessageCircle size={16} />
            Chat {showChat && '•'}
          </button>
          {isOwner && (
            <button 
              onClick={() => setShowEdit(true)}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                borderRadius: 8, 
                padding: '0.5rem 1rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
              <FiEdit2 size={16} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div style={{ display: 'flex', height: 'calc(100vh - 90px)' }}>
        {/* Left Panel - Main Content */}
        <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
          {/* Enhanced Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '2rem', 
            borderBottom: '2px solid rgba(59,130,246,0.1)',
            paddingBottom: '0.5rem'
          }}>
            {['overview', 'members', 'transactions', 'governance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                style={{
                                  background: activeTab === tab ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)` : 'transparent',
                color: activeTab === tab ? theme.colors.white : theme.colors.text.secondary,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px 12px 0 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                {tab === 'overview' && <FiEye size={16} style={{ marginRight: '0.5rem' }} />}
                {tab === 'members' && <FiUsers size={16} style={{ marginRight: '0.5rem' }} />}
                {tab === 'transactions' && <FiList size={16} style={{ marginRight: '0.5rem' }} />}
                {tab === 'governance' && <FiShield size={16} style={{ marginRight: '0.5rem' }} />}
                {tab}
              </button>
            ))}
          </div>

          {/* Enhanced Tab Content */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Enhanced Vault Stats */}
              <div className="vault-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white
                  }}>
                    <FiTrendingUp size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: theme.colors.text.primary }}>Vault Statistics</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Real-time vault metrics</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="vault-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>Total Balance</span>
                      <span className="status-badge success">
                        {vault?.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.colors.success }}>
                      {vault?.totalBalance || 0} {vault?.currency}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.text.secondary, marginTop: '0.25rem' }}>
                      Available for transactions
                    </div>
                  </div>
                  
                  <div className="vault-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>Target Amount</span>
                      <FiTarget size={16} color={theme.colors.text.secondary} />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.colors.text.primary }}>
                      {vault?.targetAmount || 'N/A'} {vault?.currency}
                  </div>
                    {vault?.targetAmount && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: theme.colors.text.secondary, marginBottom: '0.25rem' }}>
                          <span>Progress</span>
                          <span>{Math.round((vault?.totalBalance / vault?.targetAmount) * 100)}%</span>
                  </div>
                        <div style={{ 
                          background: theme.colors.border.primary, 
                          height: '6px', 
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div 
                            className="progress-bar"
                            style={{ 
                              width: `${Math.min((vault?.totalBalance / vault?.targetAmount) * 100, 100)}%`,
                              height: '100%'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="vault-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>Members</span>
                      <FiUsers size={16} color={theme.colors.text.secondary} />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.colors.text.primary }}>
                      {details?.ok?.members?.length || details?.members?.length || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.text.secondary, marginTop: '0.25rem' }}>
                      Active participants
                    </div>
                  </div>
                  
                  <div className="vault-stat">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: theme.colors.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>Status</span>
                      {vault?.isPublic ? <FiUnlock size={16} color={theme.colors.success} /> : <FiLock size={16} color={theme.colors.warning} />}
                    </div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      color: vault?.isPublic ? theme.colors.success : theme.colors.warning,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {vault?.isPublic ? 'Public' : 'Private'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.text.secondary, marginTop: '0.25rem' }}>
                      {vault?.isPublic ? 'Anyone can join' : 'Invitation only'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Actions */}
              <div className="vault-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <FiPlus size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: theme.colors.text.primary }}>Quick Actions</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.text.secondary, fontSize: '0.9rem' }}>Manage your vault</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowDeposit(true)}
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      background: 'rgba(255,255,255,0.2)',  
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    <FiArrowDownCircle size={16} />
                    </div>
                    <span>Deposit Funds</span>
                  </button>
                  <button 
                    onClick={() => setShowWithdraw(true)}
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.warning} 0%, ${theme.colors.warning}dd 100%)`,
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    <FiArrowUpCircle size={16} />
                    </div>
                    <span>Withdraw Funds</span>
                  </button>
                  <button 
                    onClick={() => setShowInvite(true)}
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiUserPlus size={16} />
                    </div>
                    <span>Invite Member</span>
                  </button>
                  
                  {/* Additional Actions */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    <button 
                      onClick={() => setShowChat(!showChat)}
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                      padding: '0.75rem', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <FiMessageCircle size={16} />
                      Chat
                    </button>
                    <button 
                      onClick={() => setShowEdit(true)}
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.colors.text.secondary} 0%, ${theme.colors.text.secondary}dd 100%)`,
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        padding: '0.75rem', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <FiSettings size={16} />
                      Settings
                  </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="vault-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: `linear-gradient(135deg, ${theme.colors.warning} 0%, ${theme.colors.warning}dd 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <FiUsers size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: theme.colors.text.primary }}>Vault Members</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.text.secondary, fontSize: '0.9rem' }}>
                      {(details?.ok?.members || details?.members || []).length} active members
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInvite(true)}
                  className="btn-primary"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    padding: '0.75rem 1.25rem'
                  }}
                >
                  <FiUserPlus size={16} />
                  Invite Member
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {(details?.ok?.members || details?.members || []).map(member => (
                  <div key={member.id} className="member-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                          width: 48, 
                          height: 48, 
                        borderRadius: '50%', 
                                                background: member.role === 'owner' ? `linear-gradient(135deg, ${theme.colors.warning} 0%, ${theme.colors.warning}dd 100%)` :
                        member.role === 'admin' ? `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)` :
                        `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                          {member.role === 'owner' ? <AiFillCrown size={20} /> : 
                           member.role === 'admin' ? <FiShield size={20} /> : <FiUsers size={20} />}
                      </div>
                      <div>
                          <div style={{ 
                            fontWeight: 600, 
                            color: theme.colors.text.primary,
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                          {member.userId === user?.principal ? 'You' : `User ${member.userId.toString().slice(0, 8)}...`}
                            {member.userId === user?.principal && (
                              <span style={{
                                background: theme.colors.success,
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}>
                                YOU
                              </span>
                            )}
                        </div>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: theme.colors.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>Joined {formatDate(member.joinedAt)}</span>
                            <span>•</span>
                    <span style={{ 
                              background: member.role === 'owner' ? 'rgba(251, 191, 36, 0.1)' : 
                                        member.role === 'admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: member.role === 'owner' ? theme.colors.warning : 
                                     member.role === 'admin' ? theme.colors.success : theme.colors.primary,
                              padding: '0.125rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'   
                    }}>
                      {member.role}
                    </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          style={{
                            background: `rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, 0.1)`,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: theme.colors.primary,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = `rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, 0.2)`}
                          onMouseLeave={(e) => e.target.style.background = `rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, 0.1)`}
                          title="View Profile"
                        >
                          <FiEye size={16} />
                        </button>
                        {(isOwner || isAdmin) && member.role !== 'owner' && (
                          <button
                            style={{
                              background: `rgba(${theme.colors.error.r}, ${theme.colors.error.g}, ${theme.colors.error.b}, 0.1)`,
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              color: theme.colors.error,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = `rgba(${theme.colors.error.r}, ${theme.colors.error.g}, ${theme.colors.error.b}, 0.2)`}
                            onMouseLeave={(e) => e.target.style.background = `rgba(${theme.colors.error.r}, ${theme.colors.error.g}, ${theme.colors.error.b}, 0.1)`}
                            title="Remove Member"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-700)' }}>Transaction History</h3>
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-500)' }}>
                <FiList size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No transactions yet</p>
                <p style={{ fontSize: '0.9rem' }}>Transactions will appear here when members deposit or withdraw</p>
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-700)' }}>Governance</h3>
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-500)' }}>
                <FiShield size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No proposals yet</p>
                <p style={{ fontSize: '0.9rem' }}>Proposals will appear here when members suggest changes</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Right Panel - Chat */}
        {showChat && (
          <div style={{ 
            width: chatExpanded ? '450px' : '380px', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
            borderLeft: '1px solid rgba(59,130,246,0.1)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            animation: 'slideInRight 0.3s ease-out'
          }}>
            {/* Enhanced Chat Header */}
            <div style={{ 
              padding: '1.25rem', 
              borderBottom: '1px solid rgba(59,130,246,0.1)',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiMessageCircle size={20} />
                </div>
              <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Vault Chat</h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                    {details?.ok?.members?.length || details?.members?.length || 0} members • {chatMessages.length} messages
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setChatExpanded(!chatExpanded)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.5rem',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={chatExpanded ? 'Collapse' : 'Expand'}
                >
                  {chatExpanded ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.5rem',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
            
            {/* Online Members */}
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderBottom: '1px solid var(--neutral-100)',
              background: 'var(--neutral-50)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', fontWeight: 600 }}>Online:</span>
                {(details?.ok?.members || details?.members || []).slice(0, 3).map((member, index) => (
                  <div key={member.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    background: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 12,
                    border: '1px solid var(--neutral-200)'
                  }}>
                    <div style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'var(--success-500)',
                      marginRight: '0.25rem'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-700)' }}>
                      {member.userId === user?.principal ? 'You' : `User ${index + 1}`}
                    </span>
                  </div>
                ))}
                {(details?.ok?.members || details?.members || []).length > 3 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                    +{(details?.ok?.members || details?.members || []).length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              style={{ 
                flex: 1, 
                padding: '1rem', 
                overflowY: 'auto',
                overflowX: 'hidden',
                background: 'var(--neutral-25)',
                maxHeight: 'calc(100vh - 300px)',
                scrollBehavior: 'smooth',
                position: 'relative'
              }}
            >
              {/* Scroll to Bottom Button */}
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: unreadCount > 0 ? 'var(--warning-500)' : 'var(--primary-500)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <FiChevronDown size={16} />
                  {unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: 'var(--error-500)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      border: '2px solid white'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
              )}
              
              {/* New Messages Indicator */}
              {unreadCount > 0 && !showScrollButton && (
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--warning-500)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  zIndex: 10,
                  animation: 'pulse 2s infinite'
                }}
                onClick={scrollToBottom}
                >
                  {unreadCount} new message{unreadCount > 1 ? 's' : ''} ↓
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                 {chatMessages.map((message, index) => (
                   <div key={message.id || index} style={{ 
                     display: 'flex',
                     flexDirection: message.userId === user?.principal ? 'row-reverse' : 'row',
                     gap: '0.75rem',
                     opacity: (message.messageType === 'System' || message.type === 'system') ? 0.7 : 1
                   }}>
                    {/* Avatar */}
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      background: (message.messageType === 'System' || message.type === 'system') ? 'var(--neutral-300)' : getUserAvatar(message.userId),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {(message.messageType === 'System' || message.type === 'system') ? '⚙️' : message.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    
                    {/* Message Content */}
                    <div style={{ 
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      {(message.messageType !== 'System' && message.type !== 'system') && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          justifyContent: message.userId === user?.principal ? 'flex-end' : 'flex-start'
                        }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            color: message.userId === user?.principal ? 'var(--primary-600)' : 'var(--neutral-600)'
                          }}>
                            {message.userName}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--neutral-500)' }}>
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                                             <div style={{ 
                         background: (message.messageType === 'System' || message.type === 'system') ? 'var(--neutral-200)' :
                                   message.userId === user?.principal ? 'var(--primary-500)' : 'white',
                         color: (message.messageType === 'System' || message.type === 'system') ? 'var(--neutral-700)' :
                                message.userId === user?.principal ? 'white' : 'var(--neutral-800)',
                         padding: (message.messageType === 'System' || message.type === 'system') ? '0.5rem 0.75rem' : '0.75rem 1rem',
                         borderRadius: (message.messageType === 'System' || message.type === 'system') ? 8 : 12,
                         fontSize: '0.9rem',
                         border: (message.messageType !== 'System' && message.type !== 'system') && message.userId !== user?.principal ? '1px solid var(--neutral-200)' : 'none',
                         boxShadow: (message.messageType !== 'System' && message.type !== 'system') ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                         position: 'relative'
                       }}>
                         <div style={{ lineHeight: '1.4' }}>
                           {formatMessage(message.content || message.message || '')}
                         </div>
                         
                         {/* Message Reactions */}
                         {message.reactions && Object.keys(message.reactions).length > 0 && (
                           <div style={{ 
                             display: 'flex', 
                             gap: '0.25rem', 
                             marginTop: '0.5rem',
                             flexWrap: 'wrap'
                           }}>
                             {Object.entries(message.reactions).map(([reaction, count]) => (
                               <button
                                 key={reaction}
                                 onClick={() => addReaction(message.id, reaction)}
                                 style={{
                                   background: 'rgba(255,255,255,0.2)',
                                   border: 'none',
                                   borderRadius: 12,
                                   padding: '0.25rem 0.5rem',
                                   fontSize: '0.75rem',
                                   cursor: 'pointer',
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: '0.25rem',
                                   color: 'inherit'
                                 }}
                               >
                                 <span>{reaction}</span>
                                 <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{count}</span>
                               </button>
                             ))}
                           </div>
                         )}
                         
                         {/* Reaction Button */}
                         {message.type !== 'system' && (
                           <button
                             onClick={() => addReaction(message.id, '👍')}
                             style={{
                               position: 'absolute',
                               top: '0.25rem',
                               right: '0.25rem',
                               background: 'rgba(255,255,255,0.1)',
                               border: 'none',
                               borderRadius: 4,
                               padding: '0.25rem',
                               cursor: 'pointer',
                               opacity: 0,
                               transition: 'opacity 0.2s',
                               fontSize: '0.8rem'
                             }}
                             onMouseEnter={(e) => e.target.style.opacity = '1'}
                             onMouseLeave={(e) => e.target.style.opacity = '0'}
                           >
                             👍
                           </button>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div style={{ 
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-end',
                    padding: '0.5rem 0'
                  }}>
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      background: 'var(--neutral-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '0.8rem' }}>👤</span>
                    </div>
                    <div style={{ 
                      background: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: 12,
                      border: '1px solid var(--neutral-200)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <div style={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          background: 'var(--neutral-400)',
                          animation: 'typing 1.4s infinite ease-in-out'
                        }} />
                        <div style={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          background: 'var(--neutral-400)',
                          animation: 'typing 1.4s infinite ease-in-out 0.2s'
                        }} />
                        <div style={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          background: 'var(--neutral-400)',
                          animation: 'typing 1.4s infinite ease-in-out 0.4s'
                        }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Chat Input */}
            <form onSubmit={handleSendMessage} style={{ 
              padding: '1.25rem', 
              borderTop: '1px solid rgba(59,130,246,0.1)',
              background: 'white',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1 }}>
                  <textarea
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="chat-input"
                    style={{ 
                      width: '100%', 
                      minHeight: '44px',
                      maxHeight: '120px',
                      padding: '0.875rem 1rem', 
                      border: '1px solid rgba(59,130,246,0.1)', 
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      resize: 'none',
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: `linear-gradient(135deg, ${theme.colors.white} 0%, ${theme.colors.white} 100%)`,
                      transition: 'all 0.3s ease'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{ 
                    background: newMessage.trim() ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)` : theme.colors.border.primary, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    padding: '0.875rem',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: newMessage.trim() ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                    width: '44px',
                    height: '44px'
                  }}
                  onMouseEnter={(e) => newMessage.trim() && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => newMessage.trim() && (e.target.style.transform = 'translateY(0)')}
                >
                  <FiSend size={18} />
                </button>
              </div>
              
                             {/* Enhanced Quick Actions */}
               <div style={{ 
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(3, 1fr)',
                 gap: '0.75rem', 
                 marginTop: '1rem'
               }}>
                 <button
                   type="button"
                   onClick={() => setNewMessage(prev => prev + '💰')}
                   style={{
                     background: 'rgba(16, 185, 129, 0.1)',
                     color: theme.colors.success,
                     border: '1px solid rgba(16, 185, 129, 0.2)',
                     borderRadius: '10px',
                     padding: '0.75rem 0.5rem',
                     fontSize: '0.75rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     fontWeight: 600,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '0.25rem',
                     minHeight: '60px',
                     justifyContent: 'center'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(16, 185, 129, 0.15)';
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   <span style={{ fontSize: '1.2rem' }}>💰</span>
                   <span>Deposit</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setNewMessage(prev => prev + '📊')}
                   style={{
                     background: 'rgba(59, 130, 246, 0.1)',
                     color: theme.colors.primary,
                     border: '1px solid rgba(59, 130, 246, 0.2)',
                     borderRadius: '10px',
                     padding: '0.75rem 0.5rem',
                     fontSize: '0.75rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     fontWeight: 600,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '0.25rem',
                     minHeight: '60px',
                     justifyContent: 'center'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(59, 130, 246, 0.15)';
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   <span style={{ fontSize: '1.2rem' }}>📊</span>
                   <span>Stats</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setNewMessage(prev => prev + '🎯')}
                   style={{
                     background: 'rgba(245, 158, 11, 0.1)',
                     color: theme.colors.warning,
                     border: '1px solid rgba(245, 158, 11, 0.2)',
                     borderRadius: '10px',
                     padding: '0.75rem 0.5rem',
                     fontSize: '0.75rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     fontWeight: 600,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '0.25rem',
                     minHeight: '60px',
                     justifyContent: 'center'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(245, 158, 11, 0.15)';
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'rgba(245, 158, 11, 0.1)';
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   <span style={{ fontSize: '1.2rem' }}>🎯</span>
                   <span>Goal</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setNewMessage(prev => prev + '🎉')}
                   style={{
                     background: 'rgba(139, 92, 246, 0.1)',color: theme.colors.primary,
                     border: '1px solid rgba(139, 92, 246, 0.2)',
                     borderRadius: '10px',
                     padding: '0.75rem 0.5rem',
                     fontSize: '0.75rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     fontWeight: 600,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '0.25rem',
                     minHeight: '60px',
                     justifyContent: 'center'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   <span style={{ fontSize: '1.2rem' }}>🎉</span>
                   <span>Celebrate</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setNewMessage(prev => prev + '📝')}
                   style={{
                     background: 'rgba(107, 114, 128, 0.1)',
                     color: theme.colors.text.secondary,
                     border: '1px solid rgba(107, 114, 128, 0.2)',
                     borderRadius: '10px',
                     padding: '0.75rem 0.5rem',
                     fontSize: '0.75rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     fontWeight: 600,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '0.25rem',
                     minHeight: '60px',
                     justifyContent: 'center'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(107, 114, 128, 0.15)';
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.2)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   <span style={{ fontSize: '1.2rem' }}>📝</span>
                   <span>Note</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setNewMessage(prev => prev + '🔥')}
                   style={{
                     background: 'rgba(239, 68, 68, 0.1)',
                     color: '#dc2626',
                     border: '1px solid rgba(239, 68, 68, 0.2)',
                     borderRadius: '10px',
                     padding: '0.75rem 0.5rem',
                     fontSize: '0.75rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     fontWeight: 600,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '0.25rem',
                     minHeight: '60px',
                     justifyContent: 'center'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = 'none';
                   }}
                 >
                   <span style={{ fontSize: '1.2rem' }}>🔥</span>
                   <span>Hot</span>
                 </button>
               </div>
            </form>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Deposit Modal */}
      {showDeposit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowDeposit(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleDeposit} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowDeposit(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
              }}>
                <FiArrowDownCircle size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-800)' }}>Deposit to Vault</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Add funds to <strong>{vault?.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Amount *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--neutral-500)',
                    fontWeight: 600
                  }}>
                    {vault?.currency}
                  </span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={depositAmount} 
                    onChange={e => setDepositAmount(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 12,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--success-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Description (Optional)</label>
                <textarea 
                  placeholder="What is this deposit for?" 
                  value={depositDesc} 
                  onChange={e => setDepositDesc(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 80,
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--success-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div style={{
                background: 'var(--success-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--success-200)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Current Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-700)' }}>
                    {vault?.totalBalance} {vault?.currency}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>New Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-700)' }}>
                    {depositAmount ? (parseFloat(vault?.totalBalance || 0) + parseFloat(depositAmount)).toFixed(2) : vault?.totalBalance} {vault?.currency}
                  </span>
                </div>
              </div>
            </div>
            
            {error && (
              <div style={{
                background: 'var(--error-50)',
                color: 'var(--error-700)',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                border: '1px solid var(--error-200)',
                fontSize: '0.9rem',
                marginTop: '1rem'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowDeposit(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || !depositAmount}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting || !depositAmount ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--success-500), var(--success-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting || !depositAmount ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting || !depositAmount ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && depositAmount && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && depositAmount && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Depositing...' : 'Deposit Funds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowWithdraw(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleWithdraw} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowWithdraw(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}>
                <FiArrowUpCircle size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-800)' }}>Withdraw from Vault</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Remove funds from <strong>{vault?.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Amount *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--neutral-500)',
                    fontWeight: 600
                  }}>
                    {vault?.currency}
                  </span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={withdrawAmount} 
                    onChange={e => setWithdrawAmount(e.target.value)} 
                    required 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 12,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--warning-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Reason (Optional)</label>
                <textarea 
                  placeholder="Why are you withdrawing these funds?" 
                  value={withdrawDesc} 
                  onChange={e => setWithdrawDesc(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 80,
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--warning-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div style={{
                background: 'var(--warning-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--warning-200)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Current Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning-700)' }}>
                    {vault?.totalBalance} {vault?.currency}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Remaining Balance:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning-700)' }}>
                    {withdrawAmount ? (parseFloat(vault?.totalBalance || 0) - parseFloat(withdrawAmount)).toFixed(2) : vault?.totalBalance} {vault?.currency}
                  </span>
                </div>
              </div>
              
              {withdrawAmount && parseFloat(withdrawAmount) > parseFloat(vault?.totalBalance || 0) && (
                <div style={{
                  background: 'var(--error-50)',
                  color: 'var(--error-700)',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '1px solid var(--error-200)',
                  fontSize: '0.9rem'
                }}>
                  ⚠️ Withdrawal amount exceeds available balance
                </div>
              )}
            </div>
            
            {error && (
              <div style={{
                background: 'var(--error-50)',
                color: 'var(--error-700)',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                border: '1px solid var(--error-200)',
                fontSize: '0.9rem',
                marginTop: '1rem'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowWithdraw(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(vault?.totalBalance || 0)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(vault?.totalBalance || 0) ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--warning-500), var(--warning-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(vault?.totalBalance || 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(vault?.totalBalance || 0) ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && withdrawAmount && parseFloat(withdrawAmount) <= parseFloat(vault?.totalBalance || 0) && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && withdrawAmount && parseFloat(withdrawAmount) <= parseFloat(vault?.totalBalance || 0) && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Withdrawing...' : 'Withdraw Funds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowInvite(false)}>
          <form onClick={e => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            width: '90%',
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <button type="button" onClick={() => setShowInvite(false)} style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-600)',
              transition: 'all 0.2s'
            }}>
              <FiX size={16} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}>
                <FiUserPlus size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-800)' }}>Invite Member</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: '0.9rem' }}>
                Add a new member to <strong>{vault?.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>User ID *</label>
                <input 
                  type="text" 
                  placeholder="Enter user's principal ID" 
                  value={inviteUserId} 
                  onChange={e => setInviteUserId(e.target.value)} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.9rem' }}>Role *</label>
                <select 
                  value={inviteRole} 
                  onChange={e => setInviteRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--neutral-200)'}
                >
                  <option value="member">👤 Member - Can deposit, withdraw, and view vault</option>
                  <option value="admin">🛡️ Admin - Can manage vault settings and members</option>
                </select>
              </div>
              
              <div style={{
                background: 'var(--primary-50)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid var(--primary-200)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FiUsers size={16} color="var(--primary-600)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-700)' }}>Current Members</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                  {details?.ok?.members?.length || details?.members?.length || 0} member{(details?.ok?.members?.length || details?.members?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {error && (
              <div style={{
                background: 'var(--error-50)',
                color: 'var(--error-700)',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                border: '1px solid var(--error-200)',
                fontSize: '0.9rem',
                marginTop: '1rem'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowInvite(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: 12,
                  background: 'white',
                  color: 'var(--neutral-700)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = 'var(--neutral-400)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--neutral-300)'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting || !inviteUserId}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: 12,
                  background: submitting || !inviteUserId ? 'var(--neutral-400)' : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting || !inviteUserId ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: submitting || !inviteUserId ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => !submitting && inviteUserId && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => !submitting && inviteUserId && (e.target.style.transform = 'translateY(0)')}
              >
                {submitting ? 'Inviting...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 