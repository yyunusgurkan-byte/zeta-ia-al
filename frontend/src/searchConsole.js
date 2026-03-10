// 🔍 ZETA AI - Google Search Console & SEO Optimizer

// ── SEARCH CONSOLE DOĞRULAMA ─────────────────────────────
export function injectSearchConsoleVerification() {
  if (document.querySelector('meta[name="google-site-verification"]')) return
  const meta = document.createElement('meta')
  meta.name = 'google-site-verification'
  meta.content = 'kj-Q7-PB8UY8L7inP6LSY2H5QY2oRbpD2UGYh5mnLA4'
  document.head.appendChild(meta)
}

// ── CANONICAL URL ─────────────────────────────────────────
export function setCanonical(url = 'https://alzeta.site/') {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
}

// ── BREADCRUMB SCHEMA ─────────────────────────────────────
export function injectBreadcrumb() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://alzeta.site/'
      }
    ]
  }
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'schema-breadcrumb'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

// ── ORGANIZATION SCHEMA ───────────────────────────────────
export function injectOrganization() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zeta AI',
    url: 'https://alzeta.site/',
    logo: 'https://i.hizliresim.com/49dkv1y.png',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: 'Turkish'
    }
  }
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'schema-org'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

// ── SAYFA PERFORMANS META ─────────────────────────────────
export function injectPerformanceMeta() {
  const metas = [
    { httpEquiv: 'x-dns-prefetch-control', content: 'on' },
  ]
  metas.forEach(({ name, httpEquiv, content }) => {
    const meta = document.createElement('meta')
    if (name) meta.name = name
    if (httpEquiv) meta.httpEquiv = httpEquiv
    meta.content = content
    document.head.appendChild(meta)
  })

  // DNS prefetch
  const domains = [
    'https://zeta-ai-backend.onrender.com',
    'https://www.googletagmanager.com',
    'https://widget.paratic.com',
    'https://wttr.in',
  ]
  domains.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = href
    document.head.appendChild(link)
  })
}

// ── ARAMA MOTORU PİNG ─────────────────────────────────────
export async function pingSitemapToGoogle() {
  try {
    const sitemapUrl = encodeURIComponent('https://alzeta.site/sitemap.xml')
    await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`, { mode: 'no-cors' })
    console.log('✅ Sitemap Google\'a ping gönderildi')
  } catch (e) {
    console.log('ℹ️ Sitemap ping:', e.message)
  }
}

// ── HEPSINI BAŞLAT ────────────────────────────────────────
export function initSearchConsole() {
  injectSearchConsoleVerification()
  setCanonical()
  injectBreadcrumb()
  injectOrganization()
  injectPerformanceMeta()
  pingSitemapToGoogle()
  console.log('✅ Search Console SEO başlatıldı')
}
