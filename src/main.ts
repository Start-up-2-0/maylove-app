import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'
import { startSessionRefreshScheduler } from '@/composables/useSessionRefresh'
import { useAuthStore } from '@/stores/auth'
import './styles/main.css'

async function bootstrap() {
  initTheme()

  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    if (import.meta.env.PROD) {
      console.warn(
        '[maylove] VITE_USE_MOCKS=true em produção — o app não usará a API real. Defina false no Railway.',
      )
    }
    const { startMocks } = await import('@/mocks/browser')
    await startMocks()
  }

  const pinia = createPinia()
  const app = createApp(App).use(pinia).use(router)

  const auth = useAuthStore(pinia)
  auth.hydrateFromStorage()
  if (auth.token) {
    startSessionRefreshScheduler()
  }

  app.mount('#app')
}

void bootstrap()
