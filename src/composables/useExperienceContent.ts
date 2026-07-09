import type { PublicTribute, TributeDetail, TributeMedia } from '@/api/types'
import type { useTributeWizard } from './useTributeWizard'
import type {
  AnimationEntrance,
  AnimationSpeed,
  ExperienceContent,
  ExperienceMediaItem,
  ResolvedTheme,
  TemplateDefinition,
} from '@/templates/types'
import { getStyle } from '@/templates/styles'
import { getBackground } from '@/templates/backgrounds'

type WizardForm = ReturnType<typeof useTributeWizard>['form']

interface ResolveOptions {
  detail?: TributeDetail | null
  publicData?: PublicTribute | null
  form?: WizardForm
  tribute?: TributeDetail | null
}

const SPEED_MULTIPLIER: Record<AnimationSpeed, number> = {
  slow: 1.5,
  normal: 1,
  fast: 0.6,
}

function mediaFromDetail(media: TributeMedia[]): ExperienceMediaItem[] {
  return media
    .filter((item) => item.media_type === 'photo')
    .map((item) => ({
      id: item.id,
      url: item.url || item.url_thumbnail || '',
      thumbnail: item.url_thumbnail || undefined,
      type: 'photo' as const,
    }))
    .filter((item) => item.url)
}

function mediaFromPublic(media: PublicTribute['media']): ExperienceMediaItem[] {
  return media
    .filter((item) => item.media_type === 'photo')
    .map((item) => ({
      id: item.id,
      url: item.url || item.url_thumbnail || '',
      thumbnail: item.url_thumbnail || undefined,
      type: 'photo' as const,
    }))
    .filter((item) => item.url)
}

export function resolveTheme(
  def: TemplateDefinition,
  opts: {
    color?: string | null
    speed?: AnimationSpeed
    styleId?: string | null
    font?: string | null
    background?: string | null
    entrance?: AnimationEntrance | null
  } = {},
): ResolvedTheme {
  // Estilo visual: sobrescreve a "roupa" do template sem tocar na estrutura.
  const style = getStyle(opts.styleId)
  const ov = style?.overrides
  // Ajustes avulsos do usuário têm prioridade sobre o estilo.
  const bg = getBackground(opts.background)

  const primaryColor = opts.color || ov?.primaryColor || def.theme.primaryColor
  const accentColor = ov?.accentColor || def.theme.accentColor || primaryColor
  const fontDisplay = opts.font || ov?.fontDisplay || def.theme.fontDisplay
  const fontBody = ov?.fontBody || def.theme.fontBody
  const background = bg?.value || ov?.background || def.theme.background
  const mode = bg?.mode || ov?.mode || def.theme.mode
  const entrance = opts.entrance || ov?.entrance || def.animation.entrance
  const speed = opts.speed || ov?.speed || def.animation.speed
  const speedMultiplier = SPEED_MULTIPLIER[speed]
  const revealDur = (0.7 * speedMultiplier).toFixed(2)

  const cssVars: Record<string, string> = {
    '--exp-primary': primaryColor,
    '--exp-primary-soft': `color-mix(in srgb, ${primaryColor} 16%, transparent)`,
    '--exp-primary-strong': `color-mix(in srgb, ${primaryColor} 78%, #000)`,
    '--exp-accent': accentColor,
    '--exp-font-display': fontDisplay,
    '--exp-font-body': fontBody,
    '--exp-bg': background,
    '--exp-reveal-dur': `${revealDur}s`,
    '--exp-ink': mode === 'dark' ? '#f6f1f4' : '#241820',
    '--exp-text': mode === 'dark' ? '#d9cdd5' : '#3a2c34',
    '--exp-muted': mode === 'dark' ? '#a394ac' : '#7c6a74',
    '--exp-surface': mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
    '--exp-border': mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
  }

  return {
    primaryColor,
    accentColor,
    fontDisplay,
    fontBody,
    background,
    mode,
    entrance,
    speedMultiplier,
    cssVars,
  }
}

export function resolveContent(def: TemplateDefinition, opts: ResolveOptions): ExperienceContent {
  const sample = def.sampleContent ?? {}
  const { detail, publicData, form, tribute } = opts
  const content = tribute?.content_json ?? detail?.content_json ?? publicData?.content_json ?? {}

  const honoreeName =
    form?.honoree_name ||
    detail?.honoree_name ||
    publicData?.honoree_name ||
    tribute?.honoree_name ||
    sample.honoreeName ||
    ''

  const title =
    form?.title ||
    detail?.title ||
    publicData?.title ||
    tribute?.title ||
    sample.title ||
    honoreeName ||
    'Homenagem'

  const subtitle =
    form?.subtitle || detail?.subtitle || publicData?.subtitle || sample.subtitle || ''

  const message =
    form?.message || detail?.message || publicData?.message || sample.message || ''

  const closingMessage =
    form?.closing_message ||
    detail?.closing_message ||
    publicData?.closing_message ||
    sample.closingMessage ||
    'Feito com carinho'

  const specialDate =
    form?.special_date ||
    detail?.special_date ||
    publicData?.special_date ||
    sample.specialDate ||
    null

  const realPhotos = publicData
    ? mediaFromPublic(publicData.media)
    : mediaFromDetail(tribute?.media ?? detail?.media ?? [])
  const photos = realPhotos.length ? realPhotos : sample.photos ?? []

  const formMessages = form?.messages?.map((msg) => msg.trim()).filter((msg) => msg.length > 0)
  const messages =
    formMessages && formMessages.length
      ? formMessages
      : content.messages && content.messages.length
        ? content.messages
        : sample.messages ?? (message ? [message] : [])

  const formTimeline = form?.timeline?.filter((item) => item.title?.trim())
  const timeline =
    formTimeline && formTimeline.length
      ? formTimeline.map((item) => ({
          date: item.date,
          title: item.title,
          description: item.description,
          photoUrl: item.photo_url,
        }))
      : content.timeline && content.timeline.length
        ? content.timeline.map((item) => ({
            date: item.date,
            title: item.title,
            description: item.description,
            photoUrl: item.photo_url,
          }))
        : sample.timeline ?? []

  const formEvent = form?.event_info
  const hasFormEvent = Boolean(
    formEvent && (formEvent.date?.trim() || formEvent.location?.trim() || formEvent.map_url?.trim()),
  )
  const eventInfo = hasFormEvent
    ? {
        date: formEvent!.date,
        location: formEvent!.location,
        mapUrl: formEvent!.map_url,
      }
    : content.event_info
      ? {
          date: content.event_info.date,
          location: content.event_info.location,
          mapUrl: content.event_info.map_url,
        }
      : sample.eventInfo ?? null

  const musicUrl = resolveMusicUrl(opts)
  const effects = (content.effects as ExperienceContent['effects']) ?? def.effects ?? []

  const orderFromForm = form?.section_order
  const rawOrder = (orderFromForm && orderFromForm.length ? orderFromForm : content.section_order) ?? null
  const sectionOrder = rawOrder && rawOrder.length ? rawOrder : null

  const photoStyle = (form?.photo_style || content.photo_style || null) as
    | ExperienceContent['photoStyle']

  const textStyle = (form?.text_style || content.text_style || null) as
    | ExperienceContent['textStyle']

  const question = form?.question || content.question || sample.question || ''
  const celebration = form?.celebration || content.celebration || sample.celebration || ''

  const senderName = form?.sender_name || content.sender_name || sample.senderName || ''
  const musicAutoplay =
    form?.music_autoplay ?? content.music_autoplay ?? sample.music?.autoplay ?? true
  const musicLoop = form?.music_loop ?? content.music_loop ?? sample.music?.loop ?? true
  const musicDuration =
    form?.music_duration_seconds ??
    content.music_duration_seconds ??
    detail?.music?.duration_seconds ??
    detail?.music?.track?.duration_seconds ??
    publicData?.music?.duration_seconds ??
    0
  const musicStart = form?.music_start_seconds ?? content.music_start_seconds ?? 0
  const musicEnd =
    form?.music_end_seconds ??
    content.music_end_seconds ??
    (musicDuration > 0 ? musicDuration : null)

  return {
    honoreeName,
    senderName,
    title,
    subtitle,
    message,
    messages,
    closingMessage,
    question,
    celebration,
    signature: form?.signature || content.signature || sample.signature || senderName,
    specialDate,
    photos,
    videoUrl: form?.video_url || content.video_url || sample.videoUrl || null,
    music: {
      url: musicUrl,
      title: sample.music?.title || 'Trilha sonora',
      autoplay: musicAutoplay,
      loop: musicLoop,
      startAt: musicStart > 0 ? musicStart : 0,
      endAt: musicEnd,
    },
    timeline,
    eventInfo,
    effects,
    sectionOrder,
    photoStyle,
    textStyle,
    slug: detail?.slug || publicData?.slug || tribute?.slug || '',
    viewsCount: publicData ? publicData.views_count : null,
  }
}

function resolveMusicUrl(opts: ResolveOptions): string | null {
  const { detail, publicData, tribute } = opts
  if (publicData?.music && typeof publicData.music === 'object') {
    const music = publicData.music as { preview_url?: string; url?: string }
    return music.preview_url || music.url || null
  }
  const source = tribute ?? detail
  return source?.music?.url || source?.music?.preview_url || null
}
