import type { useTributeWizard } from '@/composables/useTributeWizard'
import {
  isRomanceTypeId,
  type RomanceTypeId,
} from '@/modules/romance-wizard/romanceWizardSteps'

export const ROMANCE_DEFAULT_TITLES: Record<RomanceTypeId, string> = {
  'declaracao-amor': 'Para você, com todo meu amor',
  'pedido-namoro': 'Quer namorar comigo?',
  'pedido-casamento': 'Você aceita casar comigo?',
  aniversario: 'Feliz aniversário, meu amor',
  'datas-especiais': 'Nossa data, para sempre',
}

const LEGACY_GENERIC_TITLES = [
  'uma homenagem especial',
  'homenagem especial',
  'sem título',
]

export function isLegacyGenericTitle(title?: string | null): boolean {
  const normalized = title?.trim().toLowerCase() ?? ''
  if (!normalized) return true
  return LEGACY_GENERIC_TITLES.some((item) => normalized === item || normalized.includes('homenagem'))
}

export function defaultRomanceTitle(typeId?: string | null): string {
  if (isRomanceTypeId(typeId)) return ROMANCE_DEFAULT_TITLES[typeId]
  return 'Nosso romance em cada detalhe'
}

export function applyRomanceTitleDefaults(
  form: ReturnType<typeof useTributeWizard>['form'],
): void {
  if (isLegacyGenericTitle(form.title)) {
    form.title = defaultRomanceTitle(form.wizard_type_id)
  }
}

export function romanceDisplayTitle(form: ReturnType<typeof useTributeWizard>['form']): string {
  if (form.honoree_name?.trim()) {
    const name = form.honoree_name.trim()
    if (form.sender_name?.trim()) {
      return `${form.sender_name.trim()} → ${name}`
    }
    return `Para ${name}`
  }
  if (form.title?.trim() && !isLegacyGenericTitle(form.title)) {
    return form.title.trim()
  }
  return defaultRomanceTitle(form.wizard_type_id)
}
