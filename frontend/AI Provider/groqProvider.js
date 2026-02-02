// 🤖 GROQ AI PROVIDER
// GROQ API ile konuşur (Claude'daki AI provider'a benzer)

const axios = require('axios');

class GroqProvider {
  constructor() {
    this.apiKey = process.env.VITE_GROQ_API_KEY;
    this.fallbackKey = process.env.VITE_FALLBACK_API_KEY;
    this.model = process.env.AI_MODEL_NAME || 'llama-3.1-70b-versatile';
    this.fallbackModel = process.env.FALLBACK_MODEL_NAME || 'llama-3.1-8b-instant';
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';

    if (!this.apiKey && !this.fallbackKey) {
      console.error('❌ GROQ API KEY bulunamadı! .env dosyanızı kontrol edin.');
    } else {
      console.log('✅ GROQ Provider initialized:', this.apiKey ? 'Primary Key' : 'Fallback Key');
    }
  }

  /**
   * Ana chat fonksiyonu
   * @param {Array} conversationHistory - Konuşma geçmişi
   * @param {String} userMessage - Kullanıcı mesajı
   * @param {String} systemPrompt - Sistem promptu (opsiyonel)
   * @returns {String} - AI yanıtı
   */
  async chat(conversationHistory = [], userMessage = '', systemPrompt = null) {
    try {
      // API key kontrolü
      const apiKey = this.apiKey || this.fallbackKey;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY_MISSING');
      }

      const model = this.apiKey ? this.model : this.fallbackModel;

      // Mesajları hazırla
      const messages = this.prepareMessages(conversationHistory, userMessage, systemPrompt);

      console.log(`🤖 GROQ API çağrısı: ${messages.length} mesaj, model: ${model}`);

      // API çağrısı
      const response = await axios.post(this.baseURL, {
        model: model,
        messages: messages,
        temperature: 0.2,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000 // 30 saniye timeout
      });

      // Yanıtı çıkar
      const aiResponse = response.data.choices[0].message.content || 'Yanıt oluşturulamadı.';
      
      console.log(`✅ GROQ yanıt alındı: ${aiResponse.length} karakter`);
      
      return aiResponse;

    } catch (error) {
      console.error('❌ GROQ API hatası:', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Mesajları hazırla
   */
  prepareMessages(history, userMessage, systemPrompt) {
    const messages = [];

    // 1. Sistem promptu (varsa)
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({
        role: 'system',
        content: this.buildSystemPrompt(systemPrompt)
      });
    } else {
      // Varsayılan sistem promptu
      messages.push({
        role: 'system',
        content: this.buildDefaultSystemPrompt()
      });
    }

    // 2. Konuşma geçmişi
    if (history && Array.isArray(history) && history.length > 0) {
      history.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // 3. Kullanıcı mesajı
    if (userMessage && userMessage.trim()) {
      messages.push({
        role: 'user',
        content: userMessage
      });
    }

    return messages;
  }

  /**
   * Sistem promptu oluştur
   */
  buildSystemPrompt(customPrompt) {
    const dateTime = this.getCurrentDateTime();
    
    return `${dateTime}

${customPrompt}

ÖNEMLİ KURALLAR:
- Kısa, net ve anlaşılır yanıtlar ver
- Maksimum 3-4 cümle kullan
- JSON formatını kullanıcıya gösterme
- Doğal dil ile konuş
- Türkçe karakterleri doğru kullan`;
  }

  /**
   * Varsayılan sistem promptu
   */
  buildDefaultSystemPrompt() {
    const dateTime = this.getCurrentDateTime();
    
    return `${dateTime}

Sen Zeta, yardımcı bir AI asistansın.

KİMLİĞİN:
- İsmin: Zeta
- Görevin: Kullanıcılara yardımcı olmak
- Dil: Türkçe
- Tarz: Doğal, samimi ve profesyonel

KURALLAR:
- Kısa ve net yanıtlar ver (3-4 cümle)
- Samimi ama profesyonel ol
- Bilmediğin konularda tahmin yapma
- Zararlı içerik üretme
- Türkçe karakterleri doğru kullan

YETENEKLERIN:
- Genel bilgi ve sohbet
- Hava durumu sorgulama
- Wikipedia araması
- Web araması
- Matematik hesaplamaları
- Süper Lig bilgileri`;
  }

  /**
   * Güncel tarih/saat ekle
   */
  getCurrentDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    const timeStr = now.toLocaleTimeString('tr-TR');

    return `**GÜNCEL TARİH VE SAAT:**
${dateStr} - ${timeStr}

**ÖNEMLİ:** Tarih/saat sorulduğunda MUTLAKA yukarıdaki bilgiyi kullan!`;
  }

  /**
   * Hata yönetimi
   */
  handleError(error) {
    // Rate limit hatası
    if (error.response?.status === 429) {
      return new Error('RATE_LIMIT_EXCEEDED');
    }

    // API key hatası
    if (error.response?.status === 401) {
      return new Error('INVALID_API_KEY');
    }

    // Timeout hatası
    if (error.code === 'ECONNABORTED') {
      return new Error('REQUEST_TIMEOUT');
    }

    // Genel API hatası
    if (error.response?.status) {
      return new Error(`API_ERROR_${error.response.status}`);
    }

    // Network hatası
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new Error('NETWORK_ERROR');
    }

    // Bilinmeyen hata
    return new Error(error.message || 'UNKNOWN_ERROR');
  }

  /**
   * Model bilgisini al
   */
  getModelInfo() {
    return {
      model: this.apiKey ? this.model : this.fallbackModel,
      provider: 'GROQ',
      keyType: this.apiKey ? 'primary' : 'fallback',
      available: !!(this.apiKey || this.fallbackKey)
    };
  }

  /**
   * API sağlık kontrolü
   */
  async healthCheck() {
    try {
      const response = await this.chat([], 'test', 'Sen bir test AI\'sın. Sadece "OK" yanıtı ver.');
      return {
        healthy: true,
        model: this.getModelInfo(),
        response: response
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = GroqProvider;
