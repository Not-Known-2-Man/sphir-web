/**
 * Pure locale detection between 'en' and 'es'.
 * - Saved locale in localStorage wins if valid ('en' or 'es')
 * - Otherwise first browser language starting with 'es' (case-insensitive) -> 'es'
 * - Otherwise -> 'en'
 *
 * @param {readonly string[]|string[]} [navigatorLanguages]
 * @param {string|null} [saved]
 * @returns {'en'|'es'}
 */
export function detectLocale(navigatorLanguages, saved) {
  if (saved === 'en' || saved === 'es') {
    return saved
  }

  const langs = Array.isArray(navigatorLanguages)
    ? navigatorLanguages
    : (typeof navigator !== 'undefined' && Array.isArray(navigator?.languages)
        ? navigator.languages
        : (typeof navigator !== 'undefined' && navigator?.language ? [navigator.language] : []))

  for (const lang of langs) {
    if (typeof lang === 'string' && lang.toLowerCase().startsWith('es')) {
      return 'es'
    }
  }

  return 'en'
}
