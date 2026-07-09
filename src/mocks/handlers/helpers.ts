import { HttpResponse } from 'msw'
import { API_BASE_URL, STORAGE_UPLOAD_URL, type ApiEnvelope } from '@/api/types'

export const api = (path: string): string => `${API_BASE_URL}${path}`
export const storage = (path: string): string => `${STORAGE_UPLOAD_URL}${path}`

export function ok<T>(data: T, message = 'ok') {
  const body: ApiEnvelope<T> = { success: true, message, data }
  return HttpResponse.json(body)
}

export function fail(error: string, message: string, status = 400) {
  return HttpResponse.json({ error, message }, { status })
}
