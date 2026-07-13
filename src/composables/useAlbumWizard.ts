import { computed, reactive, ref } from 'vue'
import { fetchAlbum, updateAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { DEFAULT_BOOK_PRESENTATION, isTimelinePresentation } from '@/modules/album/book/presentations'
import {
  DEFAULT_BOOK_CONFIG,
  normalizeBookConfig,
  type BookConfig,
  type BookPage,
} from '@/modules/album/book/bookConfig'
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
    color_primary: DEFAULT_BOOK_CONFIG.colors.accent,
    is_public: true,
    presentation: DEFAULT_BOOK_PRESENTATION as BookPresentationId,
    photos_per_page: 1,
    book_config: normalizeBookConfig(DEFAULT_BOOK_CONFIG) as BookConfig,
    book_pages: [] as BookPage[],
  })

  const autosavePayload = computed(() => ({
    title: form.title || null,
    subtitle: form.subtitle || null,
    closing_message: form.closing_message || null,
    signature: form.signature || null,
    color_primary: form.book_config.colors.accent || form.color_primary,
    is_public: form.is_public,
    presentation: form.presentation,
    photos_per_page: form.photos_per_page,
    book_config: form.book_config,
    book_pages: form.book_pages,
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
    form.color_primary = data.color_primary ?? DEFAULT_BOOK_CONFIG.colors.accent
    form.is_public = data.is_public
    form.presentation = (data.presentation as BookPresentationId) || DEFAULT_BOOK_PRESENTATION
    form.photos_per_page = isTimelinePresentation(form.presentation)
      ? 1
      : (data.photos_per_page ?? 1)
    form.book_config = normalizeBookConfig({
      ...((data.book_config as BookConfig | null) ?? undefined),
      colors: {
        paper:
          ((data.book_config as BookConfig | null)?.colors?.paper as string | undefined) ??
          DEFAULT_BOOK_CONFIG.colors.paper,
        ink:
          ((data.book_config as BookConfig | null)?.colors?.ink as string | undefined) ??
          DEFAULT_BOOK_CONFIG.colors.ink,
        accent:
          ((data.book_config as BookConfig | null)?.colors?.accent as string | undefined) ??
          data.color_primary ??
          DEFAULT_BOOK_CONFIG.colors.accent,
        page:
          ((data.book_config as BookConfig | null)?.colors?.page as string | undefined) ??
          ((data.book_config as BookConfig | null)?.colors?.paper as string | undefined) ??
          DEFAULT_BOOK_CONFIG.colors.page,
      },
    })
    form.book_pages = Array.isArray(data.book_pages)
      ? (data.book_pages as unknown as BookPage[])
      : []
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
