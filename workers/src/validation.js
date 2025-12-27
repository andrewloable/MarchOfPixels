// validation.js - Player name validation with profanity filter
// TODO: Implement validation

// Profanity word lists for multiple languages
// TODO: Add comprehensive lists
const PROFANITY_LISTS = {
  en: [], // English
  es: [], // Spanish
  fr: [], // French
  de: [], // German
  pt: [], // Portuguese
  tl: [], // Filipino/Tagalog
  ja: [], // Japanese
  ko: [], // Korean
  zh: [], // Chinese
};

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
  // Note: Using Array.from to correctly count unicode characters
  const charCount = Array.from(trimmed).length;
  if (charCount === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (charCount > 5) {
    return { valid: false, error: 'Name must be 5 characters or less' };
  }

  // Check for profanity in all languages
  const lowerName = trimmed.toLowerCase();
  for (const [lang, words] of Object.entries(PROFANITY_LISTS)) {
    for (const word of words) {
      if (lowerName.includes(word.toLowerCase())) {
        return { valid: false, error: 'Name contains inappropriate content' };
      }
    }
  }

  return { valid: true };
}
