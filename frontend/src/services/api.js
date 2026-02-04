import axios from 'axios';

// Proxy kullandığımız için boş bırakıyoruz
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// --- KONUŞMA YÖNETİMİ (useConversations'ın beklediği isimler) ---

export const getConversations = async () => {
  const response = await api.get('/api/conversations');
  return response.data;
};

// HATA BURADAYDI: Bu fonksiyonun eksik veya ismi hatalıydı
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