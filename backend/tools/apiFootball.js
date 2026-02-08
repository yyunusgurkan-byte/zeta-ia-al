// ⚽ API-FOOTBALL TOOL
const axios = require('axios');

module.exports = {
  name: 'apiFootball',
  description: 'Türk futbol takımlarının maç sonuçlarını ve fikstürünü getirir',
  
  async execute({ query }) {
    try {
      const API_KEY = process.env.API_FOOTBALL_KEY;
      
      if (!API_KEY) {
        return {
          success: false,
          error: 'API_FOOTBALL_KEY tanımlı değil'
        };
      }

      console.log(`⚽ Football query: "${query}"`);

      // Takım ID'leri (Süper Lig)
      const teams = {
        'fenerbahçe': 610,
        'galatasaray': 609,
        'beşiktaş': 611,
        'trabzonspor': 612,
        'başakşehir': 645
      };

      const lowerQuery = query.toLowerCase();
      let teamId = null;
      let teamName = '';

      for (const [name, id] of Object.entries(teams)) {
        if (lowerQuery.includes(name)) {
          teamId = id;
          teamName = name;
          break;
        }
      }

      if (!teamId) {
        return {
          success: false,
          error: 'Takım bulunamadı. Desteklenen takımlar: Fenerbahçe, Galatasaray, Beşiktaş, Trabzonspor, Başakşehir'
        };
      }

      // Son 5 maçı getir
      const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: {
          team: teamId,
          last: 5,
          timezone: 'Europe/Istanbul'
        },
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        timeout: 10000
      });

      const fixtures = response.data.response;

      if (!fixtures || fixtures.length === 0) {
        return {
          success: false,
          error: 'Maç bulunamadı'
        };
      }

      const results = fixtures.map(f => ({
        date: new Date(f.fixture.date).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        home: f.teams.home.name,
        away: f.teams.away.name,
        score: `${f.goals.home} - ${f.goals.away}`,
        status: f.fixture.status.short === 'FT' ? 'Bitti' : f.fixture.status.long,
        league: f.league.name
      }));

      return {
        success: true,
        data: {
          team: teamName.charAt(0).toUpperCase() + teamName.slice(1),
          matches: results
        }
      };

    } catch (error) {
      console.error('❌ API-Football error:', error.message);
      return {
        success: false,
        error: 'Maç bilgisi alınamadı: ' + error.message
      };
    }
  }
};