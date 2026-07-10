import { computed, reactive, ref } from 'vue'
import { fetchTribute, updateTribute } from '@/api/tributes'
import type { TributeDetail, TributeEventInfo, TributeTimelineItem } from '@/api/types'
import { fallbackTimelineTitle, timelineItemHasContent } from '@/utils/timeline'
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
    color_primary: '#e11d7a',
    music_source: 'none' as 'none' | 'library' | 'upload',
    music_track_id: null as string | null,
    effects: [] as string[],
    style_id: '' as string,
    presentation: '' as string,
    animation_speed: '' as '' | 'slow' | 'normal' | 'fast',
    entrance: '' as '' | 'fade' | 'slide-up' | 'zoom',
    font: '' as string,
    background: '' as string,
    section_order: [] as string[],
    photo_style: '' as '' | 'slider' | 'gallery' | 'mosaic' | 'polaroid',
    text_style: '' as '' | 'default' | 'typewriter',
    question: '',
    celebration: '',
    sender_name: '',
    signature: '',
    video_url: '',
    messages: [] as string[],
    timeline: [] as TributeTimelineItem[],
    event_info: { date: '', location: '', map_url: '' } as TributeEventInfo,
    music_autoplay: true,
    music_loop: true,
    music_start_seconds: 0,
    music_end_seconds: 0,
    music_duration_seconds: 0,
  })

  // event_info só é enviado se algum campo estiver preenchido; caso contrário
  // mandamos [] para limpar no backend.
  function cleanEventInfo(): TributeEventInfo | [] {
    const entry: TributeEventInfo = {}
    if (form.event_info.date?.trim()) entry.date = form.event_info.date.trim()
    if (form.event_info.location?.trim()) entry.location = form.event_info.location.trim()
    if (form.event_info.map_url?.trim()) entry.map_url = form.event_info.map_url.trim()
    return Object.keys(entry).length ? entry : []
  }

  // Momentos: descarta itens sem título (regra do backend) e normaliza campos.
  function cleanTimeline(): TributeTimelineItem[] {
    return form.timeline
      .filter((item) => timelineItemHasContent(item))
      .map((item) => {
        const title = item.title?.trim() || fallbackTimelineTitle(item.description)
        const entry: TributeTimelineItem = { title }
        if (item.date?.trim()) entry.date = item.date.trim()
        if (item.description?.trim()) entry.description = item.description.trim()
        if (item.photo_media_id?.trim()) entry.photo_media_id = item.photo_media_id.trim()
        if (item.photo_url?.trim()) entry.photo_url = item.photo_url.trim()
        return entry
      })
  }

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
    content_json: {
      effects: [...form.effects],
      style_id: form.style_id || null,
      presentation: form.presentation || null,
      font: form.font || null,
      background: form.background || null,
      section_order: [...form.section_order],
      ...(form.animation_speed ? { animation_speed: form.animation_speed } : {}),
      ...(form.entrance ? { entrance: form.entrance } : {}),
      ...(form.photo_style ? { photo_style: form.photo_style } : {}),
      ...(form.text_style ? { text_style: form.text_style } : {}),
      ...(form.question ? { question: form.question } : {}),
      ...(form.celebration ? { celebration: form.celebration } : {}),
      sender_name: form.sender_name || null,
      signature: form.signature || null,
      video_url: form.video_url || null,
      messages: form.messages.map((msg) => msg.trim()).filter((msg) => msg.length > 0),
      timeline: cleanTimeline(),
      event_info: cleanEventInfo(),
      music_autoplay: form.music_autoplay,
      music_loop: form.music_loop,
      ...(form.music_duration_seconds > 0
        ? {
            music_start_seconds: form.music_start_seconds,
            music_end_seconds:
              form.music_end_seconds > form.music_start_seconds
                ? form.music_end_seconds
                : form.music_duration_seconds,
            music_duration_seconds: form.music_duration_seconds,
          }
        : {}),
    },
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
    form.style_id = data.content_json?.style_id ?? ''
    form.presentation = data.content_json?.presentation ?? ''
    form.animation_speed = data.content_json?.animation_speed ?? ''
    form.entrance = data.content_json?.entrance ?? ''
    form.font = data.content_json?.font ?? ''
    form.background = data.content_json?.background ?? ''
    form.section_order = [...(data.content_json?.section_order ?? [])]
    form.photo_style = data.content_json?.photo_style ?? ''
    form.text_style = data.content_json?.text_style ?? ''
    form.question = data.content_json?.question ?? ''
    form.celebration = data.content_json?.celebration ?? ''
    form.sender_name = data.content_json?.sender_name ?? ''
    form.signature = data.content_json?.signature ?? ''
    form.video_url = data.content_json?.video_url ?? ''
    form.messages = [...(data.content_json?.messages ?? [])]
    form.timeline = (data.content_json?.timeline ?? []).map((item) => ({ ...item }))
    form.event_info = {
      date: data.content_json?.event_info?.date ?? '',
      location: data.content_json?.event_info?.location ?? '',
      map_url: data.content_json?.event_info?.map_url ?? '',
    }
    form.music_autoplay = data.content_json?.music_autoplay ?? true
    form.music_loop = data.content_json?.music_loop ?? true
    const duration =
      data.content_json?.music_duration_seconds ??
      data.music?.duration_seconds ??
      data.music?.track?.duration_seconds ??
      0
    form.music_duration_seconds = duration > 0 ? duration : 0
    form.music_start_seconds = data.content_json?.music_start_seconds ?? 0
    form.music_end_seconds =
      data.content_json?.music_end_seconds ??
      (form.music_duration_seconds > 0 ? form.music_duration_seconds : 0)
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
