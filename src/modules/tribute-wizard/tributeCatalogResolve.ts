import type { Template, TributeType } from '@/api/types'
import type { TemplateDefinition } from '@/templates/types'
import type { WizardTributeTypeOption } from './tributeWizardSteps'

/** Resolve o tribute_type da API alinhado ao catálogo (template_tribute_types). */
export function resolveTributeTypeForWizardOption(
  types: TributeType[],
  option: WizardTributeTypeOption,
  definitions: TemplateDefinition[],
): TributeType | null {
  const categoryDefs = definitions.filter((def) => def.category === option.categorySlug)
  const preferredSlugs = [
    ...new Set(categoryDefs.map((def) => def.tributeTypeSlug)),
    ...option.typeSlugs,
  ]

  for (const slug of preferredSlugs) {
    const match = types.find((item) => item.slug === slug)
    if (match) return match
  }

  return types[0] ?? null
}

/** Escolhe a definição padrão de template para iniciar o wizard. */
export function pickDefaultTemplateDefinition(
  option: WizardTributeTypeOption,
  definitions: TemplateDefinition[],
): TemplateDefinition | null {
  const categoryDefs = definitions.filter((def) => def.category === option.categorySlug)
  if (!categoryDefs.length) return definitions[0] ?? null

  return (
    categoryDefs.find((def) => def.slug === option.id) ??
    categoryDefs.find((def) => def.slug === option.categorySlug) ??
    categoryDefs[0]
  )
}

/** Encontra o template da API compatível com a definição escolhida. */
export function resolveCompatibleTemplate(
  templates: Template[],
  definition: TemplateDefinition,
): Template | null {
  return templates.find((item) => item.slug === definition.slug) ?? templates[0] ?? null
}
