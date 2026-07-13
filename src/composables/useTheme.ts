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
 * Inicializa o tema global a partir do localStorage.
 * Padrao: claro (nao segue prefers-color-scheme do SO).
 */
export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'dark' || stored === 'light') {
    theme.value = stored
  } else {
    theme.value = 'light'
  }
  applyTheme(theme.value)
}

/** Aplica tema sem persistir — usado em paginas publicas compartilhaveis. */
export function forceTheme(value: ThemeMode) {
  theme.value = value
  applyTheme(value)
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
