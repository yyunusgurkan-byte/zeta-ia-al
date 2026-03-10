// 🔍 ZETA AI - SEO & Analytics Manager

const GA_ID = 'G-8F2F4YHKSG';

// ── GOOGLE ANALYTICS 4 ────────────────────────────────────
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  // GA4 Script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('✅ Google Analytics başlatıldı:', GA_ID);
}

// ── EVENT TRACKING ────────────────────────────────────────
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

// Zeta özel eventleri
export function trackWidget(widgetName) {
  trackEvent('widget_open', { widget_name: widgetName });
}

export function trackMessage(messageType = 'chat') {
  trackEvent('message_sent', { message_type: messageType });
}

export function trackSearch(query) {
  trackEvent('search', { search_term: query.substring(0, 100) });
}

// ── STRUCTURED DATA (Schema.org) ─────────────────────────
export function injectStructuredData() {
  if (typeof window === 'undefined') return;

  const schemas = [
    // SoftwareApplication
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Zeta AI',
      url: 'https://alzeta.site/',
      operatingSystem: 'Web',
      applicationCategory: 'UtilitiesApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
      description: 'Döviz, altın, hava durumu, canlı maç, nöbetçi eczane, puan tablosu ve web araması yapabilen ücretsiz Türkçe yapay zeka asistanı.',
      featureList: [
        'Gerçek zamanlı döviz ve altın fiyatları',
        'Hava durumu ve hava haritası',
        'Canlı maç skorları',
        'Nöbetçi eczane sorgulama',
        'Süper Lig puan tablosu',
        'İddaa oranları',
        'YouTube müzik çalar',
        'Web araması',
        'Resim analizi',
        'LLaMA 3.3 70B yapay zeka modeli'
      ],
      author: { '@type': 'Organization', name: 'Zeta AI Team', url: 'https://alzeta.site/' },
      inLanguage: 'tr',
      isAccessibleForFree: true
    },
    // WebSite + SearchAction
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Zeta AI',
      url: 'https://alzeta.site/',
      inLanguage: 'tr',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://alzeta.site/?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    // FAQPage
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Zeta AI nedir?',
          acceptedAnswer: { '@type': 'Answer', text: 'Zeta AI, Groq LLaMA 3.3 altyapısıyla çalışan ücretsiz Türkçe yapay zeka asistanıdır.' }
        },
        {
          '@type': 'Question',
          name: 'Zeta AI ücretsiz mi?',
          acceptedAnswer: { '@type': 'Answer', text: 'Evet, Zeta AI tamamen ücretsizdir ve kayıt gerektirmez.' }
        },
        {
          '@type': 'Question',
          name: 'Zeta AI ile döviz kuru öğrenebilir miyim?',
          acceptedAnswer: { '@type': 'Answer', text: 'Evet, anlık dolar, euro, altın ve kripto fiyatlarını öğrenebilirsiniz.' }
        },
        {
          '@type': 'Question',
          name: 'Zeta AI ile nöbetçi eczane bulabilir miyim?',
          acceptedAnswer: { '@type': 'Answer', text: 'Evet, şehir ve ilçe seçerek nöbetçi eczaneleri listeleyebilirsiniz.' }
        },
        {
          '@type': 'Question',
          name: 'Zeta AI hangi yapay zeka modelini kullanıyor?',
          acceptedAnswer: { '@type': 'Answer', text: 'Groq altyapısı üzerinde LLaMA 3.3 70B modelini kullanmaktadır.' }
        }
      ]
    }
  ]

  schemas.forEach((schema, i) => {
    const existing = document.getElementById(`schema-${i}`)
    if (existing) existing.remove()
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = `schema-${i}`
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
  })

  console.log('✅ Structured data enjekte edildi')
}

// ── SİTEMAP GENERATOR ────────────────────────────────────
export function generateSitemap() {
  const urls = [
    { loc: 'https://alzeta.site/', priority: '1.0', changefreq: 'daily' },
  ]

  const today = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return xml
}

// ── META TAG GÜNCELLE ─────────────────────────────────────
export function updateMetaTags({ title, description } = {}) {
  if (title) document.title = title
  if (description) {
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
  }
}

// ── HEPSINI BAŞLAT ────────────────────────────────────────
export function initSEO() {
  initAnalytics()
  injectStructuredData()
  console.log('✅ Zeta SEO başlatıldı')
}
