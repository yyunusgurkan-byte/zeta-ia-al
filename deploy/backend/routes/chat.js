// 💬 CHAT ROUTE
// Ana sohbet endpoint'i

const express = require('express');
const router = express.Router();
const ZetaOrchestrator = require('../core/orchestrator');

// Orchestrator instance
const orchestrator = new ZetaOrchestrator();

/**
 * POST /api/chat
 * Ana chat endpoint'i
 */
router.post('/', async (req, res) => {
  try {
    const { message, conversationId, history } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '⚠️ Mesaj gerekli'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_MESSAGE',
        message: '⚠️ Mesaj boş olamaz'
      });
    }

    // =========================
    // HISTORY NORMALIZATION
    // =========================
    const safeHistory = Array.isArray(history)
      ? history
          .map(h => ({
            role: h.role || (h.sender === 'user' ? 'user' : 'assistant'),
            content: h.content || h.text || ''
          }))
          .filter(h => h.content && typeof h.content === 'string')
      : [];

    console.log('💬 Chat request:', message.substring(0, 50));
    console.log('🧠 History length:', safeHistory.length);

    // =========================
    // ORCHESTRATOR CALL (SAFE)
    // =========================
    let result;
    try {
      result = await orchestrator.process(message, safeHistory);
    } catch (err) {
      console.error('❌ Orchestrator crash:', err);
      return res.status(500).json({
        success: false,
        error: 'ORCHESTRATOR_CRASH',
        message: 'AI işlem sırasında hata verdi'
      });
    }

    // =========================
    // RESPONSE HANDLING
    // =========================
    if (!result || !result.type) {
      return res.status(500).json({
        success: false,
        error: 'INVALID_ORCHESTRATOR_RESPONSE',
        message: 'Geçersiz AI yanıtı'
      });
    }

    // ✅ Başarılı yanıt
    if (result.type === 'success') {
      return res.json({
        success: true,
        response: result.message,
        conversationId: conversationId || `conv_${Date.now()}`,
        toolUsed: result.toolUsed || null,
        metadata: {
          timestamp: new Date().toISOString(),
          messageLength: result.message?.length || 0,
          toolData: result.toolData || null
        }
      });
    }

    // 🛑 Güvenlik engeli
    if (result.type === 'safety_block') {
      return res.status(400).json({
        success: false,
        error: 'SAFETY_BLOCK',
        message: result.message,
        reason: result.reason || 'policy'
      });
    }

    // ❌ Kontrollü hata
    if (result.type === 'error') {
      return res.status(500).json({
        success: false,
        error: 'PROCESSING_ERROR',
        message: result.message || 'AI işlem hatası'
      });
    }

    // ❓ Bilinmeyen tip
    return res.status(500).json({
      success: false,
      error: 'UNKNOWN_RESPONSE_TYPE',
      message: 'Beklenmeyen AI yanıt tipi'
    });

  } catch (error) {
    console.error('❌ Chat route fatal error:', error);
    return res.status(500).json({
      success: false,
      error: 'CHAT_ROUTE_FATAL',
      message: 'Sunucu hatası'
    });
  }
});

/**
 * GET /api/chat/tools
 */
router.get('/tools', (req, res) => {
  try {
    const tools = orchestrator.listTools();
    res.json({
      success: true,
      tools,
      count: tools.length
    });
  } catch (error) {
    console.error('❌ Tools list error:', error);
    res.status(500).json({
      success: false,
      error: 'TOOLS_LIST_ERROR',
      message: 'Tool listesi alınamadı'
    });
  }
});

/**
 * GET /api/chat/status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'Zeta AI Chat',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
