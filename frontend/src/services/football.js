// 🏟️ API-Football Servis - Canlı Maç Verileri

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

// Canlı maçları getir
export const getLiveMatches = async (league = null) => {
  try {
    let url = `${BASE_URL}/fixtures?live=all`;
    if (league) {
      url += `&league=${league}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Canlı maç getirme hatası:', error);
    return [];
  }
};

// Belirli bir takımın canlı maçını getir
export const getTeamLiveMatch = async (teamName) => {
  try {
    const response = await fetch(`${BASE_URL}/fixtures?live=all`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const data = await response.json();
    const matches = data.response || [];
    
    if (!teamName) return matches[0] || null;

    // Daha esnek arama:
    return matches.find(match => 
      match.teams.home.name.toLowerCase().includes(teamName.toLowerCase()) || 
      match.teams.away.name.toLowerCase().includes(teamName.toLowerCase())
    );
  } catch (error) {
    console.error('Maç getirme hatası:', error);
    return null;
  }
};

// Tek bir maçın detayını getir
export const getMatchDetails = async (fixtureId) => {
  try {
    const response = await fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const data = await response.json();
    return data.response?.[0] || null;
  } catch (error) {
    console.error('Maç detayı getirme hatası:', error);
    return null;
  }
};

// Maç istatistiklerini getir
export const getMatchStatistics = async (fixtureId) => {
  try {
    const response = await fetch(`${BASE_URL}/fixtures/statistics?fixture=${fixtureId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    return [];
  }
};

// Maç olaylarını getir (goller, kartlar, değişiklikler)
export const getMatchEvents = async (fixtureId) => {
  try {
    const response = await fetch(`${BASE_URL}/fixtures/events?fixture=${fixtureId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const data = await response.json();
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
