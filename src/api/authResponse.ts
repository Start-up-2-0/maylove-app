import type { AxiosResponse } from 'axios'
import { AUTH_TOKEN_HEADER, type ApiEnvelope, type AuthPayload } from './types'

type AuthResponseBody = Omit<AuthPayload, 'token'> & {
  token?: string
  user?: User
}

type User = AuthPayload['user']

/** Access token vem no header x-maylove-token (não no JSON) por segurança. */
export function readAccessTokenFromResponse(response: AxiosResponse): string | null {
  const headers = response.headers as AxiosResponse['headers'] & {
    get?: (name: string) => string | undefined
  }

  const fromGetter =
    typeof headers.get === 'function'
      ? headers.get(AUTH_TOKEN_HEADER) ?? headers.get('x-maylove-token')
      : null

  const raw =
    fromGetter ??
    headers[AUTH_TOKEN_HEADER] ??
    headers[AUTH_TOKEN_HEADER.toLowerCase()] ??
    headers['x-maylove-token']

  if (!raw) return null
  const value = Array.isArray(raw) ? raw[0] : String(raw)
  return value.trim() || null
}

export function authPayloadFromResponse(
  response: AxiosResponse<ApiEnvelope<AuthResponseBody>>,
): AuthPayload {
  const token = readAccessTokenFromResponse(response) ?? response.data.data.token
  if (!token) {
    throw new Error('Token de acesso ausente na resposta de autenticação.')
  }

  return {
    ...response.data.data,
    token,
    user: response.data.data.user as User,
  }
}

export function authPayloadFromRefreshResponse(
  response: AxiosResponse<ApiEnvelope<Omit<AuthPayload, 'user' | 'token'> & { token?: string }>>,
): Pick<AuthPayload, 'token' | 'expiresAt' | 'refreshExpiresAt' | 'refreshToken'> {
  const token = readAccessTokenFromResponse(response) ?? response.data.data.token
  if (!token) {
    throw new Error('Token de acesso ausente na resposta de refresh.')
  }

  return {
    ...response.data.data,
    token,
  }
}
