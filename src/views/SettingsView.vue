<template>
  <div class="page-body-narrow">
    <div class="breadcrumb">
      <router-link to="/">← Sphirs</router-link>
    </div>

    <h1 class="settings-title">Settings</h1>

    <!-- Profile -->
    <section class="settings-card">
      <div class="section-label">Account</div>
      <div class="profile-row">
        <div class="avatar">{{ avatarLetter }}</div>
        <div class="profile-info">
          <div class="profile-name">{{ store.displayName }}</div>
          <div class="profile-uid">{{ store.uid }}</div>
          <span v-if="store.isGuest" class="guest-chip">Guest Mode</span>
        </div>
      </div>
      <div v-if="!store.isGuest && (store.firstName || store.lastName)" class="info-row">
        <span class="info-label">Name</span>
        <span class="info-value">{{ [store.firstName, store.lastName].filter(Boolean).join(' ') }}</span>
      </div>
      <div v-if="store.isGuest" class="guest-notice">
        <p>You're browsing as a guest. Sign in to sync your Sphirs across devices.</p>
        <router-link to="/login" class="btn btn-primary btn-sm" style="margin-top:12px;display:inline-flex">
          Sign In
        </router-link>
      </div>
    </section>

    <!-- Session -->
    <section class="settings-card">
      <div class="section-label">Session</div>
      <div v-if="signOutError" class="error-msg">{{ signOutError }}</div>
      <button class="btn-pill-lg sign-out-btn" :disabled="signingOut" @click="doSignOut">
        <span v-if="signingOut" class="spinner spinner-dark"></span>
        <span v-else>Sign Out</span>
      </button>
      <p class="sign-out-note">Clears your session and returns you to the login screen.</p>
    </section>

    <!-- App info -->
    <section class="settings-card app-info-row">
      <span class="app-name">SPHIR</span>
      <span class="app-version">Web v0.1.0</span>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from '../api.js'
import { store } from '../store.js'

const router       = useRouter()
const signingOut   = ref(false)
const signOutError = ref('')

const avatarLetter = computed(() => (store.displayName || 'U').charAt(0).toUpperCase())

async function doSignOut() {
  signingOut.value = true; signOutError.value = ''
  try {
    if (!store.isGuest) await signOut().catch(() => {})
  } finally {
    store.logout()
    router.push('/login')
    signingOut.value = false
  }
}
</script>

<style scoped>
.breadcrumb { margin-bottom: 28px; }
.breadcrumb a { font-size: 14px; font-weight: 500; color: var(--accent); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }

.settings-title {
  font-family: 'Poppins', sans-serif;
  font-size: 30px; font-weight: 700; color: var(--title);
  margin-bottom: 28px;
}

.settings-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  margin-bottom: 16px;
}

.section-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--text-muted); margin-bottom: 18px;
}

.profile-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.profile-name { font-size: 16px; font-weight: 600; color: var(--title); margin-bottom: 3px; }
.profile-uid  { font-size: 12px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.guest-chip {
  display: inline-block; margin-top: 6px;
  font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
  background: rgba(138,122,94,0.1); color: var(--accent);
}

.info-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); }
.info-value { color: var(--text); text-align: right; }

.guest-notice p { font-size: 13px; color: var(--text-muted); line-height: 1.55; }

.btn-pill-lg {
  background: var(--accent); color: #fff;
  border-radius: 20px; padding: 10px 28px;
  font-size: 14px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background .15s, opacity .15s;
}
.btn-pill-lg:hover:not(:disabled) { background: var(--accent-dk); }
.btn-pill-lg:disabled { opacity: .5; cursor: default; }

.sign-out-btn { background: var(--danger); }
.sign-out-btn:hover:not(:disabled) { background: #9b2222; }

.spinner-dark { border-color: rgba(255,255,255,.3); border-top-color: #fff; }

.sign-out-note { font-size: 12px; color: var(--text-light); margin-top: 10px; }

.app-info-row { display: flex; justify-content: space-between; align-items: center; }
.app-name {
  font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700;
  letter-spacing: 1.5px; color: var(--text-muted);
}
.app-version { font-size: 11px; color: var(--text-light); }
</style>
