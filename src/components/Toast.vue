<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          @click="dismiss(toast.id)"
        >
          <span class="toast-icon">{{ ICONS[toast.type] }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { toasts, useToast } from '../composables/useToast.js'

const { dismiss } = useToast()
const ICONS = { success: '✅', error: '❌', info: 'ℹ️' }
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  pointer-events: auto;
  cursor: pointer;
  white-space: nowrap;
  max-width: 460px;
}
.toast-success { background: #4CAF50; color: #fff; }
.toast-error   { background: #FF4444; color: #fff; }
.toast-info    { background: #FFC107; color: #333; }

.toast-enter-active { animation: toast-in .22s ease; }
.toast-leave-active { animation: toast-out .22s ease forwards; }

@keyframes toast-in  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes toast-out { from { opacity: 1; transform: none; }  to { opacity: 0; transform: translateY(8px); } }
</style>
