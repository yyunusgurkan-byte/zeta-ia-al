// frontend/src/components/Chat/MessageBubble.jsx
import React from 'react';
import './MessageBubble.css';

// Kod bloklarını parse et: ```lang\ncode\n```
export const parseCodeBlocks = (content) => {
  const blocks = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'code',
      code: match[2].trim(),
    });
  }
  return blocks;
};

// Mesaj metnini render et - kod bloklarını güzel göster
const renderContent = (content, onCodeClick) => {
  if (!content) return null;

  const parts = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = regex.exec(content)) !== null) {
    // Kod öncesi metin
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(
        <span key={`text-${blockIndex}`} className="message-text-part">
          {renderInlineMarkdown(text)}
        </span>
      );
    }

    const lang = match[1] || 'code';
    const code = match[2].trim();
    const lines = code.split('\n').length;

    parts.push(
      <div key={`code-${blockIndex}`} className="inline-code-block">
        <div className="inline-code-header">
          <span className="inline-code-lang">{lang}</span>
          <span className="inline-code-lines">{lines} satır</span>
          <button
            className="inline-code-open-btn"
            onClick={() => onCodeClick && onCodeClick(blockIndex)}
            title="Kod panelinde aç"
          >
            ⬡ Panelde Aç
          </button>
          <button
            className="inline-code-copy-btn"
            onClick={() => navigator.clipboard.writeText(code)}
            title="Kopyala"
          >
            📋
          </button>
        </div>
        <pre className="inline-code-preview">
          <code>{code.split('\n').slice(0, 6).join('\n')}
            {lines > 6 ? `\n... +${lines - 6} satır daha` : ''}
          </code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
    blockIndex++;
  }

  // Son metin parçası
  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-end`} className="message-text-part">
        {renderInlineMarkdown(content.slice(lastIndex))}
      </span>
    );
  }

  return parts.length > 0 ? parts : <span>{renderInlineMarkdown(content)}</span>;
};

// Inline markdown: bold, italic, inline code
const renderInlineMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Başlıklar
    if (line.startsWith('### ')) return <h3 key={lineIdx} className="md-h3">{line.slice(4)}</h3>;
    if (line.startsWith('## '))  return <h2 key={lineIdx} className="md-h2">{line.slice(3)}</h2>;
    if (line.startsWith('# '))   return <h1 key={lineIdx} className="md-h1">{line.slice(2)}</h1>;

    // Liste
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return <div key={lineIdx} className="md-list-item">• {renderSpan(line.slice(2))}</div>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <div key={lineIdx} className="md-list-item">{renderSpan(line)}</div>;
    }

    // Boş satır
    if (line.trim() === '') return <br key={lineIdx} />;

    return <div key={lineIdx}>{renderSpan(line)}</div>;
  });
};

const renderSpan = (text) => {
  // bold, italic, inline code
  const parts = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let last = 0;
  let m;
  let i = 0;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={i++}>{text.slice(last, m.index)}</span>);
    if (m[1]) parts.push(<strong key={i++}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={i++}>{m[4]}</em>);
    else if (m[5]) parts.push(<code key={i++} className="md-inline-code">{m[6]}</code>);
    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push(<span key={i++}>{text.slice(last)}</span>);
  return parts.length > 0 ? parts : text;
};

const MessageBubble = ({ message, isUser, onCodeClick }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasCode = !isUser && /```/.test(message.content);

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
          <span className="message-sender">{isUser ? 'Sen' : 'Zeta'}</span>
          {hasCode && (
            <span className="code-indicator">⌨️ Kod içeriyor</span>
          )}
          {message.timestamp && (
            <span className="message-time">{formatTime(message.timestamp)}</span>
          )}
        </div>

        <div className="message-content">
          <div className="message-text">
            {isUser
              ? message.content
              : renderContent(message.content, onCodeClick)
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
