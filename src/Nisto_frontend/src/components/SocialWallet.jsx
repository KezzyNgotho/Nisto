import React, { useState, useEffect, useRef } from 'react';
import { 
  FiMessageCircle, FiHeart, FiShare2, FiSend, FiPlus, 
  FiHome, FiTrendingUp, FiUsers, FiSettings, FiCamera,
  FiVideo, FiImage, FiSmile, FiGift, FiDollarSign
} from 'react-icons/fi';
import { BiMoney, BiTransfer, BiGroup } from 'react-icons/bi';
import './SocialWallet.scss';

const SocialWallet = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [stories, setStories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [chats, setChats] = useState([]);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [walletBalance, setWalletBalance] = useState(1250.00);
  const [quickActions] = useState([
    { icon: <BiMoney />, label: 'Send Money', action: 'send', color: '#10B981' },
    { icon: <BiTransfer />, label: 'Request', action: 'request', color: '#3B82F6' },
    { icon: <BiGroup />, label: 'Split Bill', action: 'split', color: '#8B5CF6' },
    { icon: <FiGift />, label: 'Gift', action: 'gift', color: '#F59E0B' }
  ]);

  // Mock data for stories
  useEffect(() => {
    setStories([
      { id: 1, user: 'Sarah', avatar: '👩‍💼', amount: 50, type: 'sent', time: '2h ago' },
      { id: 2, user: 'Mike', avatar: '👨‍💻', amount: 25, type: 'received', time: '4h ago' },
      { id: 3, user: 'Emma', avatar: '👩‍🎨', amount: 100, type: 'split', time: '6h ago' },
      { id: 4, user: 'Alex', avatar: '👨‍🏫', amount: 75, type: 'gift', time: '8h ago' },
      { id: 5, user: 'You', avatar: '⭐', amount: 0, type: 'add', time: 'now' }
    ]);

    setPosts([
      {
        id: 1,
        user: 'Sarah',
        avatar: '👩‍💼',
        content: 'Just sent $50 to Mike for lunch! 🍕',
        amount: 50,
        type: 'sent',
        likes: 12,
        comments: 3,
        time: '2h ago',
        media: '🍕'
      },
      {
        id: 2,
        user: 'Mike',
        avatar: '👨‍💻',
        content: 'Thanks Sarah! Lunch was amazing 😋',
        amount: 0,
        type: 'received',
        likes: 8,
        comments: 2,
        time: '1h ago',
        media: '😋'
      },
      {
        id: 3,
        user: 'Emma',
        avatar: '👩‍🎨',
        content: 'Split the dinner bill with the team 🍽️',
        amount: 120,
        type: 'split',
        likes: 15,
        comments: 5,
        time: '3h ago',
        media: '🍽️'
      }
    ]);

    setChats([
      { id: 1, user: 'Sarah', avatar: '👩‍💼', lastMessage: 'Thanks for the money!', time: '2m ago', unread: 0 },
      { id: 2, user: 'Mike', avatar: '👨‍💻', lastMessage: 'Can you send me $25?', time: '5m ago', unread: 1 },
      { id: 3, user: 'Emma', avatar: '👩‍🎨', lastMessage: 'Split bill ready', time: '10m ago', unread: 0 },
      { id: 4, user: 'Alex', avatar: '👨‍🏫', lastMessage: 'Gift sent! 🎁', time: '15m ago', unread: 0 }
    ]);
  }, []);

  const handleQuickAction = (action) => {
    switch(action) {
      case 'send':
        setShowChat(true);
        break;
      case 'request':
        // Handle request money
        break;
      case 'split':
        // Handle split bill
        break;
      case 'gift':
        // Handle gift
        break;
      default:
        break;
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      // Handle sending message
      setMessage('');
    }
  };

  const renderStories = () => (
    <div className="stories-container">
      <div className="stories-scroll">
        {stories.map((story) => (
          <div key={story.id} className={`story-item ${story.type === 'add' ? 'add-story' : ''}`}>
            <div className="story-avatar">
              {story.type === 'add' ? (
                <div className="add-story-btn">
                  <FiPlus />
                </div>
              ) : (
                <span className="avatar-emoji">{story.avatar}</span>
              )}
            </div>
            <div className="story-info">
              <span className="story-user">{story.user}</span>
              {story.amount > 0 && (
                <span className={`story-amount ${story.type}`}>
                  ${story.amount}
                </span>
              )}
              <span className="story-time">{story.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeed = () => (
    <div className="feed-container">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <div className="post-user">
              <span className="user-avatar">{post.avatar}</span>
              <div className="user-info">
                <span className="user-name">{post.user}</span>
                <span className="post-time">{post.time}</span>
              </div>
            </div>
            {post.amount > 0 && (
              <div className={`post-amount ${post.type}`}>
                ${post.amount}
              </div>
            )}
          </div>
          
          <div className="post-content">
            <p>{post.content}</p>
            {post.media && (
              <div className="post-media">
                <span className="media-emoji">{post.media}</span>
              </div>
            )}
          </div>
          
          <div className="post-actions">
            <button className="action-btn">
              <FiHeart /> {post.likes}
            </button>
            <button className="action-btn">
              <FiMessageCircle /> {post.comments}
            </button>
            <button className="action-btn">
              <FiShare2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChats = () => (
    <div className="chats-container">
      {chats.map((chat) => (
        <div 
          key={chat.id} 
          className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
          onClick={() => {
            setSelectedChat(chat);
            setShowChat(true);
          }}
        >
          <div className="chat-avatar">
            <span className="avatar-emoji">{chat.avatar}</span>
            {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
          </div>
          <div className="chat-info">
            <span className="chat-user">{chat.user}</span>
            <span className="chat-message">{chat.lastMessage}</span>
          </div>
          <span className="chat-time">{chat.time}</span>
        </div>
      ))}
    </div>
  );

  const renderChatWindow = () => (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-btn" onClick={() => setShowChat(false)}>
          ← Back
        </button>
        <div className="chat-user-info">
          <span className="user-avatar">{selectedChat?.avatar}</span>
          <span className="user-name">{selectedChat?.user}</span>
        </div>
        <button className="more-btn">
          <FiSettings />
        </button>
      </div>
      
      <div className="chat-messages">
        <div className="message received">
          <span className="message-text">Hey! Can you send me $25?</span>
          <span className="message-time">2:30 PM</span>
        </div>
        <div className="message sent">
          <span className="message-text">Sure! Sending now 💸</span>
          <span className="message-time">2:31 PM</span>
        </div>
      </div>
      
      <div className="chat-input">
        <div className="input-actions">
          <button className="action-btn">
            <FiCamera />
          </button>
          <button className="action-btn">
            <FiImage />
          </button>
          <button className="action-btn">
            <FiSmile />
          </button>
          <button className="action-btn">
            <FiDollarSign />
          </button>
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="send-btn" onClick={handleSendMessage}>
          <FiSend />
        </button>
      </div>
    </div>
  );

  return (
    <div className="social-wallet">
      {/* Header with Wallet Balance */}
      <div className="wallet-header">
        <div className="balance-card">
          <div className="balance-info">
            <span className="balance-label">Wallet Balance</span>
            <span className="balance-amount">${walletBalance.toFixed(2)}</span>
          </div>
          <div className="balance-actions">
            <button className="action-btn primary">
              <FiPlus /> Add Money
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.action}
            className="quick-action-btn"
            onClick={() => handleQuickAction(action.action)}
            style={{ '--action-color': action.color }}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <FiHome /> Feed
        </button>
        <button 
          className={`nav-tab ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          <FiTrendingUp /> Stories
        </button>
        <button 
          className={`nav-tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          <FiUsers /> Chats
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'stories' && renderStories()}
        {activeTab === 'chats' && renderChats()}
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={() => setShowPostCreator(true)}>
        <FiPlus />
      </button>

      {/* Chat Window Overlay */}
      {showChat && selectedChat && renderChatWindow()}
    </div>
  );
};

export default SocialWallet;
