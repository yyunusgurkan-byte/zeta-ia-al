// frontend/src/hooks/useConversations.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'zeta-conversations';

export const useConversations = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentConversation, setCurrentConversation] = useState(null);

  // Kayıt işlemi: Boş olsa bile kaydet ki senkronizasyon kopmasın
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const createConversation = useCallback(async (title = 'Yeni Sohbet') => {
    const newConv = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversation(newConv);
    return newConv;
  }, []);

  // KRİTİK DÜZELTME: Fonksiyonel güncelleme (prev => ...) kullanıldı
  const addMessageToConversation = useCallback((message) => {
    setCurrentConversation(prevCurrent => {
      if (!prevCurrent) return prevCurrent;

      const updated = {
        ...prevCurrent,
        messages: [...(prevCurrent.messages || []), message],
        updatedAt: new Date().toISOString()
      };

      // İlk mesajda başlığı değiştir
      if (updated.title === 'Yeni Sohbet' && message.role === 'user') {
        updated.title = message.content.slice(0, 30);
      }

      // SIDEBAR'I GÜNCELLEMEYE ZORLA
      setConversations(prevList => {
        const filtered = prevList.filter(c => c.id !== updated.id);
        return [updated, ...filtered];
      });

      return updated;
    });
  }, []); // Bağımlılık boşaltıldı!

  const loadConversation = useCallback((id) => {
    const found = conversations.find(c => c.id === id);
    if (found) setCurrentConversation(found);
  }, [conversations]);

  const deleteConversation = useCallback((id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation?.id === id) setCurrentConversation(null);
  }, [currentConversation]);

  const renameConversation = useCallback((id, newTitle) => {
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c)
    );
    if (currentConversation?.id === id) {
      setCurrentConversation(prev => ({ ...prev, title: newTitle }));
    }
  }, [currentConversation]);

  return { 
    conversations, 
    currentConversation, 
    createConversation, 
    loadConversation, 
    deleteConversation,
    renameConversation,
    addMessageToConversation 
  };
};

export default useConversations;
