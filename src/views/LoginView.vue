<template>
  <div class="page">
    <div class="card">
      <div class="login-header-row">
        <div class="logo">S</div>
        <div class="lang-switch" role="group" :aria-label="t('lang.selector')">
          <button
            type="button"
            class="lang-btn"
            :class="{ active: locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="setLocale('en')"
          >{{ t('lang.en') }}</button>
          <span class="lang-divider">/</span>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: locale === 'es' }"
            :aria-pressed="locale === 'es'"
            @click="setLocale('es')"
          >{{ t('lang.es') }}</button>
        </div>
      </div>
      <h1>{{ mode === 'login' ? t('login.welcomeBack') : t('login.createAccount') }}</h1>
      <p class="subtitle">{{ mode === 'login' ? t('login.signInSubtitle') : t('login.signUpSubtitle') }}</p>

      <div v-if="sessionExpired && mode === 'login'" class="notice">
        {{ t('login.sessionExpired') }}
      </div>

      <form @submit.prevent="submit">
        <!-- Sign-up only fields -->
        <template v-if="mode === 'signup'">
          <div class="field-row">
            <div class="field">
              <label for="firstName">{{ t('login.firstNameLabel') }}</label>
              <input id="firstName" v-model="firstName" type="text" :placeholder="t('login.firstNamePlaceholder')" autocomplete="given-name" />
              <span v-if="fe.firstName" class="field-error">{{ fe.firstName }}</span>
            </div>
            <div class="field">
              <label for="lastName">{{ t('login.lastNameLabel') }}</label>
              <input id="lastName" v-model="lastName" type="text" :placeholder="t('login.lastNamePlaceholder')" autocomplete="family-name" />
              <span v-if="fe.lastName" class="field-error">{{ fe.lastName }}</span>
            </div>
          </div>
        </template>

        <div class="field">
          <label for="email">{{ t('login.emailLabel') }}</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com"
            autocomplete="email" />
          <span v-if="fe.email" class="field-error">{{ fe.email }}</span>
        </div>

        <div class="field">
          <label for="password">{{ t('login.passwordLabel') }}</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" />
          <span v-if="fe.password" class="field-error">{{ fe.password }}</span>
        </div>

        <div v-if="mode === 'signup'" class="field">
          <label for="confirm">{{ t('login.confirmPasswordLabel') }}</label>
          <input id="confirm" v-model="confirm" type="password" placeholder="••••••••"
            autocomplete="new-password" />
          <span v-if="fe.confirm" class="field-error">{{ fe.confirm }}</span>
        </div>

        <div v-if="formError" class="error">{{ formError }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ mode === 'login' ? t('auth.signInBtn') : t('auth.signUpBtn') }}</span>
        </button>
      </form>

      <div class="toggle-row">
        <template v-if="mode === 'login'">
          {{ t('login.noAccount') }}
          <button class="toggle-btn" @click="switchMode('signup')">{{ t('login.signUpLink') }}</button>
        </template>
        <template v-else>
          {{ t('login.hasAccount') }}
          <button class="toggle-btn" @click="switchMode('login')">{{ t('login.signInLink') }}</button>
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
import { t, locale, setLocale } from '../i18n.js'

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
  if (!firstName.value.trim()) { fe.firstName = t('common.required'); valid = false }
  if (!lastName.value.trim())  { fe.lastName  = t('common.required'); valid = false }
  if (!email.value.trim())     { fe.email     = t('common.required'); valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { fe.email = t('login.validEmailRequired'); valid = false }
  if (!password.value)         { fe.password  = t('common.required'); valid = false }
  else if (password.value.length < 6) { fe.password = t('login.passwordMin'); valid = false }
  if (!confirm.value)          { fe.confirm   = t('common.required'); valid = false }
  else if (confirm.value !== password.value) { fe.confirm = t('login.passwordsMismatch'); valid = false }
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
    formError.value = e.message || (mode.value === 'login' ? t('login.signInFailed') : t('login.createAccountFailed'))
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

.login-header-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}

.logo {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--taupe, #8A7A5E); color: #fff;
  font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
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
