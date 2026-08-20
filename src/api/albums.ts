import { apiClient, unwrap } from './client'
import type {
  AlbumCategory,
  AlbumChapter,
  AlbumDetail,
  AlbumExperience,
  AlbumMemory,
  AlbumMemoryPayload,
  AlbumQr,
  AlbumVisitorTribute,
  AlbumVisitorTributeType,
  AlbumSummary,
  AlbumTimeline,
  AlbumUploadPolicy,
  AlbumValidation,
  ApiEnvelope,
  CheckoutResponse,
  ExperienceType,
  MusicMediaStatus,
  PresignResponse,
  PublicAlbum,
  AlbumMedia,
  AlbumMediaType,
} from './types'
import {
  buildAlbumMemoryApiPayload,
  normalizeAlbumMemory,
} from './albumMemory'

export async function loadAlbumChaptersWithMemories(albumId: string): Promise<AlbumChapter[]> {
  const chapters = await listAlbumChapters(albumId)
  const withMemories = await Promise.all(
    chapters.map(async (chapter) => ({
      ...chapter,
      memories: await listAlbumMemories(albumId, chapter.id),
    })),
  )
  return withMemories.sort((a, b) => a.sort_order - b.sort_order)
}

export async function fetchAlbumUploadPolicy(): Promise<AlbumUploadPolicy> {
  const response = await apiClient.get<ApiEnvelope<AlbumUploadPolicy>>('/albums/upload-policy')
  return unwrap(response)
}

export async function listAlbums(status?: string): Promise<AlbumSummary[]> {
  const response = await apiClient.get<ApiEnvelope<AlbumSummary[]>>('/albums', {
    params: status ? { status } : undefined,
  })
  return unwrap(response)
}

export async function createAlbum(payload?: {
  category?: AlbumCategory
  title?: string
  honoree_names?: string
  theme?: string
}): Promise<AlbumDetail> {
  const response = await apiClient.post<ApiEnvelope<AlbumDetail>>('/albums', payload ?? {})
  return unwrap(response)
}

export async function fetchAlbum(id: string): Promise<AlbumDetail> {
  const response = await apiClient.get<ApiEnvelope<AlbumDetail>>(`/albums/${id}`)
  return unwrap(response)
}

export async function updateAlbum(
  id: string,
  payload: Record<string, unknown>,
): Promise<AlbumDetail> {
  const response = await apiClient.patch<ApiEnvelope<AlbumDetail>>(`/albums/${id}`, payload)
  return unwrap(response)
}

export async function deleteAlbum(id: string): Promise<void> {
  await apiClient.delete(`/albums/${id}`)
}

export async function validateAlbum(id: string): Promise<AlbumValidation> {
  const response = await apiClient.post<ApiEnvelope<AlbumValidation>>(`/albums/${id}/validate`)
  return unwrap(response)
}

export async function publishAlbum(id: string): Promise<AlbumDetail> {
  const response = await apiClient.post<ApiEnvelope<AlbumDetail>>(`/albums/${id}/publish`)
  return unwrap(response)
}

export async function checkoutAlbum(id: string): Promise<CheckoutResponse> {
  const response = await apiClient.post<ApiEnvelope<CheckoutResponse>>(`/albums/${id}/checkout`)
  return unwrap(response)
}

export async function presignAlbumMedia(
  albumId: string,
  payload: {
    media_type: AlbumMediaType
    filename: string
    mime_type: string
    size_bytes: number
    replacement_media_id?: string
  },
): Promise<PresignResponse> {
  const response = await apiClient.post<ApiEnvelope<PresignResponse>>(
    `/albums/${albumId}/media/presign`,
    payload,
  )
  return unwrap(response)
}

export async function confirmAlbumMedia(albumId: string, mediaId: string): Promise<AlbumMedia> {
  const response = await apiClient.post<ApiEnvelope<AlbumMedia>>(
    `/albums/${albumId}/media/${mediaId}/confirm`,
  )
  return unwrap(response)
}

export async function deleteAlbumMedia(albumId: string, mediaId: string): Promise<void> {
  await apiClient.delete(`/albums/${albumId}/media/${mediaId}`)
}

export async function updateAlbumMedia(
  albumId: string,
  mediaId: string,
  payload: Pick<AlbumMedia, 'title' | 'caption' | 'memory_date' | 'place_name'>,
): Promise<AlbumMedia> {
  const response = await apiClient.patch<ApiEnvelope<AlbumMedia>>(
    `/albums/${albumId}/media/${mediaId}`,
    payload,
  )
  return unwrap(response)
}

export async function replaceAlbumMedia(albumId: string, mediaId: string, replacementMediaId: string): Promise<AlbumMedia> {
  const response = await apiClient.post<ApiEnvelope<AlbumMedia>>(`/albums/${albumId}/media/${mediaId}/replace`, {
    replacement_media_id: replacementMediaId,
  })
  return unwrap(response)
}

export async function reorderAlbumMedia(albumId: string, order: string[]): Promise<void> {
  await apiClient.patch(`/albums/${albumId}/media/reorder`, { order })
}

export async function fetchAlbumMusicStatus(albumId: string): Promise<MusicMediaStatus> {
  const response = await apiClient.get<ApiEnvelope<MusicMediaStatus>>(
    `/albums/${albumId}/music/status`,
  )
  return unwrap(response)
}

export async function importAlbumMusicFromYoutube(
  albumId: string,
  url: string,
): Promise<MusicMediaStatus> {
  const response = await apiClient.post<ApiEnvelope<MusicMediaStatus>>(
    `/albums/${albumId}/music/import`,
    { source: 'youtube', url },
  )
  return unwrap(response)
}

export async function fetchPublicAlbum(slug: string): Promise<PublicAlbum> {
  const response = await apiClient.get<ApiEnvelope<PublicAlbum>>(`/public/albums/${slug}`)
  return unwrap(response)
}

export async function recordPublicAlbumView(slug: string, sessionId: string): Promise<void> {
  await apiClient.post(`/public/albums/${slug}/view`, { session_id: sessionId })
}

// ---- Capítulos ----

export async function listAlbumChapters(albumId: string): Promise<AlbumChapter[]> {
  const response = await apiClient.get<ApiEnvelope<AlbumChapter[]>>(`/albums/${albumId}/chapters`)
  return unwrap(response)
}

export async function createAlbumChapter(
  albumId: string,
  payload: { title: string; sort_order?: number },
): Promise<AlbumChapter> {
  const response = await apiClient.post<ApiEnvelope<AlbumChapter>>(
    `/albums/${albumId}/chapters`,
    payload,
  )
  return unwrap(response)
}

export async function updateAlbumChapter(
  albumId: string,
  chapterId: string,
  payload: { title?: string; sort_order?: number },
): Promise<AlbumChapter> {
  const response = await apiClient.patch<ApiEnvelope<AlbumChapter>>(
    `/albums/${albumId}/chapters/${chapterId}`,
    payload,
  )
  return unwrap(response)
}

export async function deleteAlbumChapter(albumId: string, chapterId: string): Promise<void> {
  await apiClient.delete(`/albums/${albumId}/chapters/${chapterId}`)
}

// ---- Memórias ----

export async function listAlbumMemories(
  albumId: string,
  chapterId: string,
): Promise<AlbumMemory[]> {
  const response = await apiClient.get<ApiEnvelope<AlbumMemory[]>>(
    `/albums/${albumId}/chapters/${chapterId}/memories`,
  )
  return unwrap(response).map((memory) =>
    normalizeAlbumMemory(memory as unknown as Record<string, unknown>),
  )
}

export async function createAlbumMemory(
  albumId: string,
  chapterId: string,
  payload: AlbumMemoryPayload,
): Promise<AlbumMemory> {
  const response = await apiClient.post<ApiEnvelope<AlbumMemory>>(
    `/albums/${albumId}/chapters/${chapterId}/memories`,
    buildAlbumMemoryApiPayload(payload),
  )
  return normalizeAlbumMemory(unwrap(response) as unknown as Record<string, unknown>)
}

export async function updateAlbumMemory(
  albumId: string,
  chapterId: string,
  memoryId: string,
  payload: Partial<AlbumMemoryPayload>,
  existingContentJson?: Record<string, unknown> | null,
): Promise<AlbumMemory> {
  const response = await apiClient.patch<ApiEnvelope<AlbumMemory>>(
    `/albums/${albumId}/chapters/${chapterId}/memories/${memoryId}`,
    buildAlbumMemoryApiPayload(payload, existingContentJson),
  )
  return normalizeAlbumMemory(unwrap(response) as unknown as Record<string, unknown>)
}

export async function deleteAlbumMemory(
  albumId: string,
  chapterId: string,
  memoryId: string,
): Promise<void> {
  await apiClient.delete(`/albums/${albumId}/chapters/${chapterId}/memories/${memoryId}`)
}

// ---- Experiências ----

export async function listAlbumExperiences(albumId: string): Promise<AlbumExperience[]> {
  const response = await apiClient.get<ApiEnvelope<AlbumExperience[]>>(
    `/albums/${albumId}/experiences`,
  )
  return unwrap(response)
}

export async function createAlbumExperience(
  albumId: string,
  payload: { type: ExperienceType; memory_id?: string; config: Record<string, unknown> },
): Promise<AlbumExperience> {
  const response = await apiClient.post<ApiEnvelope<AlbumExperience>>(
    `/albums/${albumId}/experiences`,
    payload,
  )
  return unwrap(response)
}

export async function updateAlbumExperience(
  albumId: string,
  experienceId: string,
  payload: { type?: ExperienceType; config?: Record<string, unknown> },
): Promise<AlbumExperience> {
  const response = await apiClient.patch<ApiEnvelope<AlbumExperience>>(
    `/albums/${albumId}/experiences/${experienceId}`,
    payload,
  )
  return unwrap(response)
}

export async function deleteAlbumExperience(
  albumId: string,
  experienceId: string,
): Promise<void> {
  await apiClient.delete(`/albums/${albumId}/experiences/${experienceId}`)
}

// ---- Linha do Tempo / QR ----

export async function fetchAlbumTimeline(
  albumId: string,
  range?: { from?: string; to?: string },
): Promise<AlbumTimeline> {
  const response = await apiClient.get<ApiEnvelope<AlbumTimeline>>(`/albums/${albumId}/timeline`, {
    params: range,
  })
  return unwrap(response)
}

export async function fetchAlbumQr(
  albumId: string,
  memoryId?: string,
): Promise<AlbumQr> {
  const response = await apiClient.get<ApiEnvelope<AlbumQr>>(`/albums/${albumId}/qr`, {
    params: memoryId ? { m: memoryId } : undefined,
  })
  return unwrap(response)
}

// ---- Tributos de visitantes (memorial) ----

export async function fetchPublicAlbumTributes(slug: string): Promise<AlbumVisitorTribute[]> {
  const response = await apiClient.get<ApiEnvelope<AlbumVisitorTribute[]>>(
    `/public/albums/${slug}/tributes`,
  )
  return unwrap(response)
}

export async function submitPublicAlbumTribute(
  slug: string,
  payload: { type: AlbumVisitorTributeType; author_name: string; message: string },
): Promise<AlbumVisitorTribute> {
  const response = await apiClient.post<ApiEnvelope<AlbumVisitorTribute>>(
    `/public/albums/${slug}/tributes`,
    payload,
  )
  return unwrap(response)
}
