// frontend/src/utils/validators.js

/**
 * Email validasyonu
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * URL validasyonu
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Telefon numarası validasyonu (Türkiye)
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Türkiye: 10 haneli ve 5 ile başlayan
  return cleaned.length === 10 && cleaned.startsWith('5');
};

/**
 * Şifre güvenlik kontrolü
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, errors: ['Şifre boş olamaz'] };
  }
  
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Metin uzunluğu kontrolü
 */
export const validateLength = (text, min = 0, max = Infinity) => {
  if (!text) return min === 0;
  const length = text.trim().length;
  return length >= min && length <= max;
};

/**
 * Sadece rakam kontrolü
 */
export const isNumeric = (value) => {
  return /^\d+$/.test(value);
};

/**
 * Sadece harf kontrolü (Türkçe karakterler dahil)
 */
export const isAlpha = (value) => {
  return /^[a-zA-ZğüşıöçĞÜŞİÖÇ]+$/.test(value);
};

/**
 * Alfanumerik kontrolü
 */
export const isAlphanumeric = (value) => {
  return /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]+$/.test(value);
};

/**
 * Dosya boyutu kontrolü (bytes)
 */
export const validateFileSize = (file, maxSizeInMB = 10) => {
  if (!file) return false;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Dosya tipi kontrolü
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) return false;
  if (allowedTypes.length === 0) return true;
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  return allowedTypes.some(type => {
    // Extension kontrolü
    if (type.startsWith('.')) {
      return fileExtension === type.substring(1);
    }
    // MIME type kontrolü
    return mimeType === type || mimeType.startsWith(type + '/');
  });
};

/**
 * Kredi kartı numarası validasyonu (Luhn algoritması)
 */
export const validateCreditCard = (cardNumber) => {
  if (!cardNumber) return false;
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Tarih validasyonu
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Gelecek tarih kontrolü
 */
export const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

/**
 * Geçmiş tarih kontrolü
 */
export const isPastDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

/**
 * Yaş kontrolü (18+)
 */
export const isAdult = (birthDate) => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= 18;
};

/**
 * TC Kimlik No validasyonu
 */
export const validateTCKN = (tckn) => {
  if (!tckn || tckn.length !== 11 || !isNumeric(tckn)) {
    return false;
  }
  
  // İlk hane 0 olamaz
  if (tckn[0] === '0') {
    return false;
  }
  
  const digits = tckn.split('').map(Number);
  
  // 10. hane kontrolü
  const sum10 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7 -
                 (digits[1] + digits[3] + digits[5] + digits[7]);
  if (sum10 % 10 !== digits[9]) {
    return false;
  }
  
  // 11. hane kontrolü
  const sum11 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sum11 % 10 !== digits[10]) {
    return false;
  }
  
  return true;
};

/**
 * Form validasyonu
 */
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = values[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (rule.required && !value) {
        errors[field] = rule.message || `${field} zorunludur`;
      }
      
      if (rule.minLength && value && value.length < rule.minLength) {
        errors[field] = rule.message || `${field} en az ${rule.minLength} karakter olmalıdır`;
      }
      
      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors[field] = rule.message || `${field} en fazla ${rule.maxLength} karakter olabilir`;
      }
      
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} geçerli değil`;
      }
      
      if (rule.validator && value && !rule.validator(value)) {
        errors[field] = rule.message || `${field} geçerli değil`;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * XSS temizleme
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, char => map[char]);
};