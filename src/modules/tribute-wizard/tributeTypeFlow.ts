import type { WizardStep } from '@/api/types'
import { updateTribute } from '@/api/tributes'
import type { Template, TributeType } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { presentationForLayout } from '@/templates/presentations'
import { listStyles } from '@/templates/styles'
import type { TemplateDefinition } from '@/templates/types'
import { syncModulesFromPresentation } from '@/utils/tributeModules'
import {
  pickDefaultTemplateDefinition,
  resolveCompatibleTemplate,
} from './tributeCatalogResolve'
import {
  TRIBUTE_WIZARD_STEPS,
  type SpecialDateKind,
  type WizardTributeTypeOption,
} from './tributeWizardSteps'
import {
  defaultRomanceTitle,
  isLegacyGenericTitle,
} from '@/modules/romance-wizard/romanceCopy'
import { isRomanceTypeId } from '@/modules/romance-wizard/romanceWizardSteps'

export interface WizardTypeFlowConfig {
  skipSteps: WizardStep[]
  /** Exibe cartão de evento (local, data, mapa) na etapa Data especial. */
  showEventInfo?: boolean
  defaultTemplateSlug?: string
  defaultPresentationId?: string
  defaultSpecialDateKind?: SpecialDateKind
  storyStepLabel?: string
  storyStepDescription?: string
  specialDateHint?: string
  defaultQuestion?: string
  defaultCelebration?: string
}

const DEFAULT_FLOW: WizardTypeFlowConfig = {
  skipSteps: [],
}

const WIZARD_TYPE_FLOW: Record<string, WizardTypeFlowConfig> = {
  'pedido-namoro': {
    skipSteps: [],
    showEventInfo: true,
    defaultTemplateSlug: 'pedido-namoro',
    defaultPresentationId: 'pedido',
    defaultSpecialDateKind: 'dating_proposal',
    storyStepLabel: 'Nossa história até o pedido',
    storyStepDescription: 'Conte os momentos que levaram até o grande convite.',
    specialDateHint: 'Sugestão: marque a data do pedido ou do início do namoro.',
    defaultQuestion: 'Quer namorar comigo?',
    defaultCelebration: 'Você disse SIM! 💞',
  },
  'pedido-casamento': {
    skipSteps: [],
    showEventInfo: true,
    defaultTemplateSlug: 'pedido-casamento',
    defaultPresentationId: 'pedido',
    defaultSpecialDateKind: 'wedding',
    storyStepLabel: 'Nossa história até o pedido',
    storyStepDescription: 'Os capítulos que precedem a grande pergunta.',
    specialDateHint: 'Sugestão: data do pedido ou do casamento civil.',
    defaultQuestion: 'Você aceita casar comigo?',
    defaultCelebration: 'Disse sim! 💍',
  },
  'declaracao-amor': {
    skipSteps: [],
    defaultTemplateSlug: 'namorados',
    defaultPresentationId: 'slider-musica',
    defaultSpecialDateKind: 'first_meeting',
    storyStepLabel: 'Nossa história',
    storyStepDescription: 'Momentos que contam por que esse amor é especial.',
    specialDateHint: 'Sugestão: data do primeiro encontro ou início do relacionamento.',
  },
  aniversario: {
    skipSteps: [],
    showEventInfo: true,
    defaultTemplateSlug: 'aniversario',
    defaultPresentationId: 'slider-fotos',
    defaultSpecialDateKind: 'anniversary',
    storyStepLabel: 'Momentos especiais',
    storyStepDescription: 'Lembretes e histórias que celebram essa pessoa.',
    specialDateHint: 'Sugestão: data de nascimento ou da festa.',
  },
  'datas-especiais': {
    skipSteps: [],
    showEventInfo: true,
    defaultTemplateSlug: 'dia-da-mulher',
    defaultPresentationId: 'timeline',
    defaultSpecialDateKind: 'custom',
    storyStepLabel: 'Marcos da ocasião',
    storyStepDescription: 'Registre os momentos que tornam essa data inesquecível.',
    specialDateHint: 'Destaque a data comemorativa principal.',
  },
  desculpas: {
    skipSteps: ['special-date'],
    defaultTemplateSlug: 'carta-digital',
    defaultPresentationId: 'carta-animada',
    storyStepLabel: 'O que quero dizer',
    storyStepDescription: 'Contexto e sentimentos que você quer compartilhar.',
  },
  memorial: {
    skipSteps: ['special-date'],
    defaultTemplateSlug: 'memorial',
    defaultPresentationId: 'album',
    storyStepLabel: 'Linha da vida',
    storyStepDescription: 'Marcos e memórias que eternizam essa pessoa.',
  },
  outro: {
    skipSteps: [],
    defaultTemplateSlug: 'classic',
    defaultPresentationId: 'rolagem',
    storyStepLabel: 'Nossa história',
    storyStepDescription: 'Momentos marcantes com fotos, textos e emoções.',
  },
}

export function getWizardTypeFlowConfig(wizardTypeId?: string | null): WizardTypeFlowConfig {
  if (!wizardTypeId) return DEFAULT_FLOW
  return WIZARD_TYPE_FLOW[wizardTypeId] ?? DEFAULT_FLOW
}

export function showWizardEventInfo(wizardTypeId?: string | null): boolean {
  return getWizardTypeFlowConfig(wizardTypeId).showEventInfo === true
}

export function getWizardSteps(wizardTypeId?: string | null): WizardStep[] {
  const { skipSteps } = getWizardTypeFlowConfig(wizardTypeId)
  return TRIBUTE_WIZARD_STEPS.filter((step) => !skipSteps.includes(step))
}

export function normalizeWizardStep(step: WizardStep, wizardTypeId?: string | null): WizardStep {
  const steps = getWizardSteps(wizardTypeId)
  if (steps.includes(step)) return step

  const fullIndex = TRIBUTE_WIZARD_STEPS.indexOf(step)
  for (let i = fullIndex; i >= 0; i--) {
    const candidate = TRIBUTE_WIZARD_STEPS[i]
    if (steps.includes(candidate)) return candidate
  }
  return steps[0] ?? 'type'
}

export function stepIndex(step: WizardStep, wizardTypeId?: string | null): number {
  const steps = getWizardSteps(wizardTypeId)
  const index = steps.indexOf(step)
  return index >= 0 ? index : 0
}

export function pickTemplateDefinitionForType(
  option: WizardTributeTypeOption,
  definitions: TemplateDefinition[],
): TemplateDefinition | null {
  const flow = getWizardTypeFlowConfig(option.id)
  if (flow.defaultTemplateSlug) {
    const match = definitions.find((item) => item.slug === flow.defaultTemplateSlug)
    if (match) return match
  }
  return pickDefaultTemplateDefinition(option, definitions)
}

export function resolveDefaultPresentationId(
  option: WizardTributeTypeOption,
  definition: TemplateDefinition,
): string {
  const flow = getWizardTypeFlowConfig(option.id)
  if (flow.defaultPresentationId) return flow.defaultPresentationId
  return presentationForLayout(definition.layout)?.id ?? ''
}

export interface ApplyTypeDefaultsParams {
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  option: WizardTributeTypeOption
  apiType: TributeType
  definitions: TemplateDefinition[]
  templates: Template[]
}

/** Aplica defaults de template, apresentação, textos e módulos ao selecionar o tipo. */
export async function applyTypeDefaults(params: ApplyTypeDefaultsParams): Promise<boolean> {
  const { form, tributeId, option, apiType, definitions, templates } = params
  const flow = getWizardTypeFlowConfig(option.id)
  const definition = pickTemplateDefinitionForType(option, definitions)
  if (!definition) return false

  const template = resolveCompatibleTemplate(templates, definition)
  if (!template) return false

  const presentation = resolveDefaultPresentationId(option, definition)
  const styleId = listStyles()[0]?.id ?? ''
  const defaults = apiType.default_texts ?? {}

  form.wizard_type_id = option.id
  form.wizard_category_slug = option.categorySlug
  form.template_id = template.id
  form.presentation = presentation
  form.style_id = styleId
  form.color_primary = definition.theme.primaryColor

  if (isRomanceTypeId(option.id)) {
    if (!form.title?.trim() || isLegacyGenericTitle(form.title)) {
      form.title = defaultRomanceTitle(option.id)
    }
  } else if (!form.title?.trim() && defaults.title) {
    form.title = defaults.title
  }
  if (!form.message?.trim() && defaults.message) form.message = defaults.message
  if (apiType.default_palette?.[0]) form.color_primary = apiType.default_palette[0]

  if (flow.defaultSpecialDateKind) {
    form.special_date_config.kind = flow.defaultSpecialDateKind
  }

  if (flow.skipSteps.includes('special-date')) {
    form.special_date_config.enabled = false
    form.special_date = ''
  }

  if (flow.defaultQuestion && !form.question?.trim()) {
    form.question = flow.defaultQuestion
  }
  if (flow.defaultCelebration && !form.celebration?.trim()) {
    form.celebration = flow.defaultCelebration
  }

  if (definition.effects?.length && !form.effects.length) {
    form.effects = [...definition.effects]
  }

  syncModulesFromPresentation(form.modules, presentation, definition)

  await updateTribute(tributeId, {
    tribute_type_id: apiType.id,
    template_id: template.id,
    color_primary: form.color_primary,
    content_json: {
      wizard_category_slug: option.categorySlug,
      wizard_type_id: option.id,
      presentation,
      style_id: styleId,
      effects: form.effects.length ? form.effects : undefined,
    },
  })

  return true
}
