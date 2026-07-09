import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'
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

  createApp(App).use(createPinia()).use(router).mount('#app')
}

void bootstrap()
