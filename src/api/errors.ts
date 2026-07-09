import type { AxiosError } from 'axios'
import type { ApiErrorBody } from './types'

export function resolveApiError(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<ApiErrorBody>
  const data = axiosErr.response?.data

  if (data?.message) {
    return data.message
  }

  if (data?.code) {
    return data.code
  }

  return fallback
}
