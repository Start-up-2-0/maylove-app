import { computed, reactive, ref } from 'vue'
import { fetchTribute, updateTribute } from '@/api/tributes'
import type { TributeDetail } from '@/api/types'
import { useAutosave } from './useAutosave'

export function useTributeWizard(tributeId: string) {
  const tribute = ref<TributeDetail | null>(null)
  const loading = ref(true)
  const error = ref('')

  const form = reactive({
    title: '',
    subtitle: '',
    honoree_name: '',
    message: '',
    closing_message: '',
    special_date: '',
    slug: '',
    color_primary: '#d94f7a',
    music_source: 'none' as 'none' | 'library' | 'upload',
    music_track_id: null as string | null,
    effects: [] as string[],
  })

  const autosavePayload = computed(() => ({
    title: form.title || null,
    subtitle: form.subtitle || null,
    honoree_name: form.honoree_name || null,
    message: form.message || null,
    closing_message: form.closing_message || null,
    special_date: form.special_date || null,
    slug: form.slug || null,
    color_primary: form.color_primary,
    music_source: form.music_source,
    music_track_id: form.music_source === 'library' ? form.music_track_id : null,
    content_json: { effects: [...form.effects] },
  }))

  const { saving, savedAt, error: saveError } = useAutosave(autosavePayload, async (payload) => {
    if (!tribute.value || !isEditable.value) return
    tribute.value = await updateTribute(tributeId, payload)
  })

  const isEditable = computed(() => {
    const status = tribute.value?.status
    return status === 'draft' || status === 'awaiting_payment'
  })

  const photos = computed(() =>
    (tribute.value?.media ?? []).filter((item) => item.media_type === 'photo'),
  )

  async function load() {
    loading.value = true
    error.value = ''
    try {
      tribute.value = await fetchTribute(tributeId)
      syncFormFromTribute(tribute.value)
    } catch {
      error.value = 'Não foi possível carregar a homenagem.'
    } finally {
      loading.value = false
    }
  }

  function syncFormFromTribute(data: TributeDetail) {
    form.title = data.title ?? ''
    form.subtitle = data.subtitle ?? ''
    form.honoree_name = data.honoree_name ?? ''
    form.message = data.message ?? ''
    form.closing_message = data.closing_message ?? ''
    form.special_date = data.special_date ?? ''
    form.slug = data.slug ?? ''
    form.color_primary = data.color_primary ?? data.template.primary_color
    form.music_source = data.music_source
    form.music_track_id = data.music_track_id
    form.effects = [...(data.content_json?.effects ?? [])]
  }

  async function reload() {
    tribute.value = await fetchTribute(tributeId)
  }

  return {
    tribute,
    form,
    loading,
    error,
    saving,
    savedAt,
    saveError,
    isEditable,
    photos,
    load,
    reload,
    syncFormFromTribute,
  }
}
