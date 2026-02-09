// 🚀 ZETA AI - BACKEND SERVER
const express = require('express');
const cors = require('cors');
const path = require('path');
const { chatLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversation');
const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/upload'); // ← YENİ

const app = express();
const PORT = process.env.PORT || 3001;

// Load environment variables
require('dotenv').config();

// ====================================================================
// TRUST PROXY AYARI (Railway, Heroku vb. için GEREKLİ)
// ====================================================================
app.set('trust proxy', true);

// ====================================================================
// MIDDLEWARE
// ====================================================================
app.use(cors({
  origin: [
    'http://www.alzeta.site', 
    'http://alzeta.site', 
    'https://www.alzeta.site', 
    'https://alzeta.site',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📂 STATIK DOSYA SUNUMU (Frontend için)
app.use(express.static(path.join(__dirname, '../')));

// 📁 Upload klasörünü statik olarak servis et
app.use('/uploads', express.static(path.join(__dirname, 'storage/uploads'))); // ← YENİ

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ====================================================================
// ROUTES
// ====================================================================
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/upload', uploadRoutes); // ← YENİ
app.use('/health', healthRoutes);

// Root endpoint
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Zeta AI Backend',
    version: '1.0.0',
    status: 'running'
  });
});

// 🌐 FRONTEND YONLENDIRMESI
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ====================================================================
// ERROR HANDLING
// ====================================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ====================================================================
// SERVER START
// ====================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('🤖 ZETA AI BACKEND');
  console.log('🚀 ================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://www.alzeta.site'}`);
  console.log(`⏰ Started: ${new Date().toLocaleString('tr-TR')}`);
  console.log('🚀 ================================');
  console.log('');
});

module.exports = app;