import type { AxiosResponse } from 'axios'
import { AUTH_TOKEN_HEADER, type ApiEnvelope, type AuthPayload } from './types'

type AuthResponseBody = Omit<AuthPayload, 'token'> & {
  token?: string
  user?: User
}

type User = AuthPayload['user']

/** Access token vem no header x-maylove-token (não no JSON) por segurança. */
export function readAccessTokenFromResponse(response: AxiosResponse): string | null {
  const headers = response.headers
  const raw =
    headers[AUTH_TOKEN_HEADER] ??
    headers[AUTH_TOKEN_HEADER.toLowerCase()] ??
    headers['x-maylove-token']

  if (!raw) return null
  return Array.isArray(raw) ? raw[0] : String(raw)
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
