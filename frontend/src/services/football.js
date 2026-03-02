const BASE_URL = 'https://zeta-ai-backend.onrender.com/api/football';

export const getLiveMatches = async (league = null) => {
  try {
    let url = `${BASE_URL}/live`;
    if (league) url += `?league=${league}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.response || [];
  } catch (error) {
    console.error('Canlı maç hatası:', error);
    return [];
  }
};

export const getTeamLiveMatch = async (teamName) => {
  try {
    const res = await fetch(`${BASE_URL}/live`);
    const data = await res.json();
    const matches = data.response || [];

    if (!teamName) return matches[0] || null;

    const normalizedName = teamName.toLowerCase()
      .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i');

    return matches.find(match => {
      const homeName = match.teams.home.name.toLowerCase()
        .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i');
      const awayName = match.teams.away.name.toLowerCase()
        .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i');
      return homeName.includes(normalizedName) || awayName.includes(normalizedName);
    }) || null;
  } catch (error) {
    console.error('Maç getirme hatası:', error);
    return null;
  }
};

export const getMatchDetails = async (fixtureId) => {
  try {
    const res = await fetch(`${BASE_URL}/live`);
    const data = await res.json();
    return data.response?.[0] || null;
  } catch (error) {
    console.error('Maç detayı hatası:', error);
    return null;
  }
};

export const getMatchStatistics = async (fixtureId) => {
  try {
    const res = await fetch(`${BASE_URL}/statistics/${fixtureId}`);
    const data = await res.json();
    return data.response || [];
  } catch (error) {
    console.error('İstatistik hatası:', error);
    return [];
  }
};

export const getMatchEvents = async (fixtureId) => {
  try {
    const res = await fetch(`${BASE_URL}/events/${fixtureId}`);
    const data = await res.json();
    return data.response || [];
  } catch (error) {
    console.error('Olay hatası:', error);
    return [];
  }
};

export const LEAGUE_IDS = {
  SUPER_LIG: 203,
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
  CHAMPIONS_LEAGUE: 2
};