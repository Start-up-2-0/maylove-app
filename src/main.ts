import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'
import './styles/main.css'

async function bootstrap() {
  initTheme()

  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { startMocks } = await import('@/mocks/browser')
    await startMocks()
  }

  createApp(App).use(createPinia()).use(router).mount('#app')
}

void bootstrap()
