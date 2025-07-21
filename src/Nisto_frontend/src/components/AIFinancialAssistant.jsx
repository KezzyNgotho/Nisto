import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiSend, FiZap, FiUser, FiMessageSquare } from 'react-icons/fi';

export default function AIFinancialAssistant() {
  const { user, isAuthenticated, isLoading, sendAIMessage } = useAuth();
  const { showToast } = useNotification();
  const [messages, setMessages] = useState([
    { type: 'assistant', content: 'Hi! I am your AI Financial Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setMessages(msgs => [...msgs, { type: 'user', content: input }]);
    try {
      // If backend AI is available, use it; otherwise, mock a response
      let aiResponse = 'Sorry, AI is not available right now.';
      if (sendAIMessage) {
        const result = await sendAIMessage(input);
        aiResponse = result?.content || 'AI could not process your request.';
      }
      setMessages(msgs => [...msgs, { type: 'assistant', content: aiResponse }]);
    } catch (err) {
      showToast({ message: 'Failed to get AI response', type: 'error', icon: <FiMessageSquare /> });
      setMessages(msgs => [...msgs, { type: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setInput('');
      setSending(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <FiZap className="ai-icon" />
        <h3>AI Financial Assistant</h3>
      </div>
      <div className="ai-chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.type}`}>
            <span className="ai-avatar">{msg.type === 'assistant' ? <FiZap /> : <FiUser />}</span>
            <span className="ai-content">{msg.content}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form className="ai-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Ask me anything about your finances..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending || isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || isLoading || !input.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
} 