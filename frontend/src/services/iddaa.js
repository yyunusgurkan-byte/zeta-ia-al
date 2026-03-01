const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getIddaaOdds() {
  const response = await fetch(`${API_URL}/api/iddaa`);
  if (!response.ok) throw new Error('İddaa verisi alınamadı');
  return await response.json();
}
