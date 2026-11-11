<template>
  <div class="app-root" :class="{ 'has-header': store.isLoggedIn }">
    <Toast />
    <!-- Fixed global header -->
    <header v-if="store.isLoggedIn" class="site-header">
      <router-link to="/" class="logo" aria-label="Sphir home">
        <img src="/assets/sphir-logo.svg" alt="Sphir" width="110" height="25" />
      </router-link>

      <!-- Desktop navigation -->
      <nav class="header-right">
        <router-link to="/" class="header-search">Search</router-link>
        <div class="header-actions">
          <button class="header-card-btn" @click="handleCreateCard">+ Card</button>
          <button class="header-icon-btn" title="Notifications" aria-label="Notifications">
            <img src="/assets/notification.png" alt="" width="25" height="25" />
          </button>
          <button class="header-icon-btn" title="Connections" aria-label="Connections">
            <img src="/assets/connections.png" alt="" width="25" height="25" />
          </button>
          <router-link to="/settings" class="header-avatar" :title="store.displayName" aria-label="Account">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="20" fill="#B8B8B8"/>
              <circle cx="20" cy="15.5" r="6.5" fill="#6E6E6E"/>
              <path d="M7 34c2.5-6 7.4-9 13-9s10.5 3 13 9a19.9 19.9 0 0 1-26 0z" fill="#6E6E6E"/>
            </svg>
          </router-link>
        </div>
      </nav>

      <!-- Mobile menu toggle -->
      <button class="header-burger" aria-label="Open menu" @click="menuOpen = true">
        <span></span><span></span><span></span>
      </button>
    </header>

    <!-- Mobile side menu -->
    <div v-if="store.isLoggedIn && menuOpen" class="side-menu-overlay" @click="menuOpen = false">
      <aside class="side-menu" @click.stop>
        <div class="side-menu-user">
          <div class="side-menu-name">{{ store.displayName }}</div>
          <div class="side-menu-email">{{ store.uid }}</div>
        </div>
        <router-link to="/" class="side-menu-search" @click="menuOpen = false">Search</router-link>
        <div class="side-menu-row">
          <button class="side-menu-card" @click="menuOpen = false; handleCreateCard()">+ Card</button>
          <img src="/assets/connections.png" alt="Connections" width="25" height="25" />
        </div>
        <button class="side-menu-item" @click="menuOpen = false">
          <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          My Archive
        </button>
        <router-link to="/settings" class="side-menu-item" @click="menuOpen = false">
          <svg viewBox="0 0 24 24"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.2"/><circle cx="15" cy="16" r="2.2"/></svg>
          Account Settings
        </router-link>
        <button class="side-menu-item" @click="menuOpen = false">
          <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M10 9a2 2 0 1 1 2.5 1.9c-.4.2-.5.5-.5.9"/><circle cx="12" cy="13.6" r=".4"/></svg>
          Help &amp; User Information
        </button>
        <button class="side-menu-item" @click="menuOpen = false">
          <svg viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21"/><path d="M6 9h12M8 21h8"/><circle cx="12" cy="9" r="1"/></svg>
          Legal
        </button>
        <div class="side-menu-logout-wrap">
          <button class="side-menu-logout" @click="handleLogout">Log Out</button>
        </div>
      </aside>
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Toast from './components/Toast.vue'
import { useRouter, useRoute } from 'vue-router'
import { signOut } from './api.js'
import { store } from './store.js'

const router = useRouter()
const route  = useRoute()

const menuOpen = ref(false)

function handleCreateCard() {
  store.pendingCreateCard = true
  if (route.path !== '/') router.push('/')
}

async function handleLogout() {
  menuOpen.value = false
  try {
    if (!store.isGuest) await signOut().catch(() => {})
  } finally {
    store.logout()
    router.push('/login')
  }
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
  -webkit-tap-highlight-color: transparent;
}
h1, h2, h3, .display { font-family: 'Poppins', sans-serif; }
a { color: inherit; text-decoration: none; }
/* User-written text: a long unbroken word must wrap, never widen the page on phones. */
.col-title, .sphir-desc, .biz-title, .biz-desc, .uncat-title, .uncat-desc,
.detail-title, .detail-desc { overflow-wrap: anywhere; }
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
  border-bottom: 1px solid #E6E7E8;
  padding-left: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

/* Logo */
.logo { display: flex; align-items: center; }
.logo img { display: block; }

/* Header right (desktop) */
.header-right {
  width: 786px; max-width: calc(100% - 170px);
  height: 50px; padding-right: 40px;
  display: flex; align-items: center; justify-content: space-between;
}
.header-search {
  padding: 0 12px; height: 40px;
  display: inline-flex; align-items: center;
  font-size: 15px; color: #000;
}
.header-actions { display: flex; align-items: center; gap: 40px; }

.header-card-btn {
  width: 127px; height: 40px; margin-right: 10px;
  background: var(--accent); color: #fff;
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px; font-weight: 700;
  transition: background .15s;
}
.header-card-btn:hover { background: var(--accent-dk); }

.header-icon-btn {
  width: 25px; height: 25px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  transition: opacity .15s;
}
.header-icon-btn:hover { opacity: .7; }
.header-icon-btn img { display: block; }

.header-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid #E6E7E8;
  overflow: hidden;
  flex-shrink: 0;
}
.header-avatar svg { display: block; width: 100%; height: 100%; }

/* Mobile menu toggle */
.header-burger {
  display: none;
  width: 60px; height: 60px;
  background: transparent;
  flex-direction: column; align-items: center; justify-content: center; gap: 5px;
}
.header-burger span { display: block; width: 24px; height: 2px; background: #000; border-radius: 1px; }

@media (max-width: 900px) {
  .header-right { display: none; }
  .header-burger { display: flex; }
}

/* Mobile side menu */
.side-menu-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 300;
  animation: overlay-in .15s ease;
}
.side-menu {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: 300px; max-width: 80vw;
  background: #fff;
  display: flex; flex-direction: column;
  overflow-y: auto;
}
.side-menu-user { padding: 26px 20px 12px; }
.side-menu-name { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: #000; }
.side-menu-email {
  font-size: 13px; color: #000;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.side-menu-search {
  display: block; text-align: center;
  padding: 12px 0 18px; border-bottom: 1px solid #E6E7E8;
  font-size: 15px; font-weight: 600; color: var(--accent);
}
.side-menu-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-bottom: 1px solid #E6E7E8;
}
.side-menu-card {
  background: var(--accent); color: #fff;
  border-radius: 20px; padding: 10px 10px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 700;
}
.side-menu-item {
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 18px 20px;
  background: transparent; text-align: left;
  border-bottom: 1px solid #E6E7E8;
  font-size: 20px; color: #333;
}
.side-menu-item svg {
  width: 20px; height: 20px; flex-shrink: 0;
  fill: none; stroke: var(--accent); stroke-width: 1.5;
  stroke-linecap: round; stroke-linejoin: round;
}
.side-menu-logout-wrap { padding: 14px 20px; border-bottom: 1px solid #E6E7E8; }
.side-menu-logout {
  width: 100%; height: 32px;
  border: 1px solid var(--accent); border-radius: 20px;
  background: #fff;
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700;
  color: var(--accent-dk);
}

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
