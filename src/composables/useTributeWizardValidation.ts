import type { WizardStep } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import {
  collectPresentationSchemaIssuesFromForm,
  firstIssueMessage,
  issuesForWizardStep,
} from '@/modules/tribute-wizard/presentationValidation'
import { TRIBUTE_WIZARD_STEPS } from '@/modules/tribute-wizard/tributeWizardSteps'
import { getWizardSteps } from '@/modules/tribute-wizard/tributeTypeFlow'
import type { TemplateDefinition } from '@/templates/types'

export interface StepValidationResult {
  valid: boolean
  message?: string
}

export function validateWizardStep(
  step: WizardStep,
  form: ReturnType<typeof useTributeWizard>['form'],
  photosCount = 0,
  definition?: TemplateDefinition | null,
): StepValidationResult {
  const schemaIssues = collectPresentationSchemaIssuesFromForm(form, definition, photosCount)

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

    case 'texts': {
      const issues = issuesForWizardStep('texts', schemaIssues)
      if (issues.length) {
        return { valid: false, message: firstIssueMessage(issues) }
      }
      return { valid: true }
    }

    case 'story': {
      const issues = issuesForWizardStep('story', schemaIssues)
      if (issues.length) {
        return { valid: false, message: firstIssueMessage(issues) }
      }
      return { valid: true }
    }

    case 'personalization':
    case 'modules':
    case 'review':
    case 'publish':
      return { valid: true }

    default:
      return { valid: true }
  }
}

export function nextWizardStep(
  current: WizardStep,
  wizardTypeId?: string | null,
): WizardStep | null {
  const steps = getWizardSteps(wizardTypeId)
  const fullIndex = TRIBUTE_WIZARD_STEPS.indexOf(current)
  for (let i = fullIndex + 1; i < TRIBUTE_WIZARD_STEPS.length; i++) {
    const candidate = TRIBUTE_WIZARD_STEPS[i]
    if (steps.includes(candidate)) return candidate
  }
  return null
}

export function previousWizardStep(
  current: WizardStep,
  wizardTypeId?: string | null,
): WizardStep | null {
  const steps = getWizardSteps(wizardTypeId)
  const fullIndex = TRIBUTE_WIZARD_STEPS.indexOf(current)
  for (let i = fullIndex - 1; i >= 0; i--) {
    const candidate = TRIBUTE_WIZARD_STEPS[i]
    if (steps.includes(candidate)) return candidate
  }
  return null
}
