import { apiClient, unwrap } from './client'
import type { ApiEnvelope, AuthPayload, User } from './types'

export async function register(payload: {
  name: string
  email: string
  password: string
  accept_terms: boolean
}): Promise<{ message: string; email_verified: boolean }> {
  const response = await apiClient.post<ApiEnvelope<{
    id: string
    email: string
    email_verified: boolean
    status: string
  }>>('/auth/register', payload)

  return {
    message: response.data.message,
    email_verified: response.data.data.email_verified,
  }
}

export async function login(payload: {
  email: string
  password: string
}): Promise<AuthPayload> {
  const response = await apiClient.post<ApiEnvelope<AuthPayload>>('/auth/login', payload)
  return unwrap(response)
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function fetchMe(): Promise<User> {
  const response = await apiClient.get<ApiEnvelope<User>>('/auth/me')
  return unwrap(response)
}

export async function verifyEmail(token: string): Promise<AuthPayload> {
  const response = await apiClient.get<ApiEnvelope<AuthPayload>>('/auth/verify-email', {
    params: { token },
  })
  return unwrap(response)
}
