import { computed, reactive, ref } from 'vue'
import { fetchAlbum, loadAlbumChaptersWithMemories, updateAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { DEFAULT_BOOK_PRESENTATION } from '@/modules/album/book/presentations'
import { isAlbumPhotoMedia } from '@/modules/album/mediaTypes'
import {
  DEFAULT_BOOK_CONFIG,
  normalizeBookConfig,
  resolveBookConfig,
  type BookConfig,
} from '@/modules/album/book/bookConfig'
import type { BookPresentationId } from '@/modules/album/book/types'
import { useAutosave } from './useAutosave'

export function mergeAlbumContentJson(
  current: Record<string, unknown> | null | undefined,
  presentation: BookPresentationId,
  additions: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...(current ?? {}),
    ...additions,
    presentation,
  }
}

export function useAlbumWizard(albumId: string) {
  const album = ref<AlbumDetail | null>(null)
  const loading = ref(true)
  const error = ref('')
  let persistedContentJson: Record<string, unknown> | null = null

  const form = reactive({
    title: '',
    subtitle: '',
    honoree_names: '',
    dedication: '',
    life_birth_date: '',
    life_death_date: '',
    category: '',
    color_primary: DEFAULT_BOOK_CONFIG.colors.accent,
    is_public: true,
    presentation: DEFAULT_BOOK_PRESENTATION as BookPresentationId,
    book_config: normalizeBookConfig(DEFAULT_BOOK_CONFIG) as BookConfig,
  })

  const autosavePayload = computed(() => ({
    title: form.title || null,
    subtitle: form.subtitle || null,
    honoree_names: form.honoree_names || null,
    dedication: form.dedication || null,
    category: form.category || null,
    presentation: form.presentation,
    color_primary: form.book_config.colors.accent || form.color_primary,
    is_public: form.is_public,
    book_config: form.book_config,
    content_json: mergeAlbumContentJson(persistedContentJson, form.presentation, {
      life_dates: {
        birth_date: form.life_birth_date || null,
        death_date: form.life_death_date || null,
      },
    }),
  }))

  const { saving, savedAt, error: saveError, flush: flushAutosave } = useAutosave(
    autosavePayload,
    async (payload) => {
      if (!album.value || !isEditable.value) return
      album.value = await updateAlbum(albumId, payload)
    },
  )

  const isEditable = computed(
    () => album.value?.status === 'draft' || album.value?.status === 'awaiting_payment',
  )

  const photos = computed(() =>
    (album.value?.media ?? []).filter((item) => isAlbumPhotoMedia(item.media_type)),
  )

  const audio = computed(
    () => (album.value?.media ?? []).find((item) => item.media_type === 'audio') ?? null,
  )

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const data = await fetchAlbum(albumId)
      const chapters = await loadAlbumChaptersWithMemories(albumId)
      album.value = {
        ...data,
        chapters,
        experiences: data.experiences ?? [],
      }
      syncFormFromAlbum(album.value)
    } catch {
      error.value = 'Não foi possível carregar o álbum.'
    } finally {
      loading.value = false
    }
  }

  function syncFormFromAlbum(data: AlbumDetail) {
    persistedContentJson = data.content_json ? { ...data.content_json } : null
    form.title = data.title ?? ''
    form.subtitle = data.subtitle ?? ''
    form.honoree_names = data.honoree_names ?? ''
    form.dedication = data.dedication ?? data.closing_message ?? ''
    const lifeDates = (data.content_json as { life_dates?: { birth_date?: string; death_date?: string } } | null)?.life_dates
    form.life_birth_date = lifeDates?.birth_date ?? ''
    form.life_death_date = lifeDates?.death_date ?? ''
    form.category = data.category ?? ''
    form.color_primary = data.color_primary ?? DEFAULT_BOOK_CONFIG.colors.accent
    form.is_public = data.is_public
    form.presentation =
      ((data.content_json as { presentation?: string } | undefined)?.presentation as
        | BookPresentationId
        | undefined) || (DEFAULT_BOOK_PRESENTATION as BookPresentationId)

    form.book_config = resolveBookConfig(data.book_config as BookConfig | null, form.presentation)
    if (!form.book_config.colors.accent && data.color_primary) {
      form.book_config.colors.accent = data.color_primary
    }
  }

  async function reload() {
    const data = await fetchAlbum(albumId)
    const chapters = await loadAlbumChaptersWithMemories(albumId)
    album.value = {
      ...data,
      chapters,
      experiences: data.experiences ?? [],
    }
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
    flushAutosave,
    isEditable,
    photos,
    audio,
    load,
    reload,
    syncFormFromAlbum,
  }
}
