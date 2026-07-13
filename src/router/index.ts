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
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/modules/dashboard/DashboardView.vue'),
        },
        {
          path: 'modelos',
          name: 'templates-gallery',
          component: () => import('@/modules/templates/TemplatesGalleryView.vue'),
        },
        {
          path: 'tributes/new',
          name: 'tribute-new',
          component: () => import('@/modules/tribute-wizard/NewTributeView.vue'),
        },
        {
          path: 'tributes/:id/edit',
          name: 'tribute-edit',
          component: () => import('@/modules/tribute-wizard/TributeWizardView.vue'),
        },
        {
          path: 'tributes/:id',
          name: 'tribute-detail',
          component: () => import('@/modules/dashboard/TributeDetailView.vue'),
        },
        {
          path: 'albums',
          name: 'albums-dashboard',
          component: () => import('@/modules/album/AlbumsDashboardView.vue'),
        },
        {
          path: 'albums/new',
          name: 'album-new',
          component: () => import('@/modules/album/NewAlbumView.vue'),
        },
        {
          path: 'albums/:id/edit',
          name: 'album-edit',
          component: () => import('@/modules/album/AlbumEditorView.vue'),
        },
        {
          path: 'albums/:id',
          name: 'album-detail',
          component: () => import('@/modules/album/AlbumDetailView.vue'),
        },
      ],
    },
    {
      path: '/a/:slug',
      name: 'public-album',
      component: () => import('@/modules/album/PublicAlbumRenderer.vue'),
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
