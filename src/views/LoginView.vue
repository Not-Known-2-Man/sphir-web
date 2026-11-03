<template>
  <div class="page">
    <div class="card">
      <div class="logo">S</div>
      <h1>{{ mode === 'login' ? 'Welcome back' : 'Create account' }}</h1>
      <p class="subtitle">{{ mode === 'login' ? 'Sign in to your Sphir account' : 'Get started for free' }}</p>

      <div v-if="sessionExpired && mode === 'login'" class="notice">
        Session expired — please sign in again.
      </div>

      <form @submit.prevent="submit">
        <!-- Sign-up only fields -->
        <template v-if="mode === 'signup'">
          <div class="field-row">
            <div class="field">
              <label for="firstName">First name</label>
              <input id="firstName" v-model="firstName" type="text" placeholder="Jane" autocomplete="given-name" />
              <span v-if="fe.firstName" class="field-error">{{ fe.firstName }}</span>
            </div>
            <div class="field">
              <label for="lastName">Last name</label>
              <input id="lastName" v-model="lastName" type="text" placeholder="Doe" autocomplete="family-name" />
              <span v-if="fe.lastName" class="field-error">{{ fe.lastName }}</span>
            </div>
          </div>
        </template>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com"
            autocomplete="email" />
          <span v-if="fe.email" class="field-error">{{ fe.email }}</span>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" />
          <span v-if="fe.password" class="field-error">{{ fe.password }}</span>
        </div>

        <div v-if="mode === 'signup'" class="field">
          <label for="confirm">Confirm password</label>
          <input id="confirm" v-model="confirm" type="password" placeholder="••••••••"
            autocomplete="new-password" />
          <span v-if="fe.confirm" class="field-error">{{ fe.confirm }}</span>
        </div>

        <div v-if="formError" class="error">{{ formError }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ mode === 'login' ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>

      <div class="toggle-row">
        <template v-if="mode === 'login'">
          Don't have an account?
          <button class="toggle-btn" @click="switchMode('signup')">Sign up</button>
        </template>
        <template v-else>
          Already have an account?
          <button class="toggle-btn" @click="switchMode('login')">Sign in</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signIn, signUp } from '../api.js'
import { store } from '../store.js'

const router = useRouter()
const route  = useRoute()

const mode    = ref('login')
const email   = ref('')
const password = ref('')
const confirm  = ref('')
const firstName = ref('')
const lastName  = ref('')
const loading   = ref(false)
const formError = ref('')
const fe        = reactive({ firstName: '', lastName: '', email: '', password: '', confirm: '' })

const sessionExpired = ref(route.query.reason === 'session_expired')

function switchMode(m) {
  mode.value = m
  formError.value = ''
  Object.keys(fe).forEach(k => fe[k] = '')
}

function validateSignUp() {
  let valid = true
  Object.keys(fe).forEach(k => fe[k] = '')
  if (!firstName.value.trim()) { fe.firstName = 'Required'; valid = false }
  if (!lastName.value.trim())  { fe.lastName  = 'Required'; valid = false }
  if (!email.value.trim())     { fe.email     = 'Required'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { fe.email = 'Enter a valid email'; valid = false }
  if (!password.value)         { fe.password  = 'Required'; valid = false }
  else if (password.value.length < 6) { fe.password = 'At least 6 characters'; valid = false }
  if (!confirm.value)          { fe.confirm   = 'Required'; valid = false }
  else if (confirm.value !== password.value) { fe.confirm = 'Passwords do not match'; valid = false }
  return valid
}

async function submit() {
  formError.value = ''
  loading.value = true

  try {
    if (mode.value === 'login') {
      const data = await signIn(email.value, password.value)
      store.login(data)
      router.push('/')
    } else {
      if (!validateSignUp()) { loading.value = false; return }
      await signUp(email.value, password.value, firstName.value.trim(), lastName.value.trim())
      // Auto sign-in after account creation
      const data = await signIn(email.value, password.value)
      store.login(data)
      router.push('/')
    }
  } catch (e) {
    formError.value = e.message || (mode.value === 'login' ? 'Sign in failed. Check your credentials.' : 'Could not create account.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; padding: 24px;
}

.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow);
  padding: 40px 36px; width: 100%; max-width: 420px;
}

.logo {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--taupe, #8A7A5E); color: #fff;
  font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}

h1 { font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.field { margin-bottom: 14px; }
label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--text-muted); margin-bottom: 6px;
}
input {
  width: 100%; padding: 11px 14px;
  border: 1px solid var(--border); border-radius: 10px;
  background: var(--bg); color: var(--text); font-size: 15px;
  transition: border-color 0.15s;
}
input:focus { border-color: #8A7A5E; outline: none; }

.field-error {
  display: block; font-size: 12px; color: var(--danger, #C0392B);
  margin-top: 4px;
}

.notice {
  font-size: 13px; color: #8a6a1c; background: #fdf8ec;
  border: 1px solid #f0d890; border-radius: 8px;
  padding: 10px 12px; margin-bottom: 16px;
}
.error {
  font-size: 13px; color: var(--danger, #C0392B);
  background: #fdf0ef; border: 1px solid #f5c6c2;
  border-radius: 8px; padding: 10px 12px; margin-bottom: 16px;
}

.btn-primary {
  width: 100%; padding: 13px; border-radius: 12px;
  background: #8A7A5E; color: #fff;
  font-size: 15px; font-weight: 600;
  margin-top: 6px; transition: background 0.15s, opacity 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: #6F5E4E; }
.btn-primary:disabled { opacity: 0.55; cursor: default; }

.toggle-row {
  text-align: center; margin-top: 20px;
  font-size: 13px; color: var(--text-muted);
}
.toggle-btn {
  background: none; color: #8A7A5E; font-size: 13px;
  font-weight: 600; text-decoration: underline;
  margin-left: 4px; cursor: pointer;
  transition: color .15s;
}
.toggle-btn:hover { color: #6F5E4E; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
