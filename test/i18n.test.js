import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { detectLocale } from '../src/detectLocale.js'
import en from '../src/locales/en.js'
import es from '../src/locales/es.js'

describe('detectLocale', () => {
  it('saved wins when valid', () => {
    assert.strictEqual(detectLocale(['en-US'], 'es'), 'es')
    assert.strictEqual(detectLocale(['es-MX'], 'en'), 'en')
    assert.strictEqual(detectLocale([], 'es'), 'es')
    assert.strictEqual(detectLocale([], 'en'), 'en')
  })

  it("detects ['es-MX'] -> es", () => {
    assert.strictEqual(detectLocale(['es-MX']), 'es')
  })

  it("detects ['en-US'] -> en", () => {
    assert.strictEqual(detectLocale(['en-US']), 'en')
  })

  it("detects ['fr'] -> en", () => {
    assert.strictEqual(detectLocale(['fr']), 'en')
  })

  it('detects [] -> en', () => {
    assert.strictEqual(detectLocale([]), 'en')
  })

  it('handles case-insensitivity and sub-tags', () => {
    assert.strictEqual(detectLocale(['ES']), 'es')
    assert.strictEqual(detectLocale(['es-419']), 'es')
    assert.strictEqual(detectLocale(['fr', 'es-ES']), 'es')
    assert.strictEqual(detectLocale(['de', 'it']), 'en')
  })

  it('falls back to browser languages if saved is invalid or null', () => {
    assert.strictEqual(detectLocale(['es-CO'], null), 'es')
    assert.strictEqual(detectLocale(['en-GB'], 'fr'), 'en')
  })
})

describe('dictionaries parity', () => {
  const enKeys = Object.keys(en).sort()
  const esKeys = Object.keys(es).sort()

  it('en and es have exactly the same keys', () => {
    const missingInEs = enKeys.filter(k => !(k in es))
    const missingInEn = esKeys.filter(k => !(k in en))

    assert.deepStrictEqual(
      missingInEs,
      [],
      `Keys present in en but missing in es: ${missingInEs.join(', ')}`
    )
    assert.deepStrictEqual(
      missingInEn,
      [],
      `Keys present in es but missing in en: ${missingInEn.join(', ')}`
    )
    assert.deepStrictEqual(enKeys, esKeys)
  })

  it('all keys in en have non-empty string values', () => {
    for (const [key, val] of Object.entries(en)) {
      assert.strictEqual(typeof val, 'string', `en[${key}] must be string`)
      assert.ok(val.trim().length > 0, `en[${key}] must not be empty`)
    }
  })

  it('all keys in es have non-empty string values', () => {
    for (const [key, val] of Object.entries(es)) {
      assert.strictEqual(typeof val, 'string', `es[${key}] must be string`)
      assert.ok(val.trim().length > 0, `es[${key}] must not be empty`)
    }
  })
})
