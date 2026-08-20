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
  let changeVersion = 0
  let savedVersion = 0
  let pending = false
  let inFlight: Promise<void> | null = null

  async function runSave() {
    const targetVersion = changeVersion
    saving.value = true
    error.value = ''
    try {
      await saveFn({ ...source.value })
      savedVersion = Math.max(savedVersion, targetVersion)
      savedAt.value = new Date()
      pending = savedVersion < changeVersion
    } catch {
      error.value = 'Não foi possível salvar automaticamente.'
      pending = true
      throw new Error('autosave_failed')
    } finally {
      saving.value = false
    }
  }

  watch(
    source,
    () => {
      changeVersion += 1
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
