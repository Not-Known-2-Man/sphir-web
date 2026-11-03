<template>
  <div class="app-root" :class="{ 'has-header': store.isLoggedIn }">
    <Toast />
    <!-- Fixed global header -->
    <header v-if="store.isLoggedIn" class="site-header">
      <div class="header-inner">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 1.5C5.36 1.5 1.5 5.36 1.5 10S5.36 18.5 10 18.5 18.5 14.64 18.5 10C18.5 7.62 17.55 5.47 16 3.92" stroke="#8A7A5E" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M10 4.5C7.01 4.5 4.5 7.01 4.5 10S7.01 15.5 10 15.5" stroke="#8A7A5E" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M10 7.5C8.62 7.5 7.5 8.62 7.5 10S8.62 12.5 10 12.5C11.38 12.5 12.5 11.38 12.5 10" stroke="#8A7A5E" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <span class="logo-text">SPHIR</span>
        </router-link>

        <!-- Right-side actions -->
        <div class="header-right">
          <button class="header-pill" @click="handleCreateCard">+ Card</button>
          <router-link to="/" class="header-pill">Sphirs</router-link>

          <!-- Notification icon -->
          <button class="header-icon-btn" title="Notifications" aria-label="Notifications">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          <!-- Connections icon -->
          <button class="header-icon-btn" title="Connections" aria-label="Connections">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>

          <!-- Lightning icon -->
          <button class="header-icon-btn" title="Activity" aria-label="Activity">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </button>

          <!-- Avatar -->
          <router-link to="/settings" class="header-avatar" :title="store.displayName">
            {{ avatarLetter }}
          </router-link>
        </div>
      </div>
    </header>

    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Toast from './components/Toast.vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from './store.js'

const router = useRouter()
const route  = useRoute()

const avatarLetter = computed(() => (store.displayName || 'U').charAt(0).toUpperCase())

function handleCreateCard() {
  store.pendingCreateCard = true
  if (route.path !== '/') router.push('/')
}
</script>

<style>
/* ── Reset ────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Design tokens ────────────────────────────────────────────────────── */
:root {
  --bg:         #FFFFFF;
  --surface:    #F6F5F2;
  --surface-2:  #F0EDE8;
  --card-body:  rgba(255,255,255,0.9);
  --border:     #E8E3DC;
  --border-dk:  #D4CCC3;
  --accent:     #8A7A5E;
  --accent-dk:  #6F5E4E;
  --accent-lt:  #C4A882;
  --text:       #333333;
  --title:      #414651;
  --text-muted: #8A8279;
  --text-light: #B0A89E;
  --danger:     #C0392B;
  --danger-bg:  #FEF2F2;
  --danger-bd:  #FCA5A5;
  --success:    #4CAF50;
  --radius:     12px;
  --radius-lg:  16px;
  --radius-xl:  20px;
  --radius-card: 28px;
  --radius-pill: 200px;
  --header-h:   60px;
  --shadow:     0 2px 16px rgba(138,122,94,.08);
  --shadow-md:  0 4px 28px rgba(138,122,94,.13);
  --shadow-lg:  0 8px 48px rgba(138,122,94,.18);
}

/* ── Base ─────────────────────────────────────────────────────────────── */
body {
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
h1, h2, h3, .display { font-family: 'Poppins', sans-serif; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; outline: none; }
input, select, textarea { font-family: inherit; outline: none; }

/* ── App root ─────────────────────────────────────────────────────────── */
.app-root { min-height: 100vh; }
.app-root.has-header { padding-top: var(--header-h); }

/* ── Fixed header ─────────────────────────────────────────────────────── */
.site-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--header-h);
  background: #FFFFFF;
  border-bottom: 1px solid var(--border);
  z-index: 100;
}
.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none;
}
.logo-text {
  font-family: 'Poppins', sans-serif;
  font-size: 15px; font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--title);
}

/* Header right */
.header-right { display: flex; align-items: center; gap: 10px; }

.header-pill {
  background: var(--accent);
  color: #fff;
  border-radius: 20px;
  padding: 6px 28px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500;
  white-space: nowrap;
  text-decoration: none;
  display: inline-flex; align-items: center;
  transition: background .15s;
}
.header-pill:hover { background: var(--accent-dk); }

.header-icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  color: var(--text-muted);
  transition: background .15s, color .15s;
}
.header-icon-btn:hover { background: var(--surface); color: var(--text); }

.header-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
  transition: background .15s;
  flex-shrink: 0;
}
.header-avatar:hover { background: var(--accent-dk); }

/* ── Page layout ──────────────────────────────────────────────────────── */
.page { min-height: 100vh; }
.page-body {
  max-width: 1280px; width: 100%;
  margin: 0 auto; padding: 48px 28px 80px; flex: 1;
}
.page-body-narrow {
  max-width: 680px; width: 100%;
  margin: 0 auto; padding: 48px 28px 80px;
}

/* ── Overlay / modal ──────────────────────────────────────────────────── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 20px;
  animation: overlay-in .15s ease;
}
@keyframes overlay-in { from { opacity: 0 } to { opacity: 1 } }

.modal {
  background: var(--bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%; max-width: 500px;
  max-height: 90vh; overflow-y: auto;
  animation: modal-in .18s ease;
}
@keyframes modal-in { from { transform: translateY(14px); opacity: 0 } to { transform: none; opacity: 1 } }

.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 26px 0;
  position: sticky; top: 0;
  background: var(--bg);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  z-index: 1;
}
.modal-title { font-family: 'Poppins', sans-serif; font-size: 17px; font-weight: 600; color: var(--title); }
.modal-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--surface); color: var(--text-muted);
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.modal-close:hover { background: var(--border); color: var(--text); }
.modal-body { padding: 20px 26px 26px; }

/* ── Form fields ──────────────────────────────────────────────────────── */
.field { margin-bottom: 16px; }
.field label {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase;
  letter-spacing: .06em; margin-bottom: 7px;
}
.field input, .field select, .field textarea {
  width: 100%; padding: 11px 16px;
  border: 1px solid var(--border); border-radius: 12px;
  background: var(--surface); color: var(--text); font-size: 14px;
  transition: border-color .15s, box-shadow .15s;
}
.field textarea { resize: vertical; min-height: 76px; line-height: 1.55; }
.field input:focus, .field select:focus, .field textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(138,122,94,.1);
}
.field-hint { font-size: 11px; font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-light); }

/* ── Buttons ──────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: var(--radius-pill);
  font-size: 14px; font-weight: 500;
  transition: background .15s, opacity .15s;
  white-space: nowrap;
}
.btn:disabled { opacity: .5; cursor: default; }

.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-dk); }

.btn-ghost {
  background: transparent; border: 1px solid var(--border); color: var(--text-muted);
}
.btn-ghost:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }

.btn-danger-solid { background: var(--danger); color: #fff; }
.btn-danger-solid:hover:not(:disabled) { opacity: .88; }

.btn-sm { padding: 7px 16px; font-size: 13px; }

/* ── Errors ───────────────────────────────────────────────────────────── */
.error-msg {
  font-size: 13px; color: var(--danger);
  background: var(--danger-bg); border: 1px solid var(--danger-bd);
  border-radius: 10px; padding: 9px 14px; margin-bottom: 14px;
}
.error-page {
  text-align: center; padding: 60px 24px; color: var(--text-muted); font-size: 14px;
}

/* ── Privacy badge (pill, for grid cards and detail header) ───────────── */
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500; padding: 4px 11px; border-radius: 20px;
}
.badge-public      { color: var(--accent);   background: rgba(138,122,94,0.1); }
.badge-private     { color: var(--text-muted); background: rgba(0,0,0,0.06); }
.badge-connections { color: #4a6fa5;          background: rgba(74,111,165,0.1); }

/* ── Tag chip ─────────────────────────────────────────────────────────── */
.tag {
  display: inline-block; font-size: 11px; font-weight: 500;
  color: var(--accent-dk); background: rgba(138,122,94,0.1);
  border-radius: 20px; padding: 2px 10px;
}

/* ── Spinner ──────────────────────────────────────────────────────────── */
.spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .65s linear infinite;
}
.spinner-muted { border-color: rgba(138,122,94,.2); border-top-color: var(--accent); }
.spinner-page {
  width: 28px; height: 28px;
  border: 2.5px solid var(--border); border-top-color: var(--accent);
  border-radius: 50%; animation: spin .7s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* ── State views ──────────────────────────────────────────────────────── */
.state-loading, .state-empty {
  text-align: center; padding: 80px 0;
  color: var(--text-muted); font-size: 14px;
}
.state-empty-icon { font-size: 40px; margin-bottom: 12px; }

/* ── Scrollbar ────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-dk); border-radius: 99px; }
</style>
