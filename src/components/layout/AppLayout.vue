<template>
  <div class="app-shell">
    <!-- Overlay mobile -->
    <transition name="overlay">
      <div v-if="drawerOpen" class="app-overlay" @click="drawerOpen = false" />
    </transition>

    <aside class="sidebar" :class="{ 'sidebar--open': drawerOpen }">
      <div class="sidebar__brand">
        <Logo to="/dashboard" variant="light" size="md" @click="drawerOpen = false" />
        <button class="sidebar__close" aria-label="Fechar menu" @click="drawerOpen = false">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <nav class="sidebar__nav" aria-label="Navegação principal">
        <p class="sidebar__label">Geral</p>
        <RouterLink to="/dashboard" class="nav-item" active-class="" exact-active-class="nav-item--active">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 10.5 12 3l9 7.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5 9.5V20h14V9.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9.5 20v-6h5v6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Romances</span>
        </RouterLink>
        <RouterLink to="/dashboard/romances/new" class="nav-item" active-class="nav-item--active">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>Nova experiência</span>
        </RouterLink>

        <p class="sidebar__label sidebar__label--spaced">Álbuns</p>
        <RouterLink to="/dashboard/albums" class="nav-item" active-class="nav-item--active" @click="drawerOpen = false">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M4 9h16M9 4v16" stroke-linecap="round" />
          </svg>
          <span>Meus álbuns</span>
        </RouterLink>
        <RouterLink to="/dashboard/albums/new" class="nav-item" active-class="nav-item--active" @click="drawerOpen = false">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>Novo álbum</span>
        </RouterLink>

        <p class="sidebar__label sidebar__label--spaced">Mapas</p>
        <RouterLink to="/dashboard/maps" class="nav-item" active-class="nav-item--active" @click="drawerOpen = false">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 6.5 9 4l6 2.5 6-2.5v13L15 19l-6-2.5L3 19.5V6.5Z" stroke-linejoin="round" />
            <path d="M9 4v13.5M15 6.5V20" stroke-linecap="round" />
          </svg>
          <span>Meus mapas</span>
        </RouterLink>
        <RouterLink to="/dashboard/maps/new" class="nav-item" active-class="nav-item--active" @click="drawerOpen = false">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>Novo mapa</span>
        </RouterLink>

        <p class="sidebar__label sidebar__label--spaced">Recursos</p>
        <RouterLink to="/dashboard/modelos" class="nav-item" active-class="nav-item--active" @click="drawerOpen = false">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M3 9h18" stroke-linecap="round" />
          </svg>
          <span>Modelos</span>
        </RouterLink>
        <a class="nav-item nav-item--muted" href="#" @click.prevent>
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17h.01" stroke-linecap="round" />
          </svg>
          <span>Ajuda</span>
        </a>
      </nav>

      <button class="sidebar__theme" @click="toggle">
        <span class="sidebar__theme-icon" aria-hidden="true">
          <svg v-if="isDark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span>{{ isDark ? 'Tema claro' : 'Tema escuro' }}</span>
      </button>

      <div class="sidebar__footer">
        <div class="user-card">
          <span class="user-card__avatar">{{ initials }}</span>
          <span class="user-card__meta">
            <span class="user-card__name">{{ auth.user?.name || 'Você' }}</span>
            <span class="user-card__email">{{ auth.user?.email || '' }}</span>
          </span>
        </div>
        <button class="user-card__logout" title="Sair" @click="logout">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 16l-4-4 4-4M6 12h11" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </aside>

    <div class="app-main">
      <header class="app-topbar">
        <button class="app-topbar__menu" aria-label="Abrir menu" @click="drawerOpen = true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
          </svg>
        </button>
        <Logo to="/dashboard" variant="light" size="sm" class="brand--compact" />
        <button class="app-topbar__theme app-topbar__cta" :aria-label="isDark ? 'Tema claro' : 'Tema escuro'" @click="toggle">
          <svg v-if="isDark" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <RouterLink to="/dashboard/tributes/new" class="ml-btn ml-btn--primary ml-btn--sm">
          + Nova
        </RouterLink>
      </header>

      <main class="app-content">
        <RouterView v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import Logo from '@/components/brand/Logo.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { isDark, toggle } = useTheme()

const drawerOpen = ref(false)
const DESKTOP_BREAKPOINT = 1024

function closeDrawerIfDesktop() {
  if (window.innerWidth >= DESKTOP_BREAKPOINT) {
    drawerOpen.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  },
)

onMounted(() => {
  closeDrawerIfDesktop()
  window.addEventListener('resize', closeDrawerIfDesktop)
})

onUnmounted(() => {
  window.removeEventListener('resize', closeDrawerIfDesktop)
})

const initials = computed(() => {
  const name = auth.user?.name?.trim()
  if (!name) return 'Mv'
  const parts = name.split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
})

async function logout() {
  await auth.logout()
  await router.push('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

/* ---------- Sidebar ---------- */
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 268px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  padding: 22px 16px;
  color: var(--sidebar-text);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: 4px 0 24px -12px rgba(225, 29, 122, 0.08);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--sidebar-text);
  letter-spacing: -0.01em;
}
.brand__mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  color: #fff;
  background: var(--primary);
  box-shadow: var(--shadow-primary);
}
.brand__accent {
  color: var(--primary);
}

.sidebar__close {
  display: none;
  color: var(--sidebar-muted);
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 8px;
}
.sidebar__close:hover {
  color: var(--primary-strong);
  background: var(--sidebar-hover);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
}
.sidebar__label {
  margin: 6px 12px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sidebar-muted);
}
.sidebar__label--spaced {
  margin-top: 22px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--sidebar-muted);
  transition:
    background var(--dur) var(--ease),
    color var(--dur) var(--ease);
}
.nav-item__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.nav-item:hover {
  color: var(--primary-strong);
  background: var(--sidebar-hover);
}
.nav-item--active {
  color: var(--primary-strong);
  background: var(--sidebar-active);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 18%, var(--sidebar-border));
}
.nav-item--active .nav-item__icon {
  color: var(--primary);
}
.nav-item--muted {
  opacity: 0.85;
}

.sidebar__theme {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--sidebar-border);
  background: transparent;
  color: var(--sidebar-muted);
  font-size: 0.9rem;
  font-weight: 600;
  transition:
    background var(--dur) var(--ease),
    color var(--dur) var(--ease);
}
.sidebar__theme:hover {
  color: var(--primary-strong);
  background: var(--sidebar-hover);
}
.sidebar__theme-icon {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 10px;
  border-radius: var(--radius-md);
  background: #ffffff;
  border: 1px solid var(--sidebar-border);
}
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.user-card__avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 11px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #fff;
  background: var(--primary);
}
.user-card__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.user-card__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--sidebar-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-card__email {
  font-size: 0.75rem;
  color: var(--sidebar-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-card__logout {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--sidebar-muted);
  background: transparent;
  border: none;
  transition:
    background var(--dur) var(--ease),
    color var(--dur) var(--ease);
}
.user-card__logout:hover {
  color: var(--primary-strong);
  background: var(--primary-soft);
}

/* ---------- Main ---------- */
.app-main {
  margin-left: 268px;
  min-height: 100vh;
}

.app-topbar {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.app-topbar__menu {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
}
.brand--compact {
  color: var(--ink);
  font-size: 1.2rem;
}
.app-topbar__cta {
  margin-left: auto;
}
.app-topbar__theme {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
}
.app-topbar__theme + .ml-btn {
  margin-left: 4px;
}

.app-content {
  min-height: calc(100vh - 0px);
}

/* ---------- Overlay + transicoes ---------- */
.app-overlay {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: var(--overlay);
  backdrop-filter: blur(2px);
}
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--dur) var(--ease);
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}
.page-leave-active {
  pointer-events: none;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
}

/* ---------- Responsivo ---------- */
@media (min-width: 1024px) {
  .app-overlay {
    display: none;
    pointer-events: none;
  }
}

@media (max-width: 1023px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--dur-lg) var(--ease-out);
    box-shadow: var(--shadow-lg);
  }
  .sidebar--open {
    transform: translateX(0);
  }
  .sidebar__close {
    display: inline-grid;
    place-items: center;
  }
  .app-main {
    margin-left: 0;
  }
  .app-topbar {
    display: flex;
  }
}
</style>
