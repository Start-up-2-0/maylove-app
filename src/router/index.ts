import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/modules/auth/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/modules/auth/VerifyEmailView.vue'),
      meta: { guest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/modules/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/tributes/new',
      name: 'tribute-new',
      component: () => import('@/modules/tribute-wizard/NewTributeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/tributes/:id/edit',
      name: 'tribute-edit',
      component: () => import('@/modules/tribute-wizard/TributeWizardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/tributes/:id',
      name: 'tribute-detail',
      component: () => import('@/modules/dashboard/TributeDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/h/:slug',
      name: 'public-tribute',
      component: () => import('@/modules/public-tribute/PublicTributeRenderer.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) {
    await auth.bootstrap()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
