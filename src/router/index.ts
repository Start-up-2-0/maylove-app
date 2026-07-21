import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { forceTheme, initTheme } from '@/composables/useTheme'

const PUBLIC_EXPERIENCE_ROUTES = new Set(['public-album', 'public-tribute', 'public-map', 'public-bouquet'])

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
          path: 'romances/new',
          name: 'romance-new',
          component: () => import('@/modules/romance-wizard/NewRomanceView.vue'),
        },
        {
          path: 'romances/create',
          redirect: { name: 'romance-new' },
        },
        {
          path: 'romances/:id/edit',
          name: 'romance-edit',
          component: () => import('@/modules/romance-wizard/RomanceWizardView.vue'),
        },
        {
          path: 'romances/:id',
          name: 'romance-detail',
          component: () => import('@/modules/dashboard/TributeDetailView.vue'),
        },
        {
          path: 'tributes/new',
          redirect: { name: 'romance-new' },
        },
        {
          path: 'tributes/:id/edit',
          redirect: (to) => ({
            name: 'romance-edit',
            params: { id: to.params.id },
            query: to.query,
          }),
        },
        {
          path: 'tributes/:id',
          redirect: (to) => ({
            name: 'romance-detail',
            params: { id: to.params.id },
            query: to.query,
          }),
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
        {
          path: 'maps',
          name: 'maps-dashboard',
          component: () => import('@/modules/map/MapsDashboardView.vue'),
        },
        {
          path: 'maps/new',
          name: 'map-new',
          component: () => import('@/modules/map/NewMapView.vue'),
        },
        {
          path: 'maps/:id/edit',
          name: 'map-edit',
          component: () => import('@/modules/map/MapEditorView.vue'),
        },
        {
          path: 'bouquets',
          name: 'bouquets-dashboard',
          component: () => import('@/modules/bouquet/BouquetsDashboardView.vue'),
        },
        {
          path: 'bouquets/new',
          name: 'bouquet-new',
          component: () => import('@/modules/bouquet/NewBouquetView.vue'),
        },
        {
          path: 'bouquets/:id/edit',
          name: 'bouquet-edit',
          component: () => import('@/modules/bouquet/BouquetEditorView.vue'),
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
    {
      path: '/map/:slug',
      name: 'public-map',
      component: () => import('@/modules/map/PublicMapRenderer.vue'),
    },
    {
      path: '/bouquet/:slug',
      name: 'public-bouquet',
      component: () => import('@/modules/bouquet/PublicBouquetRenderer.vue'),
    },
  ],
})

router.beforeEach(async (to, from) => {
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

  const enteringPublic = typeof to.name === 'string' && PUBLIC_EXPERIENCE_ROUTES.has(to.name)
  const leavingPublic = typeof from.name === 'string' && PUBLIC_EXPERIENCE_ROUTES.has(from.name)

  if (enteringPublic) {
    forceTheme('light')
  } else if (leavingPublic) {
    initTheme()
  }

  return true
})

export default router
