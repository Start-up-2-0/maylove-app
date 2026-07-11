import { getPresentation, presentationForLayout } from '@/templates/presentations'
import { getTemplateDefinition } from '@/templates/registry'

export interface TributeMetaSource {
  tribute_type: { name: string }
  template: { name: string; slug?: string }
  presentation?: string | null
}

/** Rótulo da apresentação escolhida, ou o default do layout do template. */
export function resolvePresentationLabel(
  presentationId: string | null | undefined,
  templateSlug?: string | null,
): string | null {
  const chosen = getPresentation(presentationId)
  if (chosen) return chosen.label

  if (templateSlug) {
    const layout = getTemplateDefinition(templateSlug).layout
    return presentationForLayout(layout)?.label ?? null
  }

  return null
}

/** Ex.: "Namorados · Declaração em Carta · Carta Animada" */
export function formatTributeMeta(tribute: TributeMetaSource): string {
  const parts = [tribute.tribute_type.name, tribute.template.name]
  const presentation = resolvePresentationLabel(tribute.presentation, tribute.template.slug)
  if (presentation) parts.push(presentation)
  return parts.join(' · ')
}
