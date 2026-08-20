import { PRESENTATION_MAP } from '@/templates/presentations'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

/** Variante visual da prévia ao vivo (mockup estilo Love Cards). */
export type RomanceThemePreviewVariant =
  | 'netflix'
  | 'spotify'
  | 'cinema'
  | 'floral'
  | 'cassette'
  | 'envelope'
  | 'curtain'
  | 'polaroid'
  | 'book'
  | 'bouquet'
  | 'gift'
  | 'treasure'
  | 'diary'
  | 'disney'
  | 'retrospective'

export interface RomanceThemeDefinition {
  id: string
  label: string
  /** Apresentação real usada na página publicada. */
  presentationId: string
  /** Template visual base (slug) — define identidade/cores compatíveis com o tema. */
  templateSlug?: string
  previewVariant: RomanceThemePreviewVariant
  /** Gradiente do card no grid de seleção. */
  gradient: [string, string]
  accent?: string
  /** Nome honesto da estrutura publicada compartilhada por variantes. */
  baseModelLabel: string
  /** Conteúdos que mais valorizam este tema. */
  mediaRequirements: string[]
  /** Experiências nas quais o tema deve aparecer primeiro. */
  recommendedExperienceIds: RomanceExperienceId[]
}

/** Catálogo inspirado no Love Cards — https://www.lovecards.com.br/page-creator */
export const ROMANCE_THEMES: RomanceThemeDefinition[] = [
  {
    id: 'estilo-spotify',
    label: 'Player Musical',
    presentationId: 'slider-musica',
    templateSlug: 'namorados',
    previewVariant: 'spotify',
    gradient: ['#1db954', '#121212'],
    accent: '#1db954',
    baseModelLabel: 'Player musical',
    mediaRequirements: ['Música', 'Foto'],
    recommendedExperienceIds: ['declaracao-amor', 'pedido-namoro'],
  },
  {
    id: 'estilo-cinema',
    label: 'Estilo Cinema',
    presentationId: 'cinematografico',
    previewVariant: 'cinema',
    gradient: ['#1a1208', '#c9a227'],
    accent: '#c9a227',
    baseModelLabel: 'Cinema',
    mediaRequirements: ['Foto', 'Texto'],
    recommendedExperienceIds: ['declaracao-amor', 'pedido-casamento'],
  },
  {
    id: 'poesia-floral',
    label: 'Poesia Floral',
    presentationId: 'carta-simples',
    previewVariant: 'floral',
    gradient: ['#fce7f3', '#fda4af'],
    accent: '#e11d48',
    baseModelLabel: 'Carta',
    mediaRequirements: ['Texto'],
    recommendedExperienceIds: ['declaracao-amor', 'carta-amor'],
  },
  {
    id: 'retro-cassete',
    label: 'Retro Cassete',
    presentationId: 'slider-musica',
    previewVariant: 'cassette',
    gradient: ['#f97316', '#78350f'],
    accent: '#f97316',
    baseModelLabel: 'Player musical',
    mediaRequirements: ['Música', 'Foto'],
    recommendedExperienceIds: ['declaracao-amor', 'pedido-namoro'],
  },
  {
    id: 'envelope-story',
    label: 'Envelope Story',
    presentationId: 'carta-animada',
    templateSlug: 'carta-digital',
    previewVariant: 'envelope',
    gradient: ['#fef3c7', '#f9a8d4'],
    accent: '#db2777',
    baseModelLabel: 'Revelação animada',
    mediaRequirements: ['Carta'],
    recommendedExperienceIds: ['carta-amor', 'pedido-namoro'],
  },
  {
    id: 'cortina-amor',
    label: 'Cortina de Amor',
    presentationId: 'pedido',
    templateSlug: 'pedido-namoro',
    previewVariant: 'curtain',
    gradient: ['#450a0a', '#be123c'],
    accent: '#be123c',
    baseModelLabel: 'Pedido interativo',
    mediaRequirements: ['Pergunta', 'Foto'],
    recommendedExperienceIds: ['pedido-namoro', 'pedido-casamento'],
  },
  {
    id: 'polaroid',
    label: 'Polaroid',
    presentationId: 'album',
    previewVariant: 'polaroid',
    gradient: ['#f8fafc', '#cbd5e1'],
    accent: '#64748b',
    baseModelLabel: 'Álbum',
    mediaRequirements: ['Galeria'],
    recommendedExperienceIds: ['declaracao-amor', 'nossa-historia'],
  },
  {
    id: 'livro',
    label: 'Livro',
    presentationId: 'album',
    previewVariant: 'book',
    gradient: ['#14532d', '#166534'],
    accent: '#22c55e',
    baseModelLabel: 'Álbum',
    mediaRequirements: ['Capítulos', 'Fotos'],
    recommendedExperienceIds: ['nossa-historia'],
  },
  {
    id: 'buque',
    label: 'Buquê',
    presentationId: 'rolagem',
    previewVariant: 'bouquet',
    gradient: ['#fce7f3', '#fbcfe8'],
    accent: '#ec4899',
    baseModelLabel: 'Rolagem',
    mediaRequirements: ['Texto', 'Foto'],
    recommendedExperienceIds: ['declaracao-amor', 'carta-amor'],
  },
  {
    id: 'caixa-presente',
    label: 'Caixa de Presente',
    presentationId: 'carta-animada',
    templateSlug: 'namorados',
    previewVariant: 'gift',
    gradient: ['#fff1f2', '#fda4af'],
    accent: '#f43f5e',
    baseModelLabel: 'Revelação animada',
    mediaRequirements: ['Carta', 'Pergunta'],
    recommendedExperienceIds: ['pedido-namoro', 'pedido-casamento'],
  },
  {
    id: 'mapa-tesouro',
    label: 'Mapa do Tesouro',
    presentationId: 'storytelling',
    previewVariant: 'treasure',
    gradient: ['#fef08a', '#ca8a04'],
    accent: '#ca8a04',
    baseModelLabel: 'História guiada',
    mediaRequirements: ['Capítulos', 'Fotos'],
    recommendedExperienceIds: ['nossa-historia'],
  },
  {
    id: 'diario',
    label: 'Diário',
    presentationId: 'carta-simples',
    previewVariant: 'diary',
    gradient: ['#ede9fe', '#c4b5fd'],
    accent: '#8b5cf6',
    baseModelLabel: 'Carta',
    mediaRequirements: ['Texto'],
    recommendedExperienceIds: ['carta-amor', 'nossa-historia'],
  },
  {
    id: 'disney',
    label: 'Conto Encantado',
    presentationId: 'cinematografico',
    previewVariant: 'disney',
    gradient: ['#312e81', '#6366f1'],
    accent: '#818cf8',
    baseModelLabel: 'Cinema',
    mediaRequirements: ['Foto', 'Texto'],
    recommendedExperienceIds: ['declaracao-amor', 'pedido-casamento'],
  },
  {
    id: 'retrospectiva',
    label: 'Retrospectiva Interativa',
    presentationId: 'storytelling',
    previewVariant: 'retrospective',
    gradient: ['#0f172a', '#334155'],
    accent: '#94a3b8',
    baseModelLabel: 'História guiada',
    mediaRequirements: ['Capítulos', 'Fotos'],
    recommendedExperienceIds: ['nossa-historia'],
  },
  {
    id: 'nossa-serie',
    label: 'Nossa Série',
    presentationId: 'slider-musica',
    templateSlug: 'namorados',
    previewVariant: 'netflix',
    gradient: ['#450a0a', '#0b0b0f'],
    accent: '#e50914',
    baseModelLabel: 'Player musical',
    mediaRequirements: ['Música', 'Foto'],
    recommendedExperienceIds: ['declaracao-amor', 'nossa-historia'],
  },
]

export const ROMANCE_THEME_MAP: Record<string, RomanceThemeDefinition> = Object.fromEntries(
  ROMANCE_THEMES.map((theme) => [theme.id, theme]),
)

export const DEFAULT_ROMANCE_THEME_ID = 'nossa-serie'

export function getRomanceTheme(id?: string | null): RomanceThemeDefinition | null {
  if (!id) return null
  return ROMANCE_THEME_MAP[id] ?? null
}

/**
 * Infere o tema Love Cards quando `romance_theme_id` não foi persistido (homenagens antigas).
 * Usa cor de destaque quando vários temas compartilham a mesma apresentação.
 */
export function inferRomanceThemeId(params: {
  themeId?: string | null
  presentationId?: string | null
  colorPrimary?: string | null
}): string | null {
  const direct = getRomanceTheme(params.themeId)
  if (direct) return direct.id

  const presentationId = params.presentationId?.trim()
  if (!presentationId) return null

  const matches = ROMANCE_THEMES.filter((item) => item.presentationId === presentationId)
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0].id

  const color = params.colorPrimary?.trim().toLowerCase()
  if (color) {
    const byAccent = matches.find((item) => item.accent?.toLowerCase() === color)
    if (byAccent) return byAccent.id
  }

  return null
}

/** Resolve tema salvo, ou infere pelo presentation, ou retorna o padrão. */
export function resolveRomanceTheme(params: {
  themeId?: string | null
  presentationId?: string | null
  defaultThemeId?: string | null
}): RomanceThemeDefinition {
  const direct = getRomanceTheme(params.themeId)
  if (direct) return direct

  if (params.presentationId && !params.themeId) {
    const matches = ROMANCE_THEMES.filter((item) => item.presentationId === params.presentationId)
    const preferred = params.defaultThemeId
      ? matches.find((item) => item.id === params.defaultThemeId)
      : null
    if (preferred) return preferred
    if (matches[0]) return matches[0]
  }

  const fallbackId = params.defaultThemeId ?? DEFAULT_ROMANCE_THEME_ID
  return getRomanceTheme(fallbackId) ?? ROMANCE_THEMES[ROMANCE_THEMES.length - 1]
}

export function listRomanceThemes(): RomanceThemeDefinition[] {
  return ROMANCE_THEMES.filter((theme) => Boolean(PRESENTATION_MAP[theme.presentationId]))
}

export function listRomanceThemesForExperience(
  experienceId?: RomanceExperienceId | null,
  defaultThemeId?: string | null,
): RomanceThemeDefinition[] {
  return listRomanceThemes()
    .map((theme, index) => ({
      theme,
      index,
      rank:
        theme.id === defaultThemeId
          ? 0
          : experienceId && theme.recommendedExperienceIds.includes(experienceId)
            ? 1
            : 2,
    }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ theme }) => theme)
}

export function isThemeRecommendedForExperience(
  theme: RomanceThemeDefinition,
  experienceId?: RomanceExperienceId | null,
): boolean {
  return Boolean(experienceId && theme.recommendedExperienceIds.includes(experienceId))
}

export function themeIndex(themeId: string): number {
  const index = listRomanceThemes().findIndex((item) => item.id === themeId)
  return index >= 0 ? index : 0
}
