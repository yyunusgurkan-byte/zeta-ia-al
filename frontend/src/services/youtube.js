// 🎵 YouTube API Servisi
import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * YouTube'da müzik arama
 * @param {string} query - Arama sorgusu (örn: "Tarkan Şımarık")
 * @param {number} maxResults - Maksimum sonuç sayısı (varsayılan: 5)
 */
export const searchYouTube = async (query, maxResults = 5) => {
  try {
    // İlk arama - sadece müzik kanallarından
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: `${query} official audio music video song`, // Müzik odaklı
        type: 'video',
        videoCategoryId: '10', // Müzik kategorisi
        maxResults: maxResults * 2, // 2 kat fazla çek, sonra filtrele
        key: YOUTUBE_API_KEY,
        order: 'relevance',
        videoEmbeddable: 'true', // Gömülebilir videolar
        safeSearch: 'none'
      }
    });

    // Haber/röportaj/podcast'leri filtrele
    const filtered = response.data.items.filter(item => {
      const title = item.snippet.title.toLowerCase()
      const channel = item.snippet.channelTitle.toLowerCase()
      
      // Haber kelimelerini engelle
      const blacklist = ['haber', 'news', 'röportaj', 'interview', 'podcast', 
                        'canlı yayın', 'live', 'açıklama', 'konuşma', 'basın']
      
      // Başlıkta veya kanalda haber kelimesi var mı?
      const hasBlacklist = blacklist.some(word => 
        title.includes(word) || channel.includes(word)
      )
      
      return !hasBlacklist
    })

    // Sadece istenen sayıda döndür
    return filtered.slice(0, maxResults).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      description: item.snippet.description
    }));
  } catch (error) {
    console.error('YouTube arama hatası:', error);
    throw new Error('Şarkı bulunamadı');
  }
};

/**
 * YouTube duration formatını saniyeye çevir (PT4M13S -> 253)
 */
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0);
  const seconds = (parseInt(match[3]) || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Saniyeyi dakika:saniye formatına çevir (253 -> "4:13")
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};