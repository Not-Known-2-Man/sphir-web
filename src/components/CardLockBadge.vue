<template>
  <span v-if="isCardPrivate(card)" class="badge badge-private card-lock" role="img"
    :title="t('card.private')" :aria-label="t('card.private')">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    {{ t('card.private') }}
  </span>
</template>

<script setup>
import { isCardPrivate } from '../cardPrivacy.js'
import { t } from '../i18n.js'

defineProps({ card: { type: Object, required: true } })
</script>

<style scoped>
.card-lock { align-self: flex-start; padding: 2px 8px; font-size: 11px; }
</style>
