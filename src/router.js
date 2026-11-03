import { createRouter, createWebHistory } from 'vue-router'
import { store } from './store.js'

const routes = [
  { path: '/login',    component: () => import('./views/AuthView.vue') },
  { path: '/',         component: () => import('./views/DashboardView.vue'),        meta: { requiresAuth: true } },
  { path: '/c/:id',    component: () => import('./views/CollectionDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/settings', component: () => import('./views/SettingsView.vue'),         meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !store.isLoggedIn) return '/login'
  if (to.path === '/login' && store.isLoggedIn)  return '/'
})

export default router
