// frontend/src/utils/formatters.js

/**
 * Tarihleri formatlar
 */
export const formatDate = (date, options = {}) => {
  const d = new Date(date);
  
  const defaults = {
    dateStyle: 'medium',
    timeStyle: 'short',
    locale: 'tr-TR'
  };
  
  const config = { ...defaults, ...options };
  
  return d.toLocaleString(config.locale, {
    dateStyle: config.dateStyle,
    timeStyle: config.timeStyle
  });
};

/**
 * Göreceli zaman formatı (X dk önce, Y saat önce vb.)
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days === 1) return 'Dün';
  if (days < 7) return `${days} gün önce`;
  if (weeks < 4) return `${weeks} hafta önce`;
  if (months < 12) return `${months} ay önce`;
  return `${years} yıl önce`;
};

/**
 * Dosya boyutunu formatlar
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Sayıları formatlar (binlik ayracı ile)
 */
export const formatNumber = (number, locale = 'tr-TR') => {
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Para birimi formatlar
 */
export const formatCurrency = (amount, currency = 'TRY', locale = 'tr-TR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Metni truncate eder (kısaltır)
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

/**
 * URL'i formatlar
 */
export const formatUrl = (url) => {
  if (!url) return '';
  
  // Protokol yoksa ekle
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  
  return url;
};

/**
 * Telefon numarasını formatlar
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Sadece rakamları al
  const cleaned = phone.replace(/\D/g, '');
  
  // Türkiye formatı: (5XX) XXX XX XX
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Markdown'ı temizler (plain text'e çevirir)
 */
export const stripMarkdown = (markdown) => {
  if (!markdown) return '';
  
  return markdown
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/^[-*+]\s+/gm, '') // Lists
    .replace(/^\d+\.\s+/gm, '') // Numbered lists
    .replace(/^>\s+/gm, '') // Blockquotes
    .trim();
};

/**
 * Kelime sayısını hesaplar
 */
export const wordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Okuma süresini hesaplar (ortalama okuma hızı: 200 kelime/dk)
 */
export const estimateReadingTime = (text, wordsPerMinute = 200) => {
  const words = wordCount(text);
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes === 1 ? '1 dakika' : `${minutes} dakika`;
};

/**
 * Renk kodunu formatlar
 */
export const formatColor = (color) => {
  if (!color) return '#000000';
  
  // Hex renk kontrolü
  if (color.startsWith('#')) {
    return color;
  }
  
  // RGB/RGBA'yı hex'e çevir
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  return color;
};

/**
 * Slug oluşturur (URL-friendly string)
 */
export const slugify = (text) => {
  if (!text) return '';
  
  const trMap = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  
  return text
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * İlk harfi büyük yapar
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Her kelimenin ilk harfini büyük yapar
 */
export const titleCase = (text) => {
  if (!text) return '';
  return text.split(' ').map(word => capitalize(word)).join(' ');
};