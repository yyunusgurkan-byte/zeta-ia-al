// 🖼️ UPLOAD ROUTE
// Resim yükleme ve Vision analizi

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const VisionProvider = require('../ai/visionProvider');
const path = require('path');

const visionProvider = new VisionProvider();

/**
 * POST /api/upload
 * Resim yükle ve analiz et
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Dosya yüklendi mi kontrol et
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILE',
        message: '❌ Dosya yüklenmedi!'
      });
    }

    console.log(`📥 Resim yüklendi: ${req.file.filename}`);
    
    const imagePath = req.file.path;
    const userPrompt = req.body.prompt || "Bu resimde ne var? Türkçe detaylı açıkla.";

    // Vision özelliği var mı?
    if (!visionProvider.isAvailable()) {
      return res.json({
        success: true,
        message: '✅ Resim yüklendi ancak Vision API yapılandırılmamış.',
        file: {
          filename: req.file.filename,
          size: req.file.size,
          path: `/uploads/${req.file.filename}`
        },
        analysis: null
      });
    }

    // Vision ile analiz et
    console.log('🔍 Vision analizi başlatılıyor...');
    const analysis = await visionProvider.analyzeImage(imagePath, userPrompt);

    // Başarılı yanıt
    res.json({
      success: true,
      message: '✅ Resim yüklendi ve analiz edildi!',
      file: {
        filename: req.file.filename,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      },
      analysis: analysis
    });

  } catch (error) {
    console.error('❌ Upload hatası:', error);
    
    // Dosya yüklendiyse hata durumunda silebiliriz (opsiyonel)
    // if (req.file) fs.unlinkSync(req.file.path);

    res.status(500).json({
      success: false,
      error: 'UPLOAD_ERROR',
      message: error.message || 'Resim yüklenemedi!'
    });
  }
});

/**
 * POST /api/upload/analyze
 * Sadece resim URL'sini analiz et (dosya yüklemeden)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'NO_URL',
        message: '❌ Resim URL\'si gerekli!'
      });
    }

    if (!visionProvider.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'VISION_UNAVAILABLE',
        message: '❌ Vision API yapılandırılmamış!'
      });
    }

    const userPrompt = prompt || "Bu resimde ne var? Türkçe detaylı açıkla.";
    const analysis = await visionProvider.analyzeImage(imageUrl, userPrompt);

    res.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('❌ Analyze hatası:', error);
    res.status(500).json({
      success: false,
      error: 'ANALYSIS_ERROR',
      message: error.message || 'Resim analiz edilemedi!'
    });
  }
});

/**
 * GET /api/upload/status
 * Vision servisinin durumu
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    visionAvailable: visionProvider.isAvailable(),
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: '10MB'
  });
});

module.exports = router;
