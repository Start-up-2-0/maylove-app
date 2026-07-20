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
  getExperienceSteps,
  getRomanceExperience,
  type RomanceExperienceId,
  type RomanceExperienceStepId,
} from '@/modules/romance-wizard/romanceExperiences'

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
    style: 'music',
    finish: 'preview',
    publish: 'preview',
    review: 'preview',
    basics: 'recipient',
    'special-date': 'special-date',
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

  const presentation =
    experience.lockedPresentationId ?? resolveDefaultPresentationId(option, definition)
  const styleId = listStyles()[0]?.id ?? ''
  const flow = experience

  form.romance_experience_id = experienceId
  form.wizard_type_id = option.id
  form.wizard_category_slug = option.categorySlug
  form.template_id = template.id
  form.presentation = presentation
  form.style_id = styleId
  form.color_primary = definition.theme.primaryColor

  if (!form.title?.trim() || isLegacyGenericTitle(form.title)) {
    form.title = defaultRomanceTitle(option.id)
  }

  if (definition.effects?.length && !form.effects.length) {
    form.effects = [...definition.effects]
  }

  if (flow.enableSpecialDateByDefault) {
    form.special_date_config.enabled = true
    if (!form.special_date_config.title?.trim()) {
      form.special_date_config.title = 'Nossa data especial'
    }
  }

  if (option.id === 'pedido-namoro' && !form.question?.trim()) {
    form.question = 'Quer namorar comigo?'
    form.celebration = 'Você disse SIM! 💞'
  }
  if (option.id === 'pedido-casamento' && !form.question?.trim()) {
    form.question = 'Você aceita casar comigo?'
    form.celebration = 'Disse sim! 💍'
  }

  if (experienceId === 'carta-amor') {
    form.include_opening_message = true
  }

  syncModulesFromPresentation(form.modules, presentation, definition)

  await updateTribute(tributeId, {
    tribute_type_id: apiType.id,
    template_id: template.id,
    color_primary: form.color_primary,
    content_json: {
      romance_experience_id: experienceId,
      wizard_category_slug: option.categorySlug,
      wizard_type_id: option.id,
      presentation,
      style_id: styleId,
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

export async function startRomanceExperience(
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

  const presentation =
    experience.lockedPresentationId ?? resolveDefaultPresentationId(option, definition)
  const styleId = listStyles()[0]?.id ?? ''

  const tribute = await createTribute(apiType.id, template.id)

  await updateTribute(tribute.id, {
    color_primary: definition.theme.primaryColor,
    content_json: {
      romance_experience_id: experienceId,
      presentation,
      style_id: styleId,
      wizard_category_slug: option.categorySlug,
      wizard_type_id: option.id,
      effects: definition.effects?.length ? definition.effects : undefined,
    },
  })

  return {
    kind: 'tribute',
    tributeId: tribute.id,
    firstStep: experience.steps[0] ?? 'recipient',
  }
}
