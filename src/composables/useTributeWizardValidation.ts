import type { WizardStep } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { TRIBUTE_WIZARD_STEPS } from '@/modules/tribute-wizard/tributeWizardSteps'

export interface StepValidationResult {
  valid: boolean
  message?: string
}

export function validateWizardStep(
  step: WizardStep,
  form: ReturnType<typeof useTributeWizard>['form'],
  photosCount = 0,
): StepValidationResult {
  switch (step) {
    case 'type':
      if (!form.wizard_type_id && !form.wizard_category_slug) {
        return { valid: false, message: 'Selecione o tipo de homenagem para continuar.' }
      }
      return { valid: true }

    case 'basics':
      if (!form.honoree_name?.trim()) {
        return { valid: false, message: 'Informe o nome da pessoa homenageada.' }
      }
      if (!form.template_id) {
        return { valid: false, message: 'Escolha um modelo visual.' }
      }
      if (!form.message?.trim() && !form.title?.trim()) {
        return { valid: false, message: 'Escreva um título ou uma mensagem inicial.' }
      }
      if (photosCount < 1) {
        return { valid: false, message: 'Adicione pelo menos uma foto de capa.' }
      }
      return { valid: true }

    case 'special-date':
      if (form.special_date_config.enabled) {
        if (!form.special_date_config.date?.trim()) {
          return { valid: false, message: 'Informe a data especial ou desative a seção.' }
        }
        if (!form.special_date_config.title?.trim()) {
          return { valid: false, message: 'Dê um título à data especial.' }
        }
      }
      return { valid: true }

    case 'story':
    case 'personalization':
    case 'modules':
    case 'review':
    case 'publish':
      return { valid: true }

    default:
      return { valid: true }
  }
}

export function nextWizardStep(current: WizardStep): WizardStep | null {
  const index = TRIBUTE_WIZARD_STEPS.indexOf(current)
  if (index < 0 || index >= TRIBUTE_WIZARD_STEPS.length - 1) return null
  return TRIBUTE_WIZARD_STEPS[index + 1]
}

export function previousWizardStep(current: WizardStep): WizardStep | null {
  const index = TRIBUTE_WIZARD_STEPS.indexOf(current)
  if (index <= 0) return null
  return TRIBUTE_WIZARD_STEPS[index - 1]
}
