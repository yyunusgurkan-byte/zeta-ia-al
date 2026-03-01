// ⚽ API-FOOTBALL Servisi - Direkt API-Sports Key
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

// API isteği yapmak için yardımcı fonksiyon
async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY  // ← DÜZELTME: RapidAPI değil, direkt API-Sports
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', response.status, errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Football API Error:', error);
    throw error;
  }
}

// Canlı maçları getir
export const getLiveMatches = async (league = null) => {
  try {
    let url = '/fixtures?live=all';
    if (league) {
      url += `&league=${league}`;
    }
    
    const data = await fetchFromAPI(url);
    return data.response || [];
  } catch (error) {
    console.error('Canlı maç getirme hatası:', error);
    return [];
  }
};

// Belirli bir takımın canlı maçını getir
export const getTeamLiveMatch = async (teamName) => {
  try {
    const data = await fetchFromAPI('/fixtures?live=all');
    const matches = data.response || [];
    
    if (!teamName) return matches[0] || null;
    
    // Türkçe karakter normalize
    const normalizedName = teamName.toLowerCase()
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/ı/g, 'i');
    
    // Takımı bul
    return matches.find(match => {
      const homeName = match.teams.home.name.toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ı/g, 'i');
      
      const awayName = match.teams.away.name.toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ı/g, 'i');

      return homeName.includes(normalizedName) || awayName.includes(normalizedName);
    });
  } catch (error) {
    console.error('Maç getirme hatası:', error);
    return null;
  }
};

// Tek bir maçın detayını getir
export const getMatchDetails = async (fixtureId) => {
  try {
    const data = await fetchFromAPI(`/fixtures?id=${fixtureId}`);
    return data.response?.[0] || null;
  } catch (error) {
    console.error('Maç detayı getirme hatası:', error);
    return null;
  }
};

// Maç istatistiklerini getir
export const getMatchStatistics = async (fixtureId) => {
  try {
    const data = await fetchFromAPI(`/fixtures/statistics?fixture=${fixtureId}`);
    return data.response || [];
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    return [];
  }
};

// Maç olaylarını getir (goller, kartlar, değişiklikler)
export const getMatchEvents = async (fixtureId) => {
  try {
    const data = await fetchFromAPI(`/fixtures/events?fixture=${fixtureId}`);
    return data.response || [];
  } catch (error) {
    console.error('Olay getirme hatası:', error);
    return [];
  }
};

// Türkiye Süper Lig ID: 203
export const LEAGUE_IDS = {
  SUPER_LIG: 203,
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
  CHAMPIONS_LEAGUE: 2
};