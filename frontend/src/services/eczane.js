// frontend/src/services/eczane.js
const API_URL = 'https://zeta-ai-backend.onrender.com';
export async function getNobetciEczaneler(sehir, ilce = null) {
  const url = ilce 
    ? `${API_URL}/api/eczane/${encodeURIComponent(sehir)}?ilce=${encodeURIComponent(ilce)}`
    : `${API_URL}/api/eczane/${encodeURIComponent(sehir)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Eczane verisi alınamadı');
  return await response.json();
}