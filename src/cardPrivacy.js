// Per-card privacy lock. A card is private unless the API says is_private === false;
// a new card (no card yet) and a card without the field both count as private.
export function isCardPrivate(card) {
  return card?.is_private !== false
}

// The API only unlocks on an explicit boolean false, so always send a real boolean.
export function privatePayload(value) {
  return { is_private: value !== false }
}
