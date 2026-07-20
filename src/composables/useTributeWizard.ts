import { computed, reactive, ref } from 'vue'
import { fetchTribute, updateTribute } from '@/api/tributes'
import type {
  TributeDetail,
  TributeEventInfo,
  TributeModulesConfig,
  TributeSpecialDateConfig,
  TributeTimelineItem,
} from '@/api/types'
import { fallbackTimelineTitle, timelineItemHasContent } from '@/utils/timeline'
import { WIZARD_TRIBUTE_TYPE_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import { getTemplateDefinition } from '@/templates/registry'
import { layoutUsesOptionalTextBlocks, resolvePresentationSchema } from '@/templates/presentationSchema'
import { syncModulesFromPresentation } from '@/utils/tributeModules'
import { useAutosave } from './useAutosave'

const DEFAULT_SPECIAL_DATE: TributeSpecialDateConfig = {
  enabled: false,
  kind: 'custom',
  date: '',
  time: '',
  title: '',
  description: '',
  counter_mode: 'since',
  display_format: 'card',
}

const DEFAULT_MODULES: TributeModulesConfig = {
  digital_album: true,
  letter: false,
  timeline: true,
  couple_map: false,
  digital_book: false,
  quiz: false,
  playlist: false,
  night_sky: false,
  qr_code: true,
  comments: false,
  reactions: false,
  gifts: false,
}

export function useTributeWizard(tributeId: string) {
  const tribute = ref<TributeDetail | null>(null)
  const loading = ref(true)
  const error = ref('')

  const form = reactive({
    wizard_type_id: '' as string,
    wizard_category_slug: '' as string,
    template_id: '' as string,
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
    special_date_config: { ...DEFAULT_SPECIAL_DATE } as TributeSpecialDateConfig,
    modules: { ...DEFAULT_MODULES } as TributeModulesConfig,
    music_autoplay: true,
    music_loop: true,
    music_start_seconds: 0,
    music_end_seconds: 0,
    music_duration_seconds: 0,
    include_opening_message: false,
    include_closing_message: false,
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
        if (item.location?.trim()) entry.location = item.location.trim()
        if (item.emotion?.trim()) entry.emotion = item.emotion.trim()
        if (item.video_url?.trim()) entry.video_url = item.video_url.trim()
        return entry
      })
  }

  function cleanSpecialDateConfig(): TributeSpecialDateConfig | null {
    const cfg = form.special_date_config
    if (!cfg.enabled) return { enabled: false }
    const entry: TributeSpecialDateConfig = { enabled: true }
    if (cfg.kind) entry.kind = cfg.kind
    if (cfg.date?.trim()) entry.date = cfg.date.trim()
    if (cfg.time?.trim()) entry.time = cfg.time.trim()
    if (cfg.title?.trim()) entry.title = cfg.title.trim()
    if (cfg.description?.trim()) entry.description = cfg.description.trim()
    if (cfg.counter_mode) entry.counter_mode = cfg.counter_mode
    if (cfg.display_format) entry.display_format = cfg.display_format
    return entry
  }

  function cleanModules(): TributeModulesConfig {
    return { ...form.modules }
  }

  const autosavePayload = computed(() => ({
    title: form.title || null,
    subtitle: form.subtitle || null,
    honoree_name: form.honoree_name || null,
    message: form.message || null,
    closing_message: form.closing_message || null,
    special_date: form.special_date_config.enabled
      ? form.special_date_config.date || form.special_date || null
      : null,
    color_primary: form.color_primary,
    music_source: form.music_source,
    music_track_id: form.music_source === 'library' ? form.music_track_id : null,
    ...(form.template_id ? { template_id: form.template_id } : {}),
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
      special_date_config: cleanSpecialDateConfig(),
      modules: cleanModules(),
      wizard_category_slug: form.wizard_category_slug || null,
      wizard_type_id: form.wizard_type_id || null,
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
      include_opening_message: form.include_opening_message,
      include_closing_message: form.include_closing_message,
    },
  }))

  const { saving, savedAt, error: saveError, flush: flushAutosave } = useAutosave(autosavePayload, async (payload) => {
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
    form.template_id = data.template.id
    const savedTypeId = data.content_json?.wizard_type_id
    const savedCategory = data.content_json?.wizard_category_slug as string | undefined
    const optionById = savedTypeId
      ? WIZARD_TRIBUTE_TYPE_OPTIONS.find((item) => item.id === savedTypeId)
      : undefined
    const option =
      optionById ??
      WIZARD_TRIBUTE_TYPE_OPTIONS.find(
        (item) =>
          item.id === savedCategory ||
          item.categorySlug === savedCategory ||
          item.typeSlugs.includes(data.tribute_type.slug),
      ) ??
      WIZARD_TRIBUTE_TYPE_OPTIONS.find((item) => item.typeSlugs.includes(data.tribute_type.slug))
    form.wizard_type_id = option?.id ?? savedTypeId ?? ''
    form.wizard_category_slug = option?.categorySlug ?? savedCategory ?? data.tribute_type.slug ?? ''
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
    const savedSpecial = data.content_json?.special_date_config
    form.special_date_config = {
      ...DEFAULT_SPECIAL_DATE,
      ...(savedSpecial ?? {}),
      enabled: savedSpecial?.enabled ?? Boolean(data.special_date),
      date: savedSpecial?.date ?? data.special_date ?? '',
    }
    form.modules = {
      ...DEFAULT_MODULES,
      ...(data.content_json?.modules ?? {}),
    }
    syncModulesFromPresentation(
      form.modules,
      form.presentation,
      getTemplateDefinition(data.template.slug),
    )
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
    const definition = getTemplateDefinition(data.template.slug)
    const layout = resolvePresentationSchema(form.presentation, definition).layout
    const optionalTextBlocks = layoutUsesOptionalTextBlocks(layout)
    form.include_opening_message =
      typeof data.content_json?.include_opening_message === 'boolean'
        ? data.content_json.include_opening_message
        : optionalTextBlocks && Boolean(data.message?.trim())
    form.include_closing_message =
      typeof data.content_json?.include_closing_message === 'boolean'
        ? data.content_json.include_closing_message
        : Boolean(data.closing_message?.trim())
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
    flushAutosave,
  }
}
