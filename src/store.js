import { reactive } from 'vue'

const LS = {
  get: (k) => localStorage.getItem(k),
  set: (k, v) => localStorage.setItem(k, v),
  del: (k) => localStorage.removeItem(k)
}

export const store = reactive({
  token:     LS.get('sphir_token')  || null,
  uid:       LS.get('sphir_uid')    || null,
  client:    LS.get('sphir_client') || null,
  firstName: LS.get('sphir_first')  || null,
  lastName:  LS.get('sphir_last')   || null,
  isGuest:   LS.get('sphir_guest')  === '1',

  // Trigger card creation from global header
  pendingCreateCard: false,

  get isLoggedIn() { return !!this.token },

  get displayName() {
    if (this.isGuest) return 'Guest'
    const full = [this.firstName, this.lastName].filter(Boolean).join(' ')
    return full || this.uid?.split('@')[0] || 'User'
  },

  login(data) {
    this.token     = data.token     || data.access_token || ''
    this.uid       = data.uid       || ''
    this.client    = data.client    || ''
    this.firstName = data.first_name || data.firstName || ''
    this.lastName  = data.last_name  || data.lastName  || ''
    this.isGuest   = false
    LS.set('sphir_token',  this.token)
    LS.set('sphir_uid',    this.uid)
    LS.set('sphir_client', this.client)
    LS.set('sphir_first',  this.firstName)
    LS.set('sphir_last',   this.lastName)
    LS.del('sphir_guest')
  },

  loginGuest() {
    this.token     = 'guest_session'
    this.uid       = 'guest'
    this.client    = ''
    this.firstName = 'Guest'
    this.lastName  = ''
    this.isGuest   = true
    LS.set('sphir_token', 'guest_session')
    LS.set('sphir_uid',   'guest')
    LS.set('sphir_guest', '1')
  },

  logout() {
    this.token     = null
    this.uid       = null
    this.client    = null
    this.firstName = null
    this.lastName  = null
    this.isGuest   = false
    this.pendingCreateCard = false
    ;['sphir_token','sphir_uid','sphir_client','sphir_first','sphir_last','sphir_guest']
      .forEach(k => LS.del(k))
  }
})
