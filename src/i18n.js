import { ref } from 'vue'
import en from './locales/en.js'
import es from './locales/es.js'
import { detectLocale } from './detectLocale.js'

export const STORAGE_KEY = 'sphir_locale'

const dictionaries = { en, es }

const savedLocale = typeof localStorage !== 'undefined'
  ? (localStorage.getItem(STORAGE_KEY) || localStorage.getItem('locale'))
  : null

export const locale = ref(detectLocale(undefined, savedLocale))

// Sync initial document language
if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value
}

/**
 * Set current locale ('en' | 'es')
 * Persists to localStorage and updates document.documentElement.lang
 * @param {'en'|'es'} newLocale
 */
export function setLocale(newLocale) {
  if (newLocale !== 'en' && newLocale !== 'es') return
  locale.value = newLocale
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newLocale)
    localStorage.setItem('locale', newLocale)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = newLocale
  }
}

/**
 * Translate key with optional parameter interpolation
 * Fallback to English when Spanish key is missing
 * @param {string} key
 * @param {Record<string, any>} [params]
 * @returns {string}
 */
export function t(key, params) {
  const currentDict = dictionaries[locale.value] || dictionaries.en
  let val = currentDict?.[key]
  if (val === undefined || val === null) {
    val = dictionaries.en?.[key]
  }
  if (val === undefined || val === null) {
    return key
  }
  let str = String(val)
  if (params && typeof params === 'object') {
    str = str.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, paramKey) => {
      return paramKey in params ? params[paramKey] : match
    })
  }
  return str
}

/**
 * Format date using current locale
 * @param {string|number|Date} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!date) return ''
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale.value, options)
}
