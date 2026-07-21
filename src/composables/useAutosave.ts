import { ref, watch, type Ref } from 'vue'

export function useAutosave<T extends Record<string, unknown>>(
  source: Ref<T>,
  saveFn: (payload: T) => Promise<void>,
  delayMs = 2000,
) {
  const saving = ref(false)
  const savedAt = ref<Date | null>(null)
  const error = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null
  let version = 0
  let pending = false
  let inFlight: Promise<void> | null = null

  async function runSave() {
    const currentVersion = ++version
    saving.value = true
    error.value = ''
    try {
      await saveFn({ ...source.value })
      if (currentVersion === version) {
        savedAt.value = new Date()
        pending = false
      }
    } catch {
      if (currentVersion === version) {
        error.value = 'Não foi possível salvar automaticamente.'
      }
      throw new Error('autosave_failed')
    } finally {
      if (currentVersion === version) {
        saving.value = false
      }
    }
  }

  watch(
    source,
    () => {
      pending = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        inFlight = runSave()
          .catch(() => {
            /* error already set */
          })
          .finally(() => {
            inFlight = null
          })
      }, delayMs)
    },
    { deep: true },
  )

  /** Cancela o debounce e persiste agora (ex.: antes de publicar). */
  async function flush(): Promise<boolean> {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (inFlight) {
      try {
        await inFlight
      } catch {
        /* ignore */
      }
    }

    if (!pending && !error.value) {
      return true
    }

    try {
      inFlight = runSave()
      await inFlight
      return !error.value
    } catch {
      return false
    } finally {
      inFlight = null
    }
  }

  return { saving, savedAt, error, flush }
}
