<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('cancel')">
      <div class="confirm-box">
        <div class="confirm-icon">{{ icon }}</div>
        <p class="confirm-msg">{{ message || t('common.areYouSure') }}</p>
        <p v-if="sub" class="confirm-sub">{{ sub }}</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost btn-sm" @click="$emit('cancel')">{{ t('common.cancel') }}</button>
          <button class="btn btn-danger-solid btn-sm" :disabled="loading" @click="$emit('confirm')">
            <span v-if="loading" class="spinner"></span>
            <span v-else>{{ confirmText || t('common.delete') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { t } from '../i18n.js'

defineProps({
  message:     { type: String,  default: '' },
  sub:         { type: String,  default: '' },
  confirmText: { type: String,  default: '' },
  icon:        { type: String,  default: '🗑️' },
  loading:     { type: Boolean, default: false }
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-box {
  background: var(--bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 34px 30px 26px;
  width: 100%; max-width: 360px;
  text-align: center;
  animation: modal-in .18s ease;
}
@keyframes modal-in { from { transform: translateY(10px); opacity: 0 } to { transform: none; opacity: 1 } }

.confirm-icon { font-size: 36px; margin-bottom: 14px; }
.confirm-msg  { font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 600; color: var(--title); margin-bottom: 6px; }
.confirm-sub  { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
.confirm-actions { display: flex; justify-content: center; gap: 10px; margin-top: 22px; }
</style>
