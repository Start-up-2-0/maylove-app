import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

const TOKEN_STORAGE_KEY = 'maylove_access_token'

export const worker = setupWorker(...handlers)

/**
 * Inicia o MSW e semeia um token para o auth guard cair direto no dashboard.
 * O GET /auth/me mockado devolve o usuario fake, entao isAuthenticated fica true.
 */
export async function startMocks(): Promise<void> {
  if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-access-token')
  }

  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })

  // eslint-disable-next-line no-console
  console.info('[maylove] MSW ativo — usando dados mockados (VITE_USE_MOCKS=true).')
}
