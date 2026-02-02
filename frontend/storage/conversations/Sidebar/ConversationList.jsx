// frontend/src/components/Sidebar/ConversationList.jsx

import React, { useState, useEffect } from 'react';
import ConversationItem from './ConversationItem';
import './ConversationList.css';

const ConversationList = ({ onSelectConversation, activeConversationId = null }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    onSelectConversation(null);
  };

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation.id);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (conversationId === activeConversationId) {
        onSelectConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleRenameConversation = async (conversationId, newTitle) => {
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });

      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
      );
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupConversationsByDate = (conversations) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    conversations.forEach(conversation => {
      const date = new Date(conversation.updatedAt);
      
      if (date >= today) {
        groups.today.push(conversation);
      } else if (date >= yesterday) {
        groups.yesterday.push(conversation);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(conversation);
      } else if (date >= monthAgo) {
        groups.thisMonth.push(conversation);
      } else {
        groups.older.push(conversation);
      }
    });

    return groups;
  };

  const renderConversationGroup = (title, conversations) => {
    if (conversations.length === 0) return null;

    return (
      <div className="conversation-group" key={title}>
        <h3 className="group-title">{title}</h3>
        <div className="group-items">
          {conversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => handleSelectConversation(conversation)}
              onDelete={handleDeleteConversation}
              onRename={handleRenameConversation}
            />
          ))}
        </div>
      </div>
    );
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);

  return (
    <div className={`conversation-list-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">Z</div>
          {!isCollapsed && <span className="brand-name">Zeta AI</span>}
        </div>
        
        <button
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Genişlet' : 'Daralt'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {isCollapsed ? (
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
            ) : (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            )}
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="sidebar-actions">
            <button className="new-chat-button" onClick={handleNewConversation}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              <span>Yeni Konuşma</span>
            </button>

            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="search-icon">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                type="text"
                placeholder="Konuşmalarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="conversations-container">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner">
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                  <div className="spinner-dot"></div>
                </div>
                <p>Konuşmalar yükleniyor...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" className="empty-icon">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                    <p>Konuşma bulunamadı</p>
                  </>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" className="empty-icon">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                    </svg>
                    <p>Henüz konuşma yok</p>
                    <p className="empty-hint">Yeni bir konuşma başlatın</p>
                  </>
                )}
              </div>
            ) : (
              <>
                {renderConversationGroup('Bugün', groupedConversations.today)}
                {renderConversationGroup('Dün', groupedConversations.yesterday)}
                {renderConversationGroup('Bu Hafta', groupedConversations.thisWeek)}
                {renderConversationGroup('Bu Ay', groupedConversations.thisMonth)}
                {renderConversationGroup('Daha Eski', groupedConversations.older)}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationList;