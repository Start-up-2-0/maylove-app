import { computed, reactive, ref } from 'vue'
import { fetchAlbum, updateAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { DEFAULT_BOOK_PRESENTATION, isTimelinePresentation } from '@/modules/album/book/presentations'
import type { BookPresentationId } from '@/modules/album/book/types'
import { useAutosave } from './useAutosave'

export function useAlbumWizard(albumId: string) {
  const album = ref<AlbumDetail | null>(null)
  const loading = ref(true)
  const error = ref('')

  const form = reactive({
    title: '',
    subtitle: '',
    closing_message: '',
    signature: '',
    color_primary: '#c45d7a',
    is_public: true,
    presentation: DEFAULT_BOOK_PRESENTATION as BookPresentationId,
    photos_per_page: 1,
  })

  const autosavePayload = computed(() => ({
    title: form.title || null,
    subtitle: form.subtitle || null,
    closing_message: form.closing_message || null,
    signature: form.signature || null,
    color_primary: form.color_primary,
    is_public: form.is_public,
    presentation: form.presentation,
    photos_per_page: form.photos_per_page,
  }))

  const { saving, savedAt, error: saveError } = useAutosave(autosavePayload, async (payload) => {
    if (!album.value || !isEditable.value) return
    album.value = await updateAlbum(albumId, payload)
  })

  const isEditable = computed(() => album.value?.status === 'draft')

  const photos = computed(() =>
    (album.value?.media ?? []).filter((item) => item.media_type === 'photo'),
  )

  const audio = computed(
    () => (album.value?.media ?? []).find((item) => item.media_type === 'audio') ?? null,
  )

  async function load() {
    loading.value = true
    error.value = ''
    try {
      album.value = await fetchAlbum(albumId)
      syncFormFromAlbum(album.value)
    } catch {
      error.value = 'Não foi possível carregar o álbum.'
    } finally {
      loading.value = false
    }
  }

  function syncFormFromAlbum(data: AlbumDetail) {
    form.title = data.title ?? ''
    form.subtitle = data.subtitle ?? ''
    form.closing_message = data.closing_message ?? ''
    form.signature = data.signature ?? ''
    form.color_primary = data.color_primary ?? '#c45d7a'
    form.is_public = data.is_public
    form.presentation = (data.presentation as BookPresentationId) || DEFAULT_BOOK_PRESENTATION
    form.photos_per_page = isTimelinePresentation(form.presentation)
      ? 1
      : (data.photos_per_page ?? 1)
  }

  async function reload() {
    album.value = await fetchAlbum(albumId)
    syncFormFromAlbum(album.value)
  }

  return {
    album,
    form,
    loading,
    error,
    saving,
    savedAt,
    saveError,
    isEditable,
    photos,
    audio,
    load,
    reload,
    syncFormFromAlbum,
  }
}
