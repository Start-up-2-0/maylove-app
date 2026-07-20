import { apiClient, unwrap } from './client'
import type {
  ApiEnvelope,
  CheckoutResponse,
  CoupleMapDetail,
  CoupleMapSummary,
  CoupleMapValidation,
  MapPlace,
  MapUploadPolicy,
  PresignResponse,
  PublicCoupleMap,
} from './types'

export async function fetchMapUploadPolicy(): Promise<MapUploadPolicy> {
  const response = await apiClient.get<ApiEnvelope<MapUploadPolicy>>('/maps/upload-policy')
  return unwrap(response)
}

export async function listMaps(status?: string): Promise<CoupleMapSummary[]> {
  const response = await apiClient.get<ApiEnvelope<CoupleMapSummary[]>>('/maps', {
    params: status ? { status } : undefined,
  })
  return unwrap(response)
}

export async function createMap(payload?: {
  title?: string
  couple_names?: string
  subtitle?: string
  map_style?: string
  show_route?: boolean
}): Promise<CoupleMapDetail> {
  const response = await apiClient.post<ApiEnvelope<CoupleMapDetail>>('/maps', payload ?? {})
  return unwrap(response)
}

export async function fetchMap(id: string): Promise<CoupleMapDetail> {
  const response = await apiClient.get<ApiEnvelope<CoupleMapDetail>>(`/maps/${id}`)
  return unwrap(response)
}

export async function updateMap(id: string, payload: Record<string, unknown>): Promise<CoupleMapDetail> {
  const response = await apiClient.patch<ApiEnvelope<CoupleMapDetail>>(`/maps/${id}`, payload)
  return unwrap(response)
}

export async function deleteMap(id: string): Promise<void> {
  await apiClient.delete(`/maps/${id}`)
}

export async function validateMap(id: string): Promise<CoupleMapValidation> {
  const response = await apiClient.get<ApiEnvelope<CoupleMapValidation>>(`/maps/${id}/validate`)
  return unwrap(response)
}

export async function publishMap(id: string): Promise<{ status: string; public_url: string }> {
  const response = await apiClient.post<ApiEnvelope<{ status: string; public_url: string }>>(`/maps/${id}/publish`)
  return unwrap(response)
}

export async function checkoutMap(id: string): Promise<CheckoutResponse> {
  const response = await apiClient.post<ApiEnvelope<CheckoutResponse>>(`/maps/${id}/checkout`)
  return unwrap(response)
}

export async function createMapPlace(mapId: string, payload: Record<string, unknown>): Promise<MapPlace> {
  const response = await apiClient.post<ApiEnvelope<MapPlace>>(`/maps/${mapId}/places`, payload)
  return unwrap(response)
}

export async function updateMapPlace(
  mapId: string,
  placeId: string,
  payload: Record<string, unknown>,
): Promise<MapPlace> {
  const response = await apiClient.patch<ApiEnvelope<MapPlace>>(`/maps/${mapId}/places/${placeId}`, payload)
  return unwrap(response)
}

export async function deleteMapPlace(mapId: string, placeId: string): Promise<void> {
  await apiClient.delete(`/maps/${mapId}/places/${placeId}`)
}

export async function reorderMapPlaces(mapId: string, order: string[]): Promise<void> {
  await apiClient.post(`/maps/${mapId}/places/reorder`, { order })
}

export async function presignMapMedia(
  mapId: string,
  payload: {
    media_type: 'photo' | 'video'
    filename: string
    mime_type: string
    size_bytes: number
    place_id: string
  },
): Promise<PresignResponse> {
  const response = await apiClient.post<ApiEnvelope<PresignResponse>>(`/maps/${mapId}/media/presign`, payload)
  return unwrap(response)
}

export async function confirmMapMedia(mapId: string, mediaId: string) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(`/maps/${mapId}/media/${mediaId}/confirm`)
  return unwrap(response)
}

export async function deleteMapMedia(mapId: string, mediaId: string): Promise<void> {
  await apiClient.delete(`/maps/${mapId}/media/${mediaId}`)
}

export async function fetchPublicMap(slug: string): Promise<PublicCoupleMap> {
  const response = await apiClient.get<ApiEnvelope<PublicCoupleMap>>(`/public/maps/${slug}`)
  return unwrap(response)
}

export async function recordPublicMapView(slug: string, sessionId: string): Promise<void> {
  await apiClient.post(`/public/maps/${slug}/view`, { session_id: sessionId })
}
