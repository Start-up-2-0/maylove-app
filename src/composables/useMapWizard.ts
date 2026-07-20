import { computed, reactive, ref } from 'vue'
import { fetchMap, updateMap } from '@/api/maps'
import type { CoupleMapDetail, MapStyle } from '@/api/types'
import { useAutosave } from './useAutosave'

export function useMapWizard(mapId: string) {
  const map = ref<CoupleMapDetail | null>(null)
  const loading = ref(true)
  const error = ref('')

  const form = reactive({
    title: '',
    subtitle: '',
    couple_names: '',
    map_style: 'romantic' as MapStyle,
    show_route: true,
  })

  const isEditable = computed(
    () => map.value?.status === 'draft' || map.value?.status === 'awaiting_payment',
  )

  const autosavePayload = computed(() => ({
    title: form.title.trim() || 'Nosso mapa do casal',
    subtitle: form.subtitle.trim() || null,
    couple_names: form.couple_names.trim() || 'Nós dois',
    map_style: form.map_style,
    show_route: form.show_route,
  }))

  const { saving, savedAt, error: saveError, flush: flushAutosave } = useAutosave(
    autosavePayload,
    async (payload) => {
      if (!map.value || !isEditable.value) return
      map.value = await updateMap(mapId, payload)
    },
  )

  async function load() {
    loading.value = true
    error.value = ''
    try {
      map.value = await fetchMap(mapId)
      syncFormFromMap(map.value)
    } catch {
      error.value = 'Não foi possível carregar o mapa.'
    } finally {
      loading.value = false
    }
  }

  function syncFormFromMap(data: CoupleMapDetail) {
    form.title = data.title ?? ''
    form.subtitle = data.subtitle ?? ''
    form.couple_names = data.couple_names ?? ''
    form.map_style = data.map_style ?? 'romantic'
    form.show_route = data.show_route ?? true
  }

  async function reload() {
    const data = await fetchMap(mapId)
    map.value = data
    syncFormFromMap(data)
  }

  return {
    map,
    form,
    loading,
    error,
    saving,
    savedAt,
    saveError,
    flushAutosave,
    isEditable,
    load,
    reload,
  }
}
