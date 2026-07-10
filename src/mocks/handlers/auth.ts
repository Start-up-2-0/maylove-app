import { http } from 'msw'
import type { AuthPayload } from '@/api/types'
import { mockUser } from '../fixtures'
import { api, ok } from './helpers'

function futureIso(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

const authPayload: AuthPayload = {
  token: 'mock-access-token',
  expiresAt: futureIso(15),
  refreshExpiresAt: futureIso(30 * 24 * 60),
  user: mockUser,
}

export const authHandlers = [
  http.post(api('/auth/register'), () => ok(null, 'Cadastro realizado. Verifique seu e-mail.')),

  http.post(api('/auth/login'), () => ok(authPayload)),

  http.post(api('/auth/logout'), () => ok(null, 'Sessão encerrada.')),

  http.get(api('/auth/me'), () => ok(mockUser)),

  http.get(api('/auth/verify-email'), () => ok(authPayload, 'E-mail confirmado.')),

  http.post(api('/auth/refresh'), () =>
    ok({
      token: 'mock-access-token',
      refreshToken: '',
      expiresAt: futureIso(15),
      refreshExpiresAt: futureIso(30 * 24 * 60),
    }),
  ),
]
