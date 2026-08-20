import { http } from 'msw'
import type {
  CheckoutResponse,
  PresignResponse,
  PublicTribute,
  SubscriptionInfo,
  TributeDetail,
  TributeStats,
  TributeValidation,
  ValidationIssue,
} from '@/api/types'
import { db } from '../db'
import { api, fail, ok } from './helpers'

// media_id -> media_type, preenchido no presign e consumido no confirm.
const pendingMedia = new Map<string, string>()

function toPublic(tribute: TributeDetail): PublicTribute {
  return {
    slug: tribute.slug,
    title: tribute.title,
    subtitle: tribute.subtitle,
    honoree_name: tribute.honoree_name,
    message: tribute.message,
    closing_message: tribute.closing_message,
    special_date: tribute.special_date,
    color_primary: tribute.color_primary,
    views_count: tribute.views_count,
    og_image_url: tribute.og_image_url,
    published_at: tribute.published_at,
    content_json: tribute.content_json,
    tribute_type: {
      slug: tribute.tribute_type.slug,
      name: tribute.tribute_type.name,
      icon: null,
    },
    template: {
      slug: tribute.template.slug,
      name: tribute.template.name,
      primary_color: tribute.template.primary_color,
      supports_video: tribute.template.supports_video,
      supports_music: tribute.template.supports_music,
      has_animation: tribute.template.has_animation,
      config_json: tribute.template.config_json ?? {},
    },
    media: tribute.media
      .filter((item) => item.media_type === 'photo')
      .map((item) => ({
        id: item.id,
        media_type: item.media_type,
        url: item.url ?? null,
        url_thumbnail: item.url_thumbnail ?? null,
        sort_order: item.sort_order,
      })),
    music: tribute.music_source === 'none' ? null : { source: tribute.music_source },
  }
}

function validate(tribute: TributeDetail): TributeValidation {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const photos = tribute.media.filter((item) => item.media_type === 'photo')

  if (!tribute.title && !tribute.honoree_name) {
    errors.push({ field: 'title', code: 'REQUIRED', message: 'Informe um título ou nome do homenageado.' })
  }
  if (photos.length === 0) {
    errors.push({ field: 'media', code: 'MIN_PHOTOS', message: 'Adicione pelo menos uma foto.' })
  }
  if (!tribute.message) {
    warnings.push({ field: 'message', code: 'RECOMMENDED', message: 'Uma mensagem deixa a homenagem mais especial.' })
  }

  return { valid: errors.length === 0, errors, warnings }
}

export const tributeHandlers = [
  http.get(api('/tributes'), ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? undefined
    return ok(db.listTributes(status))
  }),

  http.post(api('/tributes'), async ({ request }) => {
    const body = (await request.json()) as { tribute_type_id: string; template_id: string }
    return ok(db.createTribute(body.tribute_type_id, body.template_id))
  }),

  http.get(api('/tributes/:id'), ({ params }) => {
    const tribute = db.getTribute(params.id as string)
    return tribute ? ok(tribute) : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.patch(api('/tributes/:id'), async ({ params, request }) => {
    const payload = (await request.json()) as Record<string, unknown>
    const tribute = db.updateTribute(params.id as string, payload)
    return tribute ? ok(tribute) : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.delete(api('/tributes/:id'), ({ params }) => {
    const deleted = db.deleteTribute(params.id as string)
    return deleted ? ok(null, 'Homenagem excluída.') : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.get(api('/tributes/:id/preview-data'), ({ params }) => {
    const tribute = db.getTribute(params.id as string)
    return tribute
      ? ok({ ...tribute, is_preview: true })
      : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.get(api('/tributes/:id/validate'), ({ params }) => {
    const tribute = db.getTribute(params.id as string)
    return tribute ? ok(validate(tribute)) : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.post(api('/tributes/:id/publish'), ({ params }) => {
    const tribute = db.publishTribute(params.id as string)
    return tribute ? ok(tribute) : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.post(api('/tributes/:id/checkout'), ({ params }) => {
    const id = params.id as string
    const response: CheckoutResponse = {
      order_id: `order-${id}`,
      kind: 'tribute',
      tribute_id: id,
      status: 'pending',
      price_cents: 499,
      payment_method: 'pix',
      checkout_url: null,
      pix: {
        qr_code: '00020126MOCKPIX',
        qr_code_base64: null,
        ticket_url: `/dashboard/tributes/${id}/edit?step=publish&payment=success`,
      },
    }
    return ok(response)
  }),

  http.get(api('/tributes/:id/stats'), ({ params }) => {
    const tribute = db.getTribute(params.id as string)
    if (!tribute) return fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
    const photos = tribute.media.filter((item) => item.media_type === 'photo')
    const stats: TributeStats = {
      status: tribute.status,
      views_count: tribute.views_count,
      unique_visitors: tribute.views_count,
      shares_count: 0,
      daily_views: Array.from({ length: 90 }, (_, index) => {
        const date = new Date()
        date.setDate(date.getDate() - (89 - index))
        return { date: date.toISOString().slice(0, 10), views: index === 89 ? tribute.views_count : 0 }
      }),
      first_viewed_at: tribute.published_at,
      last_viewed_at: tribute.published_at ? new Date().toISOString() : null,
      photos_count: photos.length,
      has_video: tribute.media.some((item) => item.media_type === 'video'),
      has_music: tribute.music_source !== 'none',
      published_at: tribute.published_at,
    }
    return ok(stats)
  }),

  http.post(api('/tributes/:id/media/presign'), async ({ request }) => {
    const body = (await request.json()) as { media_type: string }
    const mediaId = `media-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
    pendingMedia.set(mediaId, body.media_type)
    const response: PresignResponse = {
      media_id: mediaId,
      storage_file_id: `sf-${mediaId}`,
      upload_url: '/files/upload',
      upload_ticket: `ticket-${mediaId}`,
      expires_at: new Date(Date.now() + 900_000).toISOString(),
    }
    return ok(response)
  }),

  http.post(api('/tributes/:id/media/:mediaId/confirm'), ({ params }) => {
    const tributeId = params.id as string
    const mediaId = params.mediaId as string
    const mediaType = pendingMedia.get(mediaId) ?? 'photo'
    pendingMedia.delete(mediaId)
    const media =
      mediaType === 'audio' ? db.addAudio(tributeId, mediaId) : db.addPhoto(tributeId, mediaId)
    return media ? ok(media) : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.delete(api('/tributes/:id/media/:mediaId'), ({ params }) => {
    db.deleteMedia(params.id as string, params.mediaId as string)
    return ok(null, 'Mídia removida.')
  }),

  http.patch(api('/tributes/:id/media/reorder'), async ({ params, request }) => {
    const body = (await request.json()) as { order: string[] }
    db.reorderMedia(params.id as string, body.order)
    return ok(null, 'Ordem atualizada.')
  }),

  http.get(api('/public/tributes/:slug'), ({ params }) => {
    const tribute = db.getTributeBySlug(params.slug as string)
    return tribute ? ok(toPublic(tribute)) : fail('NOT_FOUND', 'Homenagem não encontrada.', 404)
  }),

  http.post(api('/public/tributes/:slug/view'), ({ params }) => {
    db.incrementViews(params.slug as string)
    return ok(null, 'View registrada.')
  }),

  http.get(api('/billing/subscription'), () => {
    const info: SubscriptionInfo = { billing_enabled: false, has_subscription: false }
    return ok(info)
  }),
]
