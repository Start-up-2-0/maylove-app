import { apiClient, unwrap } from './client'
import type {
  ApiEnvelope,
  CheckoutResponse,
  MusicMediaStatus,
  PresignResponse,
  PublicTribute,
  SubscriptionInfo,
  TributeDetail,
  TributeMedia,
  TributeStats,
  TributeSummary,
  TributeValidation,
} from './types'

export async function listTributes(status?: string): Promise<TributeSummary[]> {
  const response = await apiClient.get<ApiEnvelope<TributeSummary[]>>('/tributes', {
    params: status ? { status } : undefined,
  })
  return unwrap(response)
}

export async function createTribute(
  tributeTypeId: string,
  templateId: string,
): Promise<TributeDetail> {
  const response = await apiClient.post<ApiEnvelope<TributeDetail>>('/tributes', {
    tribute_type_id: tributeTypeId,
    template_id: templateId,
  })
  return unwrap(response)
}

export async function fetchTribute(id: string): Promise<TributeDetail> {
  const response = await apiClient.get<ApiEnvelope<TributeDetail>>(`/tributes/${id}`)
  return unwrap(response)
}

export async function updateTribute(
  id: string,
  payload: Record<string, unknown>,
): Promise<TributeDetail> {
  const response = await apiClient.patch<ApiEnvelope<TributeDetail>>(`/tributes/${id}`, payload)
  return unwrap(response)
}

export async function deleteTribute(id: string): Promise<void> {
  await apiClient.delete(`/tributes/${id}`)
}

export async function fetchPreviewData(id: string): Promise<TributeDetail> {
  const response = await apiClient.get<ApiEnvelope<TributeDetail>>(`/tributes/${id}/preview-data`)
  return unwrap(response)
}

export async function validateTribute(id: string): Promise<TributeValidation> {
  const response = await apiClient.get<ApiEnvelope<TributeValidation>>(`/tributes/${id}/validate`)
  return unwrap(response)
}

export async function publishTribute(id: string): Promise<TributeDetail> {
  const response = await apiClient.post<ApiEnvelope<TributeDetail>>(`/tributes/${id}/publish`)
  return unwrap(response)
}

export async function checkoutTribute(id: string): Promise<CheckoutResponse> {
  const response = await apiClient.post<ApiEnvelope<CheckoutResponse>>(`/tributes/${id}/checkout`)
  return unwrap(response)
}

export async function fetchTributeStats(id: string): Promise<TributeStats> {
  const response = await apiClient.get<ApiEnvelope<TributeStats>>(`/tributes/${id}/stats`)
  return unwrap(response)
}

export async function presignMedia(
  tributeId: string,
  payload: {
    media_type: string
    filename: string
    mime_type: string
    size_bytes: number
  },
): Promise<PresignResponse> {
  const response = await apiClient.post<ApiEnvelope<PresignResponse>>(
    `/tributes/${tributeId}/media/presign`,
    payload,
  )
  return unwrap(response)
}

export async function confirmMedia(tributeId: string, mediaId: string): Promise<TributeMedia> {
  const response = await apiClient.post<ApiEnvelope<TributeMedia>>(
    `/tributes/${tributeId}/media/${mediaId}/confirm`,
  )
  return unwrap(response)
}

export async function deleteMedia(tributeId: string, mediaId: string): Promise<void> {
  await apiClient.delete(`/tributes/${tributeId}/media/${mediaId}`)
}

export async function reorderMedia(tributeId: string, order: string[]): Promise<void> {
  await apiClient.patch(`/tributes/${tributeId}/media/reorder`, { order })
}

export async function fetchMusicStatus(
  tributeId: string,
  mediaId?: string,
): Promise<MusicMediaStatus> {
  const path = mediaId
    ? `/tributes/${tributeId}/media/${mediaId}/status`
    : `/tributes/${tributeId}/music/status`
  const response = await apiClient.get<ApiEnvelope<MusicMediaStatus>>(path)
  return unwrap(response)
}

export async function importMusicFromYoutube(
  tributeId: string,
  url: string,
): Promise<MusicMediaStatus> {
  const response = await apiClient.post<ApiEnvelope<MusicMediaStatus>>(
    `/tributes/${tributeId}/music/import`,
    { source: 'youtube', url },
  )
  return unwrap(response)
}

export async function fetchPublicTribute(slug: string): Promise<PublicTribute> {
  const response = await apiClient.get<ApiEnvelope<PublicTribute>>(`/public/tributes/${slug}`)
  return unwrap(response)
}

export async function recordPublicView(slug: string, sessionId: string): Promise<void> {
  await apiClient.post(`/public/tributes/${slug}/view`, { session_id: sessionId })
}

export async function recordPublicShare(slug: string, sessionId: string): Promise<void> {
  await apiClient.post(`/public/tributes/${slug}/share`, { session_id: sessionId })
}

export async function fetchSubscription(): Promise<SubscriptionInfo> {
  const response = await apiClient.get<ApiEnvelope<SubscriptionInfo>>('/billing/subscription')
  return unwrap(response)
}
