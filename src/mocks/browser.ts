import { setupWorker } from 'msw/browser'
import { persistAuthSession } from '@/utils/authSession'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/**
 * Inicia o MSW e semeia um token para o auth guard cair direto no dashboard.
 * O GET /auth/me mockado devolve o usuario fake, entao isAuthenticated fica true.
 */
export async function startMocks(): Promise<void> {
  const { readStoredSession } = await import('@/utils/authSession')
  if (!readStoredSession().token) {
    persistAuthSession({
      token: 'mock-access-token',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })

  // eslint-disable-next-line no-console
  console.info('[maylove] MSW ativo — usando dados mockados (VITE_USE_MOCKS=true).')
}
