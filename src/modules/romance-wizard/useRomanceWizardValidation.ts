import type { useTributeWizard } from '@/composables/useTributeWizard'
import {
  collectPresentationSchemaIssuesFromForm,
  firstIssueMessage,
} from '@/modules/tribute-wizard/presentationValidation'
import type { TemplateDefinition } from '@/templates/types'
import { timelineItemHasContent, timelineItemIsComplete } from '@/utils/timeline'
import { isSupportedVideoUrl } from '@/utils/videoUrl'
import type { RomanceExperienceStepId } from './romanceExperiences'
import { getRomanceExperience } from './romanceExperiences'
import { defaultRomanceTitle, isLegacyGenericTitle } from './romanceCopy'

export interface RomanceStepValidationResult {
  valid: boolean
  message?: string
}

function hasPlainMessage(message?: string | null): boolean {
  return Boolean(message?.replace(/<[^>]*>/g, '').trim())
}

export function validateExperienceStep(
  step: RomanceExperienceStepId,
  form: ReturnType<typeof useTributeWizard>['form'],
  photosCount = 0,
  definition?: TemplateDefinition | null,
  experienceId?: string | null,
): RomanceStepValidationResult {
  const experience = getRomanceExperience(experienceId)

  switch (step) {
    case 'recipient': {
      if (!form.honoree_name?.trim()) {
        return { valid: false, message: 'Informe o nome de quem receberá este presente.' }
      }
      const optionalDate = experience?.specialDateOptional ?? false
      const requiresDate = experience?.enableSpecialDateByDefault && !optionalDate
      if (requiresDate && !form.special_date_config.date?.trim()) {
        return { valid: false, message: 'Informe a data do início do relacionamento.' }
      }
      if (form.special_date_config.date?.trim()) {
        form.special_date_config.enabled = true
        if (!form.special_date_config.title?.trim()) {
          form.special_date_config.title = 'Nosso amor'
        }
      }
      return { valid: true }
    }

    case 'photos':
      if (photosCount < 1) {
        if (experience?.photosOptional) return { valid: true }
        return {
          valid: false,
          message:
            experience?.photosMode === 'cover'
              ? 'Adicione a foto de capa para continuar.'
              : 'Adicione pelo menos uma foto.',
        }
      }
      return { valid: true }

    case 'message':
      if (!form.title?.trim() || isLegacyGenericTitle(form.title)) {
        form.title = defaultRomanceTitle(form.wizard_type_id, experienceId ?? form.romance_experience_id)
      }
      if (!hasPlainMessage(form.message)) {
        return { valid: false, message: 'Escreva a mensagem ou carta antes de continuar.' }
      }
      return { valid: true }

    case 'proposal':
      if (!form.question?.trim()) {
        return { valid: false, message: 'Escreva a pergunta especial antes de continuar.' }
      }
      if (!form.celebration?.trim()) {
        return { valid: false, message: 'Escreva a mensagem que aparece depois do aceite.' }
      }
      return { valid: true }

    case 'music':
      if (form.music_source === 'none') {
        return { valid: false, message: 'Escolha uma música ou importe do YouTube.' }
      }
      if (form.music_source === 'library' && !form.music_track_id) {
        return { valid: false, message: 'Selecione uma faixa da biblioteca.' }
      }
      if (form.music_source === 'upload' && !form.music_duration_seconds) {
        return { valid: false, message: 'Importe o áudio do YouTube antes de continuar.' }
      }
      return { valid: true }

    case 'special-date': {
      const optional = experience?.specialDateOptional ?? false
      if (!form.special_date_config.enabled) {
        if (optional) return { valid: true }
        form.special_date_config.enabled = true
      }
      if (!form.special_date_config.date?.trim()) {
        return {
          valid: false,
          message: optional
            ? 'Informe a data ou desmarque "Incluir data especial" para pular.'
            : 'Informe a data especial.',
        }
      }
      if (!form.special_date_config.title?.trim()) {
        return { valid: false, message: 'Dê um título à data especial.' }
      }
      return { valid: true }
    }

    case 'video':
      if (form.video_url?.trim() && !isSupportedVideoUrl(form.video_url)) {
        return {
          valid: false,
          message: 'Use uma URL HTTPS válida do YouTube, Vimeo ou de um arquivo MP4/WebM.',
        }
      }
      return { valid: true }

    case 'chapters': {
      const chapters = form.timeline.filter((item) => timelineItemHasContent(item))
      if (chapters.length < 1) {
        return { valid: false, message: 'Adicione pelo menos um capítulo da história.' }
      }
      const incompleteIndex = chapters.findIndex((item) => !timelineItemIsComplete(item))
      if (incompleteIndex >= 0) {
        return {
          valid: false,
          message: `Complete o capítulo ${incompleteIndex + 1} com título e texto ou foto.`,
        }
      }
      return { valid: true }
    }

    case 'effects':
      return { valid: true }

    case 'theme':
      if (!form.presentation?.trim()) {
        return { valid: false, message: 'Escolha um tema para continuar.' }
      }
      return { valid: true }

    case 'preview': {
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

/** @deprecated Use validateExperienceStep */
export function validateRomanceStep(
  step: string,
  form: ReturnType<typeof useTributeWizard>['form'],
  photosCount = 0,
  definition?: TemplateDefinition | null,
): RomanceStepValidationResult {
  return validateExperienceStep(
    step as RomanceExperienceStepId,
    form,
    photosCount,
    definition,
    form.romance_experience_id,
  )
}
