import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatContainer.css';

const ChatContainer = ({ messages, onSend, loading }) => {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h1 className="chat-title">🤖 Zeta AI</h1>
          <p className="chat-subtitle">Akıllı asistanınız</p>
        </div>
      </div>

      <MessageList messages={messages} loading={loading} />
      
      <MessageInput onSend={onSend} disabled={loading} />
    </div>
  );
};

export default ChatContainer;