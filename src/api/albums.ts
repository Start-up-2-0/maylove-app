import { apiClient, unwrap } from './client'
import type {
  AlbumDetail,
  AlbumSummary,
  AlbumUploadPolicy,
  AlbumValidation,
  ApiEnvelope,
  CheckoutResponse,
  MusicMediaStatus,
  PresignResponse,
  PublicAlbum,
  AlbumMedia,
} from './types'

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

export async function createAlbum(): Promise<AlbumDetail> {
  const response = await apiClient.post<ApiEnvelope<AlbumDetail>>('/albums')
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
    media_type: 'photo' | 'audio'
    filename: string
    mime_type: string
    size_bytes: number
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
