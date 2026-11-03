<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <svg width="28" height="28" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 1.5C5.36 1.5 1.5 5.36 1.5 10S5.36 18.5 10 18.5 18.5 14.64 18.5 10C18.5 7.62 17.55 5.47 16 3.92" stroke="#8A7A5E" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M10 4.5C7.01 4.5 4.5 7.01 4.5 10S7.01 15.5 10 15.5" stroke="#8A7A5E" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M10 7.5C8.62 7.5 7.5 8.62 7.5 10S8.62 12.5 10 12.5C11.38 12.5 12.5 11.38 12.5 10" stroke="#8A7A5E" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <span class="auth-wordmark">SPHIR</span>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab" :class="{ active: mode === 'signin' }" @click="switchMode('signin')">Sign In</button>
        <button class="auth-tab" :class="{ active: mode === 'signup' }" @click="switchMode('signup')">Sign Up</button>
      </div>

      <!-- Sign In -->
      <form v-if="mode === 'signin'" @submit.prevent="doSignIn" class="auth-form">
        <div class="auth-field">
          <input v-model="siEmail" type="email" placeholder="Email address" autocomplete="email" autofocus required />
        </div>
        <div class="auth-field">
          <input v-model="siPassword" type="password" placeholder="Password" autocomplete="current-password" required />
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>
        <button type="submit" class="btn-auth-submit" :disabled="loading">
          <span v-if="loading" class="spinner spinner-dark"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Sign Up -->
      <form v-else @submit.prevent="doSignUp" class="auth-form">
        <div class="auth-field">
          <input v-model="suEmail" type="email" placeholder="Email address" autocomplete="email" required />
        </div>
        <div class="auth-field">
          <input v-model="suPassword" type="password" placeholder="Password (min 6 chars)" required />
        </div>
        <div class="auth-field">
          <input v-model="suConfirm" type="password" placeholder="Confirm password" required />
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>
        <button type="submit" class="btn-auth-submit" :disabled="loading">
          <span v-if="loading" class="spinner spinner-dark"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Guest link -->
      <div class="guest-row">
        <button class="guest-link" :disabled="loadingGuest" @click="doGuest">
          <span v-if="loadingGuest" class="spinner spinner-muted" style="width:12px;height:12px"></span>
          <span v-else>Continue as Guest</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn, signUp, guestLogin } from '../api.js'
import { store } from '../store.js'

const router = useRouter()

const mode        = ref('signin')
const error       = ref('')
const loading     = ref(false)
const loadingGuest = ref(false)

const siEmail    = ref('')
const siPassword = ref('')
const suEmail    = ref('')
const suPassword = ref('')
const suConfirm  = ref('')

function switchMode(m) { mode.value = m; error.value = '' }

async function doSignIn() {
  error.value = ''; loading.value = true
  try {
    const data = await signIn(siEmail.value.trim(), siPassword.value)
    store.login(data)
    router.push('/')
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

async function doSignUp() {
  if (suPassword.value !== suConfirm.value) { error.value = 'Passwords do not match.'; return }
  if (suPassword.value.length < 6) { error.value = 'Password must be at least 6 characters.'; return }
  error.value = ''; loading.value = true
  try {
    await signUp(suEmail.value.trim(), suPassword.value)
    const data = await signIn(suEmail.value.trim(), suPassword.value)
    store.login(data)
    router.push('/')
  } catch (e) { error.value = e.message } finally { loading.value = false }
}

async function doGuest() {
  loadingGuest.value = true; error.value = ''
  try {
    await guestLogin().catch(() => {})
    store.loginGuest()
    router.push('/')
  } finally { loadingGuest.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: var(--bg);
}

.auth-card {
  width: 100%; max-width: 400px;
  background: #FFFFFF;
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
  padding: 36px 32px 28px;
}

/* Logo */
.auth-logo {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 36px;
}
.auth-wordmark {
  font-family: 'Poppins', sans-serif;
  font-size: 20px; font-weight: 700;
  letter-spacing: 2px; color: var(--title);
}

/* Tabs */
.auth-tabs {
  display: flex;
  border-bottom: 1.5px solid var(--border);
  margin-bottom: 28px;
}
.auth-tab {
  flex: 1; padding: 10px 8px;
  font-size: 14px; font-weight: 500;
  color: var(--text-muted);
  background: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1.5px;
  transition: color .15s, border-color .15s;
}
.auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
.auth-tab:not(.active):hover { color: var(--text); }

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }

.auth-field input {
  width: 100%;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 13px 22px;
  font-size: 14px; color: var(--text);
  transition: border-color .15s, box-shadow .15s;
}
.auth-field input::placeholder { color: var(--text-light); }
.auth-field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(138,122,94,.1);
}

.btn-auth-submit {
  width: 100%;
  background: var(--accent); color: #fff;
  border-radius: var(--radius-pill);
  padding: 13px 24px;
  font-size: 15px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 4px;
  transition: background .15s, opacity .15s;
}
.btn-auth-submit:hover:not(:disabled) { background: var(--accent-dk); }
.btn-auth-submit:disabled { opacity: .55; cursor: default; }

/* Spinner on dark button */
.spinner-dark {
  border-color: rgba(255,255,255,.3);
  border-top-color: #fff;
}

/* Guest */
.guest-row { text-align: center; }
.guest-link {
  font-size: 13px; font-weight: 500;
  color: var(--accent);
  background: none;
  display: inline-flex; align-items: center; gap: 6px;
  transition: color .15s;
}
.guest-link:hover:not(:disabled) { color: var(--accent-dk); text-decoration: underline; }
.guest-link:disabled { opacity: .6; cursor: default; }
</style>
