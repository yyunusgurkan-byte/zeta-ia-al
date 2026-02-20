// frontend/src/components/Chat/MessageList.jsx
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './MessageList.css';

const MessageList = ({ messages, loading, onCodeClick }) => {
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
      <div className="empty-suggestions">
        <div className="suggestion-chip">💻 Kod yaz</div>
        <div className="suggestion-chip">🔍 Kod analiz et</div>
        <div className="suggestion-chip">🐛 Hata bul</div>
        <div className="suggestion-chip">📖 Açıkla</div>
      </div>
    </div>
  );

  // Mesaj index'ine göre kod bloğu offset hesapla
  const getCodeOffset = (messages, msgIndex) => {
    let offset = 0;
    for (let i = 0; i < msgIndex; i++) {
      if (messages[i].role !== 'user') {
        const matches = messages[i].content?.match(/```/g);
        if (matches) offset += Math.floor(matches.length / 2);
      }
    }
    return offset;
  };

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
              onCodeClick={(blockIndex) =>
                onCodeClick && onCodeClick(message, blockIndex)
              }
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
