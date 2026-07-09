import { computed, ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'maylove-theme'

const theme = ref<ThemeMode>('light')

function applyTheme(value: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', value === 'dark')
  root.style.colorScheme = value
}

/**
 * Inicializa o tema global a partir do localStorage (ou preferencia do SO como
 * fallback na primeira visita). Deve ser chamado uma unica vez no bootstrap.
 */
export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'dark' || stored === 'light') {
    theme.value = stored
  } else {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  applyTheme(theme.value)
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(value: ThemeMode) {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme(value)
  }

  function toggle() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggle }
}
