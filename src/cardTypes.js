// Shared card-type vocabulary and card helpers.
// A card's type is stored as the hidden tag "_<type>" (underscore tags are never shown).

import { t } from './i18n.js'

export const TYPE_LABEL_EN = {
  article: 'ARTICLE', video: 'VIDEO', recipe: 'RECIPE', social: 'SOCIAL POST',
  product: 'PRODUCT', business: 'BUSINESS', text: 'TEXT', media: 'MEDIA',
  scribe: 'ORIGINAL SCRIBE', originalScribe: 'ORIGINAL SCRIBE', // iOS stores "_originalScribe"
  url: 'LINK', note: 'NOTE', photo: 'PHOTO', screenshot: 'SCREENSHOT', contact: 'CONTACT',
}

export const TYPE_LABEL = new Proxy(TYPE_LABEL_EN, {
  get(target, prop) {
    if (typeof prop === 'string' && prop in target) {
      return t(`cardType.${prop}`)
    }
    return Reflect.get(target, prop)
  }
})

export const TYPE_EMOJI = {
  article: '📰', video: '🎬', recipe: '🍳', social: '💬', product: '🛍️',
  business: '💼', text: '📄', media: '🎞️', scribe: '✍️', originalScribe: '✍️',
  url: '🔗', note: '📝', photo: '📷', screenshot: '🖼️', contact: '👤',
}

export function parseTags(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p.filter(Boolean) } catch {}
    return raw.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

function isInstagramReel(website) {
  try {
    const u = new URL(website)
    return /(^|\.)instagram\.com$/.test(u.hostname) && /^\/reels?\//.test(u.pathname)
  } catch { return false }
}

// Label of the card's stored type, or '' when it has no type tag.
// Social cards from an Instagram reel read "INSTAGRAM REEL" (Figma).
export function typeLabel(card) {
  const tags = parseTags(card?.tags)
  for (const k of Object.keys(TYPE_LABEL_EN)) {
    if (!tags.includes(`_${k}`)) continue
    return k === 'social' && isInstagramReel(card?.website)
      ? t('cardType.instagramReel')
      : t(`cardType.${k}`)
  }
  return ''
}

export function visibleTags(card) { return parseTags(card.tags).filter(t => !t.startsWith('_')) }

export function cardPrice(card) { return String(card?.price ?? '').trim() }

// [primary, ...extras]; falls back to folder_id when the API has no folder_ids yet.
export function cardFolderIds(card) {
  if (Array.isArray(card?.folder_ids) && card.folder_ids.length) return card.folder_ids.map(String)
  return card?.folder_id !== null && card?.folder_id !== undefined && card?.folder_id !== ''
    ? [String(card.folder_id)] : []
}

export function cardInFolder(card, folderId) {
  return cardFolderIds(card).includes(String(folderId))
}
