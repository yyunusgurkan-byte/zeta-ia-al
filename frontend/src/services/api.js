import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// --- SOHBET FONKSİYONLARI ---
export const sendMessage = async (message, conversationId, history = []) => {
  const response = await api.post('/api/chat', {
    message,
    conversationId,
    history
  });
  return response.data;
};

// --- KONUŞMA YÖNETİMİ ---
export const getConversations = async () => {
  const response = await api.get('/api/conversations');
  return response.data;
};

export const getConversation = async (id) => {
  const response = await api.get(`/api/conversations/${id}`);
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
  const response = await api.put(`/api/conversations/${id}`, {
    messages,
    title
  });
  return response.data;
};

export const deleteConversation = async (id) => {
  const response = await api.delete(`/api/conversations/${id}`);
  return response.data;
};

// --- SAĞLIK KONTROLÜ ---
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;