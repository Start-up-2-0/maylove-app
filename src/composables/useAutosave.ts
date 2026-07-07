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

  watch(
    source,
    () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        const currentVersion = ++version
        saving.value = true
        error.value = ''
        try {
          await saveFn({ ...source.value })
          if (currentVersion === version) {
            savedAt.value = new Date()
          }
        } catch {
          if (currentVersion === version) {
            error.value = 'Não foi possível salvar automaticamente.'
          }
        } finally {
          if (currentVersion === version) {
            saving.value = false
          }
        }
      }, delayMs)
    },
    { deep: true },
  )

  return { saving, savedAt, error }
}
