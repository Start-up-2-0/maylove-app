import type { TributeModulesConfig } from '@/api/types'
import { getPresentation } from '@/templates/presentations'
import type { ExperienceLayout, TemplateDefinition } from '@/templates/types'

/** Defaults alinhados ao wizard — timeline e álbum ligados por padrão. */
export const DEFAULT_TRIBUTE_MODULES: Required<TributeModulesConfig> = {
  digital_album: true,
  letter: false,
  timeline: true,
  couple_map: false,
  digital_book: false,
  quiz: false,
  playlist: false,
  night_sky: false,
  qr_code: true,
  comments: false,
  reactions: false,
  gifts: false,
}

export function resolveTributeModules(
  fromForm?: TributeModulesConfig | null,
  fromContent?: TributeModulesConfig | null,
): Required<TributeModulesConfig> {
  return {
    ...DEFAULT_TRIBUTE_MODULES,
    ...(fromContent ?? {}),
    ...(fromForm ?? {}),
  }
}

const LETTER_LAYOUTS: ExperienceLayout[] = ['letter', 'envelope']

/** Layouts que já exibem a timeline de forma nativa (shell dedicado ou beats). */
const NATIVE_TIMELINE_LAYOUTS: ExperienceLayout[] = ['timeline', 'envelope', 'proposal']

export function isLetterLayout(layout: ExperienceLayout): boolean {
  return LETTER_LAYOUTS.includes(layout)
}

/** Exibe bloco de timeline injetado (carta, cinematic, scroll sem seção). */
export function shouldShowTimelineModule(
  modules: TributeModulesConfig,
  timeline: ReadonlyArray<unknown>,
  layout: ExperienceLayout,
): boolean {
  if (modules.timeline === false) return false
  if (!timeline.length) return false
  if (NATIVE_TIMELINE_LAYOUTS.includes(layout)) return false
  return true
}

/** Recurso Carta ativo fora de layout carta — reforça exibição do texto principal. */
export function shouldBoostLetterContent(
  modules: TributeModulesConfig,
  layout: ExperienceLayout,
  hasMessage: boolean,
): boolean {
  return modules.letter === true && !isLetterLayout(layout) && hasMessage
}

/** Módulos derivados automaticamente do estilo de apresentação — não aparecem como toggles. */
export const DERIVED_MODULE_IDS = ['letter', 'timeline', 'digital_album'] as const

export type DerivedModuleId = (typeof DERIVED_MODULE_IDS)[number]

/** Sincroniza módulos estruturais com o layout da apresentação escolhida. */
export function syncModulesFromPresentation(
  modules: TributeModulesConfig,
  presentationId: string | null | undefined,
  definition?: TemplateDefinition | null,
): void {
  const presentation = getPresentation(presentationId)
  const layout: ExperienceLayout = presentation?.layout ?? definition?.layout ?? 'scroll'

  modules.letter = isLetterLayout(layout)
  modules.timeline = true
  modules.digital_album = layout === 'album'
}

export function describeDerivedModules(
  presentationId: string | null | undefined,
  definition?: TemplateDefinition | null,
): string[] {
  const presentation = getPresentation(presentationId)
  const layout: ExperienceLayout = presentation?.layout ?? definition?.layout ?? 'scroll'
  const labels: string[] = []

  if (isLetterLayout(layout)) labels.push('Carta')
  if (layout === 'album') labels.push('Álbum digital')
  if (NATIVE_TIMELINE_LAYOUTS.includes(layout)) {
    labels.push('Linha do tempo')
  } else {
    labels.push('Linha do tempo (quando houver momentos)')
  }

  return labels
}
