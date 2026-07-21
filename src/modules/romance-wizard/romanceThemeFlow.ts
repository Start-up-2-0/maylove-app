import { listTemplates } from '@/api/catalog'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { listTemplateDefinitions } from '@/templates/registry'
import { PRESENTATION_MAP } from '@/templates/presentations'
import type { TemplateDefinition } from '@/templates/types'
import { syncModulesFromPresentation } from '@/utils/tributeModules'
import { resolveCompatibleTemplate } from '@/modules/tribute-wizard/tributeCatalogResolve'
import {
  getRomanceTheme,
  type RomanceThemeDefinition,
} from '@/modules/romance-wizard/romanceThemes'
import { DEFAULT_RETROSPECTIVE_PALETTE_ID } from '@/modules/romance-wizard/retrospectivePalettes'

export function templateSlugForTheme(theme: RomanceThemeDefinition): string {
  if (theme.templateSlug) return theme.templateSlug

  const layout = PRESENTATION_MAP[theme.presentationId]?.layout
  switch (layout) {
    case 'envelope':
    case 'letter':
      return 'carta-digital'
    case 'proposal':
      return 'pedido-namoro'
    default:
      return 'namorados'
  }
}

function resolveTemplateDefinition(theme: RomanceThemeDefinition): TemplateDefinition | null {
  const slug = templateSlugForTheme(theme)
  return listTemplateDefinitions().find((item) => item.slug === slug) ?? null
}

/** Aplica tema escolhido no formulário — apresentação, template e módulos. */
export async function applyRomanceThemeToForm(
  form: ReturnType<typeof useTributeWizard>['form'],
  themeId: string,
  options: {
    definition?: TemplateDefinition | null
    tributeTypeId?: string | null
  } = {},
): Promise<RomanceThemeDefinition | null> {
  const theme = getRomanceTheme(themeId)
  if (!theme) return null

  form.romance_theme_id = theme.id
  form.presentation = theme.presentationId
  if (theme.accent) form.color_primary = theme.accent
  if (theme.id === 'retrospectiva' && !form.retrospective_palette_id) {
    form.retrospective_palette_id = DEFAULT_RETROSPECTIVE_PALETTE_ID
  }

  const themeDefinition = resolveTemplateDefinition(theme)
  const definition = themeDefinition ?? options.definition ?? null

  if (themeDefinition && options.tributeTypeId) {
    try {
      const templates = await listTemplates(options.tributeTypeId)
      const template = resolveCompatibleTemplate(templates, themeDefinition)
      if (template) form.template_id = template.id
    } catch {
      // Mantém template atual se catálogo indisponível.
    }
  }

  syncModulesFromPresentation(form.modules, theme.presentationId, definition)
  return theme
}
