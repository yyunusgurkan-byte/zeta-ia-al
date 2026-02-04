// 🤖 GROQ AI PROVIDER
const axios = require('axios');
require('dotenv').config();

class GroqProvider {
  constructor() {
    // ❌ VITE_ YOK
    this.apiKey = process.env.GROQ_API_KEY;
    this.fallbackKey = process.env.FALLBACK_GROQ_API_KEY;

    this.model = process.env.AI_MODEL_NAME || 'llama-3.1-70b-versatile';
    this.fallbackModel = process.env.FALLBACK_MODEL_NAME || 'llama-3.1-8b-instant';

    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';

    console.log("🔑 GROQ KEY:", this.apiKey ? "VAR" : "YOK");

    if (!this.apiKey && !this.fallbackKey) {
      console.error('❌ GROQ API KEY bulunamadı! .env dosyanızı kontrol edin.');
    } else {
      console.log('✅ GROQ Provider initialized:', this.apiKey ? 'Primary Key' : 'Fallback Key');
    }
  }

  async chat(conversationHistory = [], userMessage = '', systemPrompt = null) {
    const apiKey = this.apiKey || this.fallbackKey;
    if (!apiKey) throw new Error('GROQ_API_KEY_MISSING');

    const model = this.apiKey ? this.model : this.fallbackModel;
    const messages = this.prepareMessages(conversationHistory, userMessage, systemPrompt);

    const response = await axios.post(
      this.baseURL,
      {
        model,
        messages,
        temperature: 0.2,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  // diğer fonksiyonlar aynı kalabilir
}

module.exports = GroqProvider;
