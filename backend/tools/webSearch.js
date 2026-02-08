// 🌐 WEB SEARCH TOOL - SerpAPI
const axios = require('axios');

module.exports = {
  name: 'webSearch',
  description: 'Web üzerinde güncel arama yapar (SerpAPI)',
  
  async execute({ query }) {
    try {
      console.log(`🌐 SerpAPI searching: "${query}"`);
      
      const SERP_API_KEY = process.env.SERP_API_KEY;
      
      if (!SERP_API_KEY) {
        return {
          success: false,
          error: 'SERP_API_KEY tanımlı değil'
        };
      }

      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: SERP_API_KEY,
          engine: 'google',
          hl: 'tr',
          gl: 'tr',
          num: 5
        },
        timeout: 10000
      });

      const data = response.data;
      const results = [];

      // Organic results
      if (data.organic_results && data.organic_results.length > 0) {
        data.organic_results.forEach(result => {
          results.push({
            title: result.title,
            snippet: result.snippet || result.description || '',
            url: result.link,
            source: 'Google'
          });
        });
      }

      // Answer box
      if (data.answer_box) {
        const box = data.answer_box;
        results.unshift({
          title: box.title || 'Hızlı Yanıt',
          snippet: box.answer || box.snippet || '',
          url: box.link || '',
          source: 'Google Answer Box'
        });
      }

      if (results.length === 0) {
        return {
          success: false,
          error: 'Sonuç bulunamadı'
        };
      }

      return {
        success: true,
        data: {
          query: query,
          results: results,
          count: results.length
        }
      };

    } catch (error) {
      console.error('❌ SerpAPI error:', error.message);
      return {
        success: false,
        error: 'Arama yapılamadı: ' + error.message
      };
    }
  }
};