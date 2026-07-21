import { apiClient, unwrap } from './client'
import type {
  ApiEnvelope,
  CheckoutResponse,
  DigitalBouquetDetail,
  DigitalBouquetSummary,
  DigitalBouquetValidation,
  PublicDigitalBouquet,
} from './types'

export async function listBouquets(status?: string): Promise<DigitalBouquetSummary[]> {
  const response = await apiClient.get<ApiEnvelope<DigitalBouquetSummary[]>>('/bouquets', {
    params: status ? { status } : undefined,
  })
  return unwrap(response)
}

export async function createBouquet(payload?: { title?: string }): Promise<DigitalBouquetDetail> {
  const response = await apiClient.post<ApiEnvelope<DigitalBouquetDetail>>('/bouquets', payload ?? {})
  return unwrap(response)
}

export async function fetchBouquet(id: string): Promise<DigitalBouquetDetail> {
  const response = await apiClient.get<ApiEnvelope<DigitalBouquetDetail>>(`/bouquets/${id}`)
  return unwrap(response)
}

export async function updateBouquet(id: string, payload: Record<string, unknown>): Promise<DigitalBouquetDetail> {
  const response = await apiClient.patch<ApiEnvelope<DigitalBouquetDetail>>(`/bouquets/${id}`, payload)
  return unwrap(response)
}

export async function deleteBouquet(id: string): Promise<void> {
  await apiClient.delete(`/bouquets/${id}`)
}

export async function validateBouquet(id: string): Promise<DigitalBouquetValidation> {
  const response = await apiClient.get<ApiEnvelope<DigitalBouquetValidation>>(`/bouquets/${id}/validate`)
  return unwrap(response)
}

export async function publishBouquet(id: string): Promise<{ status: string; public_url: string }> {
  const response = await apiClient.post<ApiEnvelope<{ status: string; public_url: string }>>(`/bouquets/${id}/publish`)
  return unwrap(response)
}

export async function checkoutBouquet(id: string): Promise<CheckoutResponse> {
  const response = await apiClient.post<ApiEnvelope<CheckoutResponse>>(`/bouquets/${id}/checkout`)
  return unwrap(response)
}

export async function fetchPublicBouquet(slug: string): Promise<PublicDigitalBouquet> {
  const response = await apiClient.get<ApiEnvelope<PublicDigitalBouquet>>(`/public/bouquets/${slug}`)
  return unwrap(response)
}

export async function recordBouquetView(slug: string, sessionId: string): Promise<void> {
  await apiClient.post(`/public/bouquets/${slug}/view`, { session_id: sessionId })
}
