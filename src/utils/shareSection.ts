import type { TributeModulesConfig } from '@/api/types'

export function shouldShowShareSection(
  mode: 'full' | 'preview',
  shareUrl?: string | null,
): boolean {
  return mode === 'full' && Boolean(shareUrl?.trim())
}

export function shouldShowShareQr(
  modules: Pick<TributeModulesConfig, 'qr_code'>,
  mode: 'full' | 'preview',
  shareUrl?: string | null,
): boolean {
  return shouldShowShareSection(mode, shareUrl) && modules.qr_code !== false
}
