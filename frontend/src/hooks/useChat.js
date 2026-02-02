// 💬 USE CHAT HOOK
// Backend ile chat işlemleri

import { useState, useCallback } from 'react';
import { sendMessage as sendMessageAPI } from '../services/api';

export const useChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Mesaj gönder
   */
  const sendMessage = useCallback(async (message, conversationId, history = []) => {
    setLoading(true);
    setError(null);

    try {
      // Backend'e gönder
      const response = await sendMessageAPI(message, conversationId, history);
      
      if (!response.success) {
        throw new Error(response.message || 'Mesaj gönderilemedi');
      }

      return {
        success: true,
        message: response.response,
        conversationId: response.conversationId,
        toolUsed: response.toolUsed,
        metadata: response.metadata
      };

    } catch (err) {
      const errorMessage = err.message || 'Bir hata oluştu';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Hata temizle
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    loading,
    error,
    clearError
  };
};

export default useChat;
