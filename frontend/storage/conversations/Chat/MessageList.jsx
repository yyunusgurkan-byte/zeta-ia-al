import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './MessageList.css';

const MessageList = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">🤖</div>
      <h2 className="empty-title">Zeta AI'ya Hoş Geldiniz!</h2>
      <p className="empty-description">
        Size nasıl yardımcı olabilirim? Herhangi bir şey sorabilirsiniz.
      </p>
    </div>
  );

  return (
    <div className="message-list-container">
      <div className="message-list">
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isUser={message.role === 'user'}
            />
          ))
        )}
        
        {loading && (
          <div className="typing-indicator">
            <div className="typing-avatar">🤖</div>
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;