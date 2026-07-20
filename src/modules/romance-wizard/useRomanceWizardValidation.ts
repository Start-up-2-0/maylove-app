import type { useTributeWizard } from '@/composables/useTributeWizard'
import {
  collectPresentationSchemaIssuesFromForm,
  firstIssueMessage,
} from '@/modules/tribute-wizard/presentationValidation'
import type { TemplateDefinition } from '@/templates/types'
import { timelineItemHasContent } from '@/utils/timeline'
import type { RomanceStep } from './romanceWizardSteps'
import { isRomanceTypeId } from './romanceWizardSteps'

export interface RomanceStepValidationResult {
  valid: boolean
  message?: string
}

export function validateRomanceStep(
  step: RomanceStep,
  form: ReturnType<typeof useTributeWizard>['form'],
  photosCount = 0,
  definition?: TemplateDefinition | null,
): RomanceStepValidationResult {
  switch (step) {
    case 'occasion':
      if (!isRomanceTypeId(form.wizard_type_id)) {
        return { valid: false, message: 'Escolha a ocasião do romance para continuar.' }
      }
      return { valid: true }

    case 'couple':
      if (!form.honoree_name?.trim()) {
        return { valid: false, message: 'Informe o nome de quem receberá este presente.' }
      }
      if (photosCount < 1) {
        return { valid: false, message: 'Adicione pelo menos uma foto de vocês.' }
      }
      return { valid: true }

    case 'story': {
      const hasMessage = Boolean(form.message?.replace(/<[^>]*>/g, '').trim())
      const hasMoments = form.timeline.some((item) => timelineItemHasContent(item))
      if (!hasMessage && !hasMoments) {
        return {
          valid: false,
          message: 'Escreva uma mensagem ou adicione pelo menos um momento especial.',
        }
      }
      if (form.special_date_config.enabled) {
        if (!form.special_date_config.date?.trim()) {
          return { valid: false, message: 'Informe a data especial ou desative o contador.' }
        }
        if (!form.special_date_config.title?.trim()) {
          return { valid: false, message: 'Dê um título à data especial.' }
        }
      }
      return { valid: true }
    }

    case 'style':
      if (!form.template_id) {
        return { valid: false, message: 'Escolha um modelo visual.' }
      }
      if (!form.presentation && !definition?.layout) {
        return { valid: false, message: 'Escolha como a página será exibida.' }
      }
      return { valid: true }

    case 'finish': {
      const schemaIssues = collectPresentationSchemaIssuesFromForm(form, definition, photosCount)
      if (schemaIssues.length) {
        return { valid: false, message: firstIssueMessage(schemaIssues) }
      }
      return { valid: true }
    }

    default:
      return { valid: true }
  }
}
