import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isCardPrivate, privatePayload } from '../src/cardPrivacy.js'

describe('isCardPrivate (toggle default and lock indicator)', () => {
  it('new card (no card) is private', () => {
    assert.strictEqual(isCardPrivate(null), true)
    assert.strictEqual(isCardPrivate(undefined), true)
  })
  it('card with is_private false is not private', () => {
    assert.strictEqual(isCardPrivate({ is_private: false }), false)
  })
  it('card with is_private true is private', () => {
    assert.strictEqual(isCardPrivate({ is_private: true }), true)
  })
  it('card without the field counts as private', () => {
    assert.strictEqual(isCardPrivate({ title: 'x' }), true)
    assert.strictEqual(isCardPrivate({ is_private: null }), true)
  })
})

describe('privatePayload', () => {
  it('always carries a boolean is_private', () => {
    assert.deepStrictEqual(privatePayload(true), { is_private: true })
    assert.deepStrictEqual(privatePayload(false), { is_private: false })
    assert.deepStrictEqual(privatePayload(undefined), { is_private: true })
    assert.deepStrictEqual(privatePayload('false'), { is_private: true })
  })
})
