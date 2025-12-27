// validation.js - Player name validation with profanity filter

// Profanity word lists for multiple languages
// Common offensive words filtered (keeping list minimal but effective)
const PROFANITY_LISTS = {
  en: ['fuck', 'shit', 'ass', 'dick', 'cock', 'cunt', 'bitch', 'fag', 'slut', 'whore', 'nigga', 'nigger'],
  es: ['puta', 'mierda', 'coño', 'joder', 'cabron', 'pendejo', 'chingar', 'verga', 'culo', 'marica'],
  fr: ['merde', 'putain', 'connard', 'salope', 'enculer', 'bite', 'couilles', 'nique', 'bordel', 'pd'],
  de: ['scheiße', 'arsch', 'fotze', 'wichser', 'hurensohn', 'schwanz', 'ficken', 'hure', 'nazi'],
  pt: ['puta', 'merda', 'caralho', 'foda', 'buceta', 'pau', 'porra', 'viado', 'cuzao'],
  tl: ['puta', 'gago', 'bobo', 'tanga', 'putang', 'tang', 'ulol', 'pakyu'],
  ja: ['くそ', 'ちんこ', 'まんこ', 'ばか', 'しね', 'きちがい', 'ファック'],
  ko: ['씨발', '좆', '병신', '개새끼', '지랄', '미친'],
  zh: ['操', '妈逼', '傻逼', '屌', '他妈', '草泥马', '煞笔']
};

// Additional pattern-based checks
const OFFENSIVE_PATTERNS = [
  /n+[i1]+g+[g3]+[a4e]+/i, // n-word variations
  /f+[a4@]+g+/i, // anti-gay slurs
  /h+[i1]+t+l+[e3]+r+/i, // nazi reference
];

/**
 * Validate player name
 * @param {string} name - Player name to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePlayerName(name) {
  // Check if name exists
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  // Trim whitespace
  const trimmed = name.trim();

  // Check length (max 5 characters)
  // Using Array.from to correctly count unicode characters (handles emoji, CJK, etc.)
  const charCount = Array.from(trimmed).length;
  if (charCount === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (charCount > 5) {
    return { valid: false, error: 'Name must be 5 characters or less' };
  }

  // Check for profanity in all languages
  const lowerName = trimmed.toLowerCase();

  // Check direct word matches
  for (const [lang, words] of Object.entries(PROFANITY_LISTS)) {
    for (const word of words) {
      if (lowerName.includes(word.toLowerCase())) {
        return { valid: false, error: 'Name contains inappropriate content' };
      }
    }
  }

  // Check pattern-based matches
  for (const pattern of OFFENSIVE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Name contains inappropriate content' };
    }
  }

  return { valid: true };
}

/**
 * Sanitize player name (trim and limit)
 * @param {string} name - Raw player name
 * @returns {string} Sanitized name
 */
export function sanitizeName(name) {
  if (!name || typeof name !== 'string') return '';

  const trimmed = name.trim();
  const chars = Array.from(trimmed);

  // Return first 5 characters
  return chars.slice(0, 5).join('');
}
