// frontend/src/components/Sidebar/ConversationItem.jsx

import React, { useState } from 'react';
import './ConversationItem.css';

const ConversationItem = ({ 
  conversation, 
  isActive = false, 
  onClick, 
  onDelete,
  onRename 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title);
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date) => {
    const now = new Date();
    const conversationDate = new Date(date);
    const diffMs = now - conversationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return conversationDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleRename = () => {
    if (editedTitle.trim() && editedTitle !== conversation.title) {
      onRename(conversation.id, editedTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditedTitle(conversation.title);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bu konuşmayı silmek istediğinizden emin misiniz?')) {
      onDelete(conversation.id);
    }
    setShowMenu(false);
  };

  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={!isEditing ? onClick : undefined}
    >
      <div className="conversation-icon">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
        </svg>
      </div>

      <div className="conversation-content">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="conversation-title-input"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="conversation-info">
            <h3 className="conversation-title">{conversation.title}</h3>
            <p className="conversation-date">{formatDate(conversation.updatedAt)}</p>
          </div>
        )}
      </div>

      <div className="conversation-actions">
        <button
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5"/>
            <circle cx="8" cy="8" r="1.5"/>
            <circle cx="8" cy="13" r="1.5"/>
          </svg>
        </button>

        {showMenu && (
          <div className="conversation-menu" onClick={(e) => e.stopPropagation()}>
            <button
              className="menu-item"
              onClick={() => {
                setIsEditing(true);
                setShowMenu(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              <span>Yeniden adlandır</span>
            </button>
            <button
              className="menu-item menu-item-danger"
              onClick={handleDelete}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>Sil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationItem;