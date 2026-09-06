/**
 * Turkish Search Normalization & Matching Engine
 * 
 * Safely handles Turkish character quirks:
 * - 'İ' -> 'i'
 * - 'I' -> 'i' or 'ı'
 * - 'ş' -> 's', 'ç' -> 'c', 'ğ' -> 'g', 'ü' -> 'u', 'ö' -> 'o'
 * 
 * Ensures searches like 'kadikoy', 'KADIKÖY', 'bostanci', 'buyukada'
 * match 100% accurately against official names.
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

export function matchesTurkishSearch(target: string | null | undefined, query: string | null | undefined): boolean {
  if (!query || query.trim() === '') return true;
  if (!target) return false;

  const normTarget = normalizeTurkishText(target);
  const normQuery = normalizeTurkishText(query);

  if (normTarget.includes(normQuery)) return true;

  const queryTokens = normQuery.split(' ').filter(t => t.length > 0);
  return queryTokens.every(token => normTarget.includes(token));
}
