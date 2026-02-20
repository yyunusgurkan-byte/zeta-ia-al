// frontend/src/components/Chat/ChatContainer.jsx
import React, { useState, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CodePanel from './CodePanel';
import { parseCodeBlocks } from './MessageBubble';
import './ChatContainer.css';

const ChatContainer = ({ messages, onSend, loading }) => {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);

  // Herhangi bir mesajdaki koda tıklanınca
  const handleCodeClick = useCallback((message, blockIndex) => {
    const blocks = parseCodeBlocks(message.content);
    if (blocks.length > 0) {
      setCodeBlocks(blocks);
      setActiveBlockIndex(blockIndex);
      setShowCodePanel(true);
    }
  }, []);

  const handleClosePanel = () => {
    setShowCodePanel(false);
  };

  return (
    <div className={`chat-container ${showCodePanel ? 'with-code-panel' : ''}`}>
      {/* Sol: Chat alanı */}
      <div className="chat-main">
        <div className="chat-header">
          <div className="header-info">
            <h1 className="chat-title">🤖 Zeta AI</h1>
            <p className="chat-subtitle">Akıllı asistanınız</p>
          </div>
          {showCodePanel && (
            <button className="toggle-panel-btn active" onClick={handleClosePanel}>
              ⬡ Kod Paneli ✕
            </button>
          )}
        </div>

        <MessageList
          messages={messages}
          loading={loading}
          onCodeClick={handleCodeClick}
        />

        <MessageInput onSend={onSend} disabled={loading} />
      </div>

      {/* Sağ: Kod paneli - sadece kod varsa */}
      {showCodePanel && (
        <div className="code-panel-wrapper">
          <CodePanel
            codeBlocks={codeBlocks}
            initialIndex={activeBlockIndex}
            onClose={handleClosePanel}
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
