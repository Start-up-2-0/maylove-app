import { listTemplates, listTributeTypes } from '@/api/catalog'
import { createTribute, updateTribute } from '@/api/tributes'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { listTemplateDefinitions } from '@/templates/registry'
import { listStyles } from '@/templates/styles'
import { syncModulesFromPresentation } from '@/utils/tributeModules'
import {
  WIZARD_TRIBUTE_TYPE_OPTIONS,
  type WizardTributeTypeOption,
} from '@/modules/tribute-wizard/tributeWizardSteps'
import {
  pickTemplateDefinitionForType,
  resolveDefaultPresentationId,
} from '@/modules/tribute-wizard/tributeTypeFlow'
import {
  resolveCompatibleTemplate,
  resolveTributeTypeForWizardOption,
} from '@/modules/tribute-wizard/tributeCatalogResolve'
import {
  defaultRomanceTitle,
  isLegacyGenericTitle,
} from '@/modules/romance-wizard/romanceCopy'
import {
  DEFAULT_ROMANCE_THEME_ID,
  resolveRomanceTheme,
} from '@/modules/romance-wizard/romanceThemes'
import {
  getExperienceSteps,
  getRomanceExperience,
  type RomanceExperienceId,
  type RomanceExperienceStepId,
} from '@/modules/romance-wizard/romanceExperiences'
import { getProposalDefaults } from '@/modules/romance-wizard/proposalCopy'

export function resolveExperienceStep(
  raw: string | undefined | null,
  experienceId?: string | null,
): RomanceExperienceStepId {
  const steps = getExperienceSteps(experienceId)
  if (!raw) return steps[0] ?? 'recipient'
  if (steps.includes(raw as RomanceExperienceStepId)) return raw as RomanceExperienceStepId

  const legacy: Record<string, RomanceExperienceStepId> = {
    occasion: 'recipient',
    couple: 'recipient',
    story: 'message',
    style: 'theme',
    personalization: 'theme',
    modules: 'theme',
    effects: 'theme',
    finish: 'preview',
    publish: 'preview',
    review: 'preview',
    basics: 'recipient',
    'special-date': 'recipient',
  }
  const mapped = legacy[raw]
  if (mapped && steps.includes(mapped)) return mapped
  return steps[0] ?? 'recipient'
}

export function nextExperienceStep(
  current: RomanceExperienceStepId,
  experienceId?: string | null,
): RomanceExperienceStepId | null {
  const steps = getExperienceSteps(experienceId)
  const index = steps.indexOf(current)
  return index >= 0 && index < steps.length - 1 ? steps[index + 1] : null
}

export function previousExperienceStep(
  current: RomanceExperienceStepId,
  experienceId?: string | null,
): RomanceExperienceStepId | null {
  const steps = getExperienceSteps(experienceId)
  const index = steps.indexOf(current)
  return index > 0 ? steps[index - 1] : null
}

function resolveWizardOption(experienceId: RomanceExperienceId): WizardTributeTypeOption | null {
  const experience = getRomanceExperience(experienceId)
  if (!experience?.wizardTypeId) return null
  return WIZARD_TRIBUTE_TYPE_OPTIONS.find((item) => item.id === experience.wizardTypeId) ?? null
}

export async function applyRomanceExperienceDefaults(
  form: ReturnType<typeof useTributeWizard>['form'],
  tributeId: string,
  experienceId: RomanceExperienceId,
): Promise<void> {
  const experience = getRomanceExperience(experienceId)
  if (!experience || experience.product !== 'tribute') return

  const option = resolveWizardOption(experienceId)
  if (!option) return

  const definitions = listTemplateDefinitions()
  const definition =
    definitions.find((item) => item.slug === experience.defaultTemplateSlug) ??
    pickTemplateDefinitionForType(option, definitions)
  if (!definition) return

  const types = await listTributeTypes()
  const apiType = resolveTributeTypeForWizardOption(types, option, definitions)
  if (!apiType) return

  const templates = await listTemplates(apiType.id)
  const template = resolveCompatibleTemplate(templates, definition)
  if (!template) return

  const defaultThemeId = experience.defaultThemeId ?? DEFAULT_ROMANCE_THEME_ID
  const defaultTheme = resolveRomanceTheme({ themeId: defaultThemeId })
  const hasUserTheme = Boolean(form.romance_theme_id?.trim() || form.presentation?.trim())
  const presentation = hasUserTheme
    ? form.presentation || defaultTheme.presentationId
    : experience.lockedPresentationId ??
      defaultTheme.presentationId ??
      resolveDefaultPresentationId(option, definition)
  const themeId = hasUserTheme
    ? form.romance_theme_id || defaultTheme.id
    : defaultTheme.id
  const styleId = listStyles()[0]?.id ?? ''
  const flow = experience

  form.romance_experience_id = experienceId
  form.wizard_type_id = option.id
  form.wizard_category_slug = option.categorySlug
  if (!hasUserTheme) {
    form.template_id = template.id
    form.presentation = presentation
    form.romance_theme_id = themeId
    form.color_primary = defaultTheme.accent ?? definition.theme.primaryColor
  }

  if (!form.title?.trim() || isLegacyGenericTitle(form.title)) {
    form.title = defaultRomanceTitle(option.id, experienceId)
  }

  const suggestedEffects = experience.defaultEffects ?? definition.effects ?? []
  if (!form.effects.length && suggestedEffects.length) {
    form.effects = [...suggestedEffects]
  }

  if (flow.enableSpecialDateByDefault) {
    form.special_date_config.enabled = true
    if (!form.special_date_config.title?.trim()) {
      form.special_date_config.title = 'Nossa data especial'
    }
  }

  const proposal = getProposalDefaults(experienceId)
  if (!form.question?.trim() && proposal?.question) form.question = proposal.question
  if (!form.celebration?.trim() && proposal?.celebration) form.celebration = proposal.celebration

  if (experienceId === 'pedido-namoro') {
    form.special_date_config.kind = 'dating_proposal'
  }
  if (experienceId === 'pedido-casamento') {
    form.special_date_config.kind = 'wedding'
  }

  if (experienceId === 'carta-amor') {
    form.include_opening_message = true
  }

  if (!form.style_id) form.style_id = styleId

  syncModulesFromPresentation(form.modules, form.presentation || presentation, definition)

  await updateTribute(tributeId, {
    tribute_type_id: apiType.id,
    template_id: form.template_id || template.id,
    color_primary: form.color_primary,
    content_json: {
      romance_experience_id: experienceId,
      wizard_category_slug: option.categorySlug,
      wizard_type_id: option.id,
      presentation: form.presentation || presentation,
      romance_theme_id: form.romance_theme_id || themeId,
      style_id: form.style_id || styleId,
      effects: form.effects.length ? form.effects : undefined,
      special_date_config: form.special_date_config.enabled ? form.special_date_config : undefined,
      question: form.question || undefined,
      celebration: form.celebration || undefined,
      include_opening_message: form.include_opening_message,
    },
  })
}

export interface StartRomanceExperienceResult {
  kind: 'tribute'
  tributeId: string
  firstStep: RomanceExperienceStepId
}

const startsInFlight = new Map<RomanceExperienceId, Promise<StartRomanceExperienceResult>>()

async function startRomanceExperienceRequest(
  experienceId: RomanceExperienceId,
): Promise<StartRomanceExperienceResult> {
  const experience = getRomanceExperience(experienceId)
  if (!experience) throw new Error('Experiência não encontrada.')
  if (experience.product === 'coming_soon') {
    throw new Error('Esta experiência ainda está sendo preparada.')
  }
  if (experience.product === 'map') {
    throw new Error('Use o módulo de mapas para esta experiência.')
  }
  if (experience.product === 'bouquet') {
    throw new Error('Use o módulo de buquês para esta experiência.')
  }

  const option = resolveWizardOption(experienceId)
  if (!option) throw new Error('Catálogo indisponível.')

  const definitions = listTemplateDefinitions()
  const definition =
    definitions.find((item) => item.slug === experience.defaultTemplateSlug) ??
    pickTemplateDefinitionForType(option, definitions)
  if (!definition) throw new Error('Catálogo indisponível')

  const types = await listTributeTypes()
  const apiType = resolveTributeTypeForWizardOption(types, option, definitions)
  if (!apiType) throw new Error('Catálogo indisponível')

  const templates = await listTemplates(apiType.id)
  const template = resolveCompatibleTemplate(templates, definition)
  if (!template) throw new Error('Nenhum template compatível.')

  const defaultThemeId = experience.defaultThemeId ?? DEFAULT_ROMANCE_THEME_ID
  const defaultTheme = resolveRomanceTheme({ themeId: defaultThemeId })
  const presentation =
    experience.lockedPresentationId ??
    defaultTheme.presentationId ??
    resolveDefaultPresentationId(option, definition)
  const styleId = listStyles()[0]?.id ?? ''

  const tribute = await createTribute(apiType.id, template.id)
  const proposal = getProposalDefaults(experienceId)
  const specialDateConfig = experience.enableSpecialDateByDefault
    ? {
        enabled: true,
        kind:
          experienceId === 'pedido-namoro'
            ? ('dating_proposal' as const)
            : ('wedding' as const),
        title: experienceId === 'pedido-namoro' ? 'Nosso pedido' : 'Nosso grande dia',
        counter_mode: experience.allowCountdown ? ('countdown' as const) : ('since' as const),
        display_format: 'card' as const,
      }
    : undefined

  await updateTribute(tribute.id, {
    color_primary: defaultTheme.accent ?? definition.theme.primaryColor,
    content_json: {
      romance_experience_id: experienceId,
      presentation,
      romance_theme_id: defaultTheme.id,
      style_id: styleId,
      wizard_category_slug: option.categorySlug,
      wizard_type_id: option.id,
      effects: definition.effects?.length ? definition.effects : undefined,
      question: proposal?.question,
      celebration: proposal?.celebration,
      special_date_config: specialDateConfig,
    },
  })

  return {
    kind: 'tribute',
    tributeId: tribute.id,
    firstStep: experience.steps[0] ?? 'recipient',
  }
}

/** Reaproveita a mesma criação enquanto uma tentativa estiver em andamento. */
export function startRomanceExperience(
  experienceId: RomanceExperienceId,
): Promise<StartRomanceExperienceResult> {
  const current = startsInFlight.get(experienceId)
  if (current) return current

  const request = startRomanceExperienceRequest(experienceId).finally(() => {
    startsInFlight.delete(experienceId)
  })
  startsInFlight.set(experienceId, request)
  return request
}
