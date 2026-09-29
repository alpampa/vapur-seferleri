/**
 * Turkish Search Normalization & Fuzzy Matching Engine
 * 
 * Safely handles Turkish character quirks:
 * - 'İ' -> 'i', 'I' -> 'i' / 'ı'
 * - 'ş' -> 's', 'ç' -> 'c', 'ğ' -> 'g', 'ü' -> 'u', 'ö' -> 'o'
 * 
 * Features:
 * - Synonym / Alias matching (e.g. 'adalar' matches Büyükada, Heybeliada, Burgazada, Kınalıada, Sedef)
 * - Typo-tolerant Levenshtein distance (1 typo allowed for words >= 4 characters)
 * - Multi-token search matching
 */

export function normalizeTurkishText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 99;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

const ISLAND_KEYWORDS = ['buyukada', 'heybeliada', 'burgazada', 'kinaliada', 'sedef', 'ada', 'adalar'];

export function matchesTurkishSearch(target: string | null | undefined, query: string | null | undefined): boolean {
  if (!query || query.trim() === '') return true;
  if (!target) return false;

  const normTarget = normalizeTurkishText(target);
  const normQuery = normalizeTurkishText(query);

  // Exact or substring match
  if (normTarget.includes(normQuery)) return true;

  // Island alias search (e.g. searching 'adalar' matches any island pier)
  if (normQuery === 'adalar' || normQuery === 'adasi' || normQuery === 'adalari') {
    if (ISLAND_KEYWORDS.some(k => normTarget.includes(k))) return true;
  }

  const queryTokens = normQuery.split(' ').filter(t => t.length > 0);
  const targetWords = normTarget.split(' ').filter(w => w.length > 0);

  return queryTokens.every(token => {
    // 1. Direct substring in target
    if (normTarget.includes(token)) return true;

    // 2. Island alias per token
    if (token === 'adalar' && ISLAND_KEYWORDS.some(k => normTarget.includes(k))) return true;

    // 3. Typo-tolerant matching (Levenshtein distance <= 1 for tokens of 4+ chars)
    if (token.length >= 4) {
      return targetWords.some(word => {
        if (word.length >= 4 && Math.abs(word.length - token.length) <= 1) {
          return levenshteinDistance(word, token) <= 1;
        }
        return false;
      });
    }

    return false;
  });
}
