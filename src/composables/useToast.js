import { reactive } from 'vue'

let nextId = 0
export const toasts = reactive([])

export function useToast() {
  function show(message, type = 'success', duration = 3000) {
    const id = ++nextId
    toasts.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
  }
  function dismiss(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }
  return {
    success: (msg) => show(msg, 'success'),
    error:   (msg) => show(msg, 'error'),
    info:    (msg) => show(msg, 'info'),
    dismiss,
  }
}
