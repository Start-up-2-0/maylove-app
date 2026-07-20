import type { InternalAxiosRequestConfig } from 'axios'

export type AuthRetryConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean
}

export function markAuthRetried(config: AuthRetryConfig): AuthRetryConfig {
  config._authRetry = true
  return config
}

export function hasAuthRetried(config?: AuthRetryConfig): boolean {
  return Boolean(config?._authRetry)
}

export function setAccessTokenHeader(
  config: InternalAxiosRequestConfig,
  headerName: string,
  token: string,
): void {
  if (typeof config.headers.set === 'function') {
    config.headers.set(headerName, token)
  } else {
    config.headers[headerName] = token
  }
}
