import { http } from 'msw'
import type { MusicMediaStatus, PresignResponse } from '@/api/types'
import { albumDb } from '../albumDb'
import { api, fail, ok } from './helpers'

const pendingMedia = new Map<string, { type: 'photo' | 'audio'; filename: string }>()

export const albumHandlers = [
  http.get(api('/albums'), ({ request }) => ok(albumDb.list(new URL(request.url).searchParams.get('status') ?? undefined))),
  http.post(api('/albums'), async ({ request }) => ok(albumDb.create((await request.json()) as Record<string, unknown>))),
  http.get(api('/albums/upload-policy'), () => ok({ photo: { accepted_mimes: ['image/jpeg', 'image/png', 'image/webp'], accepted_extensions: ['jpg', 'jpeg', 'png', 'webp'], max_file_bytes: 15 * 1024 * 1024, max_long_edge_px: 2560, max_count_per_album: 40 }, audio: { accepted_mimes: ['audio/mpeg', 'audio/mp3'], accepted_extensions: ['mp3'], max_file_bytes: 10 * 1024 * 1024, max_count_per_album: 1 } })),
  http.get(api('/albums/:id'), ({ params }) => { const album = albumDb.get(params.id as string); return album ? ok(album) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),
  http.patch(api('/albums/:id'), async ({ params, request }) => { const album = albumDb.update(params.id as string, (await request.json()) as Record<string, unknown>); return album ? ok(album) : fail('ALBUM_NOT_EDITABLE', 'Álbum não encontrado ou não editável.', 403) }),
  http.delete(api('/albums/:id'), ({ params }) => albumDb.remove(params.id as string) ? ok(null, 'Álbum excluído.') : fail('NOT_FOUND', 'Álbum não encontrado.', 404)),
  http.post(api('/albums/:id/validate'), ({ params }) => { const validation = albumDb.validate(params.id as string); return validation ? ok(validation) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),
  http.post(api('/albums/:id/publish'), ({ params }) => { const album = albumDb.publish(params.id as string); return album ? ok(album) : fail('VALIDATION_ERROR', 'O álbum ainda possui pendências.', 422) }),

  http.get(api('/albums/:id/chapters'), ({ params }) => { const chapters = albumDb.chapters(params.id as string); return chapters ? ok(chapters) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),
  http.post(api('/albums/:id/chapters'), async ({ params, request }) => { const chapter = albumDb.createChapter(params.id as string, (await request.json()) as { title: string; sort_order?: number }); return chapter ? ok(chapter) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),
  http.patch(api('/albums/:id/chapters/:chapterId'), async ({ params, request }) => { const chapter = albumDb.updateChapter(params.id as string, params.chapterId as string, (await request.json()) as { title?: string; sort_order?: number }); return chapter ? ok(chapter) : fail('NOT_FOUND', 'Capítulo não encontrado.', 404) }),
  http.delete(api('/albums/:id/chapters/:chapterId'), ({ params }) => albumDb.removeChapter(params.id as string, params.chapterId as string) ? ok(null) : fail('NOT_FOUND', 'Capítulo não encontrado.', 404)),

  http.get(api('/albums/:id/chapters/:chapterId/memories'), ({ params }) => { const memories = albumDb.memories(params.id as string, params.chapterId as string); return memories ? ok(memories) : fail('NOT_FOUND', 'Capítulo não encontrado.', 404) }),
  http.post(api('/albums/:id/chapters/:chapterId/memories'), async ({ params, request }) => { const memory = albumDb.createMemory(params.id as string, params.chapterId as string, (await request.json()) as Record<string, unknown>); return memory ? ok(memory) : fail('NOT_FOUND', 'Capítulo não encontrado.', 404) }),
  http.patch(api('/albums/:id/chapters/:chapterId/memories/:memoryId'), async ({ params, request }) => { const memory = albumDb.updateMemory(params.id as string, params.chapterId as string, params.memoryId as string, (await request.json()) as Record<string, unknown>); return memory ? ok(memory) : fail('NOT_FOUND', 'Memória não encontrada.', 404) }),
  http.delete(api('/albums/:id/chapters/:chapterId/memories/:memoryId'), ({ params }) => albumDb.removeMemory(params.id as string, params.chapterId as string, params.memoryId as string) ? ok(null) : fail('NOT_FOUND', 'Memória não encontrada.', 404)),

  http.post(api('/albums/:id/media/presign'), async ({ request }) => {
    const body = (await request.json()) as { media_type: 'photo' | 'audio'; filename: string }
    const mediaId = `album-media-${crypto.randomUUID()}`
    pendingMedia.set(mediaId, { type: body.media_type, filename: body.filename })
    const response: PresignResponse = { media_id: mediaId, storage_file_id: `storage-${mediaId}`, upload_url: '/files/upload', upload_ticket: `ticket-${mediaId}`, expires_at: new Date(Date.now() + 900_000).toISOString() }
    return ok(response)
  }),
  http.post(api('/albums/:id/media/:mediaId/confirm'), ({ params }) => { const pending = pendingMedia.get(params.mediaId as string) ?? { type: 'photo' as const, filename: 'foto.jpg' }; pendingMedia.delete(params.mediaId as string); const media = albumDb.addMedia(params.id as string, params.mediaId as string, pending.type, pending.filename); return media ? ok(media) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),
  http.patch(api('/albums/:id/media/:mediaId'), async ({ params, request }) => { const media = albumDb.updateMedia(params.id as string, params.mediaId as string, (await request.json()) as Record<string, string | null>); return media ? ok(media) : fail('NOT_FOUND', 'Foto não encontrada.', 404) }),
  http.post(api('/albums/:id/media/:mediaId/replace'), async ({ params, request }) => { const body = (await request.json()) as { replacement_media_id: string }; const media = albumDb.replaceMedia(params.id as string, params.mediaId as string, body.replacement_media_id); return media ? ok(media) : fail('NOT_FOUND', 'Foto não encontrada.', 404) }),
  http.delete(api('/albums/:id/media/:mediaId'), ({ params }) => albumDb.removeMedia(params.id as string, params.mediaId as string) ? ok(null) : fail('NOT_FOUND', 'Mídia não encontrada.', 404)),
  http.patch(api('/albums/:id/media/reorder'), async ({ params, request }) => { const body = (await request.json()) as { order: string[] }; return albumDb.reorderMedia(params.id as string, body.order) ? ok(null) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),

  http.get(api('/albums/:id/experiences'), ({ params }) => { const album = albumDb.get(params.id as string); return album ? ok(album.experiences) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),
  http.get(api('/albums/:id/music/status'), ({ params }) => { const album = albumDb.get(params.id as string); if (!album) return fail('NOT_FOUND', 'Álbum não encontrado.', 404); const audio = album.media.find((item) => item.media_type === 'audio'); const status: MusicMediaStatus = { processing_status: audio ? 'ready' : 'failed', processing_error: null, media_id: audio?.id ?? '', url: audio?.url ?? null, duration_seconds: audio ? 180 : null }; return ok(status) }),
  http.post(api('/albums/:id/music/import'), async ({ params }) => { const mediaId = `album-audio-${crypto.randomUUID()}`; const audio = albumDb.addMedia(params.id as string, mediaId, 'audio', 'trilha-youtube.mp3'); if (!audio) return fail('NOT_FOUND', 'Álbum não encontrado.', 404); const status: MusicMediaStatus = { processing_status: 'ready', processing_error: null, media_id: audio.id, url: audio.url ?? null, duration_seconds: 180 }; return ok(status) }),
  http.get(api('/albums/:id/qr'), ({ params, request }) => { const album = albumDb.get(params.id as string); if (!album) return fail('NOT_FOUND', 'Álbum não encontrado.', 404); const memoryId = new URL(request.url).searchParams.get('m'); const publicUrl = `${location.origin}/a/${album.slug}`; return ok({ slug: album.slug, public_url: publicUrl, deep_link: memoryId ? `${publicUrl}?m=${memoryId}` : publicUrl, url: publicUrl, memory_id: memoryId }) }),

  http.get(api('/public/albums/:slug'), ({ params }) => { const album = albumDb.publicBySlug(params.slug as string); return album ? ok(album) : fail('NOT_FOUND', 'Álbum não encontrado.', 404) }),
  http.post(api('/public/albums/:slug/view'), ({ params }) => { albumDb.incrementViews(params.slug as string); return ok(null) }),
  http.get(api('/public/albums/:slug/tributes'), () => ok([])),
  http.post(api('/public/albums/:slug/tributes'), async ({ request }) => { const body = (await request.json()) as { type: 'candle' | 'flower' | 'message'; author_name: string; message: string }; return ok({ id: `tribute-${crypto.randomUUID()}`, type: body.type, author_name: body.author_name, message: body.message, created_at: new Date().toISOString() }) }),
]
