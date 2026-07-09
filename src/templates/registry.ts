import type { TemplateDefinition } from './types'
import { classicTemplate } from './definitions/classic'
import { namoradosTemplate } from './definitions/namorados'
import { aniversarioTemplate } from './definitions/aniversario'
import { cartaDigitalTemplate } from './definitions/carta-digital'
import { memorialTemplate } from './definitions/memorial'
import { occasionTemplates } from './definitions/occasions'
import { collectionTemplates } from './definitions/collections'

/**
 * Biblioteca de templates. Adicionar um novo modelo = criar/registrar a definição
 * aqui (ou no conjunto de ocasiões). Nada mais na arquitetura precisa mudar: ele
 * aparece na galeria e no catálogo mock automaticamente.
 */
const ALL_TEMPLATES: TemplateDefinition[] = [
  classicTemplate,
  namoradosTemplate,
  aniversarioTemplate,
  cartaDigitalTemplate,
  memorialTemplate,
  ...occasionTemplates,
  ...collectionTemplates,
]

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = Object.fromEntries(
  ALL_TEMPLATES.map((template) => [template.slug, template]),
)

export const FALLBACK_TEMPLATE = classicTemplate

/** Resolve a definicao de um template pelo slug, com fallback para "classic". */
export function getTemplateDefinition(slug: string | null | undefined): TemplateDefinition {
  if (slug && TEMPLATE_REGISTRY[slug]) return TEMPLATE_REGISTRY[slug]
  return FALLBACK_TEMPLATE
}

export function listTemplateDefinitions(): TemplateDefinition[] {
  return ALL_TEMPLATES
}
