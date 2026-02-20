import axios from 'axios';

const API_URL = 'https://zeta-ai-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const sendMessage = async (message, conversationId, history = [], imageFile = null) => {
  if (imageFile) {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('conversationId', conversationId || '');
    formData.append('history', JSON.stringify(history));
    formData.append('image', imageFile);
    
    const response = await api.post('/api/chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
  
  const response = await api.post('/api/chat', {
    message,
    conversationId,
    history
  });
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/api/conversations');
  return response.data;
};

export const getConversation = async (id) => {
  const response = await api.get(`/api/conversations/${id}`); // ✅ Düzeltildi
  return response.data;
};

export const createConversation = async (title = 'Yeni Sohbet', messages = []) => {
  const response = await api.post('/api/conversations', {
    title,
    messages
  });
  return response.data;
};

export const updateConversation = async (id, messages, title) => {
  const response = await api.put(`/api/conversations/${id}`, { // ✅ Düzeltildi
    messages,
    title
  });
  return response.data;
};

export const deleteConversation = async (id) => {
  const response = await api.delete(`/api/conversations/${id}`); // ✅ Düzeltildi
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;