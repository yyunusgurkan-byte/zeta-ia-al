const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getDovizKripto() {
  const response = await fetch(`${API_URL}/api/doviz`);
  if (!response.ok) throw new Error('Döviz verisi alınamadı');
  return await response.json();
}