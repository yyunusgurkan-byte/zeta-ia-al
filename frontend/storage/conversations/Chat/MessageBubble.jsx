import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message-bubble ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className="message-avatar">
        {isUser ? (
          <div className="avatar-user">👤</div>
        ) : (
          <div className="avatar-ai">🤖</div>
        )}
      </div>

      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="message-sender">
            {isUser ? 'Sen' : 'Zeta'}
          </span>
          {message.timestamp && (
            <span className="message-time">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>

        <div className="message-content">
          <p className="message-text">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;