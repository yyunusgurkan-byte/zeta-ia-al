# 🔑 API ANAHTARLARI NASIL ALINIR?

## ⚠️ ÖNEMLİ NOTLAR
- API anahtarlarını **asla GitHub'a yükleme**!
- `.env` dosyası `.gitignore` içinde olmalı
- Her servisin ücretsiz limitleri var

---

## 🤖 1. GROQ API KEY (ZORUNLU!)

### Neden Gerekli?
Ana AI modeli (Llama 3.1 70B) için

### Nasıl Alınır?
1. **Git:** https://console.groq.com
2. **Kayıt Ol:** Google/GitHub ile giriş yap
3. **API Keys:** Sol menüden "API Keys" tıkla
4. **Create Key:** "Create API Key" butonu
5. **Kopyala:** `gsk_...` ile başlayan anahtarı kopyala
6. **.env'ye Yapıştır:**
   ```
   VITE_GROQ_API_KEY=gsk_xxxxxxxxxxx
   ```

### Limitler (Ücretsiz)
- ✅ **30 istek/dakika**
- ✅ **14,400 istek/gün**
- ✅ Sınırsız token

### Alternatif Model
Eğer limit doluyorsa:
```
AI_MODEL_NAME=llama-3.1-8b-instant
```

---

## 👁️ 2. OPENAI API KEY (Opsiyonel)

### Neden Gerekli?
Sadece **görsel analiz** (image upload) için

### Nasıl Alınır?
1. **Git:** https://platform.openai.com/signup
2. **Kayıt Ol:** Email ile kayıt
3. **API Keys:** https://platform.openai.com/api-keys
4. **Create Key:** "+ Create new secret key"
5. **Kopyala:** `sk-proj-...` ile başlayan anahtarı kopyala
6. **.env'ye Yapıştır:**
   ```
   VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxx
   ```

### Limitler
- ⚠️ **Ücretli** (ilk $5 ücretsiz kredi)
- GPT-4o Vision: ~$0.01 per image

### Alternatif (Ücretsiz)
GROQ'ta Llama Vision kullan:
```javascript
model: 'llama-3.2-11b-vision-preview'
```

---

## 🌤️ 3. WEATHER API KEY (Önerilir)

### Neden Gerekli?
Hava durumu sorguları için

### Nasıl Alınır?
1. **Git:** https://www.weatherapi.com/signup.aspx
2. **Kayıt Ol:** Email ile ücretsiz kayıt
3. **Dashboard:** Giriş yaptıktan sonra dashboard
4. **API Key:** "Your API Key" bölümünü kopyala
5. **.env'ye Yapıştır:**
   ```
   WEATHER_API_KEY=xxxxxxxxxxxxxxx
   ```

### Limitler (Ücretsiz)
- ✅ **1,000,000 çağrı/ay**
- ✅ 3 günlük tahmin
- ✅ Gerçek zamanlı hava

### Mevcut Key
Şu an `.env` dosyasında demo key var:
```
WEATHER_API_KEY=2faa8467f79840a3b4e181528253011
```
Bu çalışıyor ama kendi key'ini alman önerilir.

---

## 🌐 4. WEB SEARCH API (Opsiyonel)

### Seçenek A: DuckDuckGo (ÜCRETSİZ, KEY GEREKMİYOR)
Şu an kullandığımız bu, API key gerektirmez!

### Seçenek B: SerpAPI (100 arama/ay ücretsiz)
1. **Git:** https://serpapi.com/manage-api-key
2. **Kayıt Ol:** Google ile giriş
3. **API Key:** Dashboard'dan kopyala
4. **.env'ye Yapıştır:**
   ```
   SERPAPI_KEY=xxxxxxxxxxxxxxx
   ```

### Seçenek C: Google Custom Search
1. **Git:** https://developers.google.com/custom-search/v1/introduction
2. **API Key Al:** Google Cloud Console'dan
3. **Search Engine ID:** https://cse.google.com/cse/all
4. **.env'ye Yapıştır:**
   ```
   GOOGLE_CUSTOM_SEARCH_KEY=xxxxxxx
   GOOGLE_SEARCH_ENGINE_ID=xxxxxxx
   ```

**Öneri:** DuckDuckGo yeterli, başkasına gerek yok.

---

## ⚽ 5. SPORTS API (Opsiyonel)

### Şu An
Mock veri kullanıyoruz (gerçek API yok)

### Gelecekte Eklenebilir
**API-Football.com:**
1. **Git:** https://www.api-football.com/
2. **Kayıt Ol:** Ücretsiz plan
3. **API Key:** Dashboard'dan al
4. **.env'ye Yapıştır:**
   ```
   API_FOOTBALL_KEY=xxxxxxxxxxxxxxx
   ```

**Limitler:** 100 istek/gün (ücretsiz)

---

## 📋 HIZLI KURULUM

### Minimum (Çalışması için)
```env
VITE_GROQ_API_KEY=gsk_xxxxx
WEATHER_API_KEY=2faa8467f79840a3b4e181528253011
```

### Tam Özellikli
```env
VITE_GROQ_API_KEY=gsk_xxxxx
VITE_OPENAI_API_KEY=sk-proj-xxxxx
WEATHER_API_KEY=xxxxx
SERPAPI_KEY=xxxxx
```

---

## ✅ KONTROL LİSTESİ

- [ ] GROQ API Key alındı ve eklendi
- [ ] Weather API Key alındı (veya demo key kullanılıyor)
- [ ] OpenAI API Key (sadece görsel analiz için)
- [ ] .env dosyası .gitignore'da
- [ ] .env.example dosyası GitHub'a yüklendi

---

## 🔒 GÜVENLİK İPUÇLARI

1. **API anahtarlarını asla paylaşma**
2. **Frontend'de kullanma** (sadece backend)
3. **GitHub'a yükleme** (.gitignore kontrol et)
4. **Rate limitlere dikkat et**
5. **Düzenli olarak rotate et** (değiştir)

---

## 🆘 SORUN GİDERME

### "API Key Invalid" Hatası
- Key'i doğru kopyaladın mı?
- Başında/sonunda boşluk var mı?
- Key aktif mi? (Dashboard'dan kontrol et)

### "Rate Limit Exceeded"
- 30 istek/dakika limitini aştın
- 12 dakika bekle veya başka key kullan

### "Network Error"
- İnternet bağlantını kontrol et
- API servisi down olabilir (status.groq.com)

---

**Son güncelleme:** 28 Ocak 2026
