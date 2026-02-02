import { useState, useEffect, useCallback } from 'react';
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation as deleteConversationAPI
} from '../services/api';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(async () => {
    if (loading) return; 
    
    setLoading(true);
    setError(null);

    try {
      const response = await getConversations();
      if (response && response.success) {
        setConversations(response.conversations || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Konuşmalar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const startNewConversation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await createConversation();
      if (response && response.success) {
        setCurrentConversation(response.conversation);
        setCurrentConversationId(response.conversation.id);
        const listRes = await getConversations();
        if (listRes.success) setConversations(listRes.conversations || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Yeni konuşma oluşturulamadı:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessageToConversation = useCallback((message) => {
    if (!currentConversation) return;

    const updatedConversation = {
      ...currentConversation,
      messages: [...(currentConversation.messages || []), message]
    };

    setCurrentConversation(updatedConversation);

    updateConversation(
      currentConversation.id, 
      updatedConversation.messages,
      currentConversation.title
    ).catch(err => console.error('Mesaj kaydetme hatası:', err));
  }, [currentConversation]);

  useEffect(() => {
    loadConversations();
  }, []); 

  useEffect(() => {
    const shouldStartNew = 
      !loading && 
      !error && 
      conversations.length === 0 && 
      !currentConversation;

    if (shouldStartNew) {
      startNewConversation();
    }
  }, [conversations.length, currentConversation, loading, error, startNewConversation]);

  return {
    conversations,
    currentConversation,
    currentConversationId,
    loading,
    error,
    loadConversations,
    startNewConversation,
    addMessageToConversation,
    setCurrentConversation,
    setCurrentConversationId
  };
};