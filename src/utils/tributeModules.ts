import type { TributeModulesConfig } from '@/api/types'
import type { ExperienceLayout } from '@/templates/types'

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
