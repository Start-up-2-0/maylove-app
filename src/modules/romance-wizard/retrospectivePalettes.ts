export interface RetrospectivePalette {
  id: string
  label: string
  mode: 'dark' | 'light'
  stars?: boolean
  background: string
  cardBg: string
  cardBorder: string
  accent: string
  accentSecondary: string
  text: string
  textMuted: string
  countdownBg: string
  buttonGradient: string
}

export const RETROSPECTIVE_PALETTES: RetrospectivePalette[] = [
  {
    id: 'cosmic',
    label: 'Cosmos',
    mode: 'dark',
    stars: true,
    background: 'linear-gradient(180deg, #0f0a1e 0%, #1a1033 50%, #0d1117 100%)',
    cardBg: 'rgb(15 10 30 / 72%)',
    cardBorder: 'rgb(255 255 255 / 10%)',
    accent: '#fbbf24',
    accentSecondary: '#a855f7',
    text: '#f8fafc',
    textMuted: 'rgb(248 250 252 / 65%)',
    countdownBg: 'rgb(255 255 255 / 6%)',
    buttonGradient: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
  },
  {
    id: 'rose',
    label: 'Rosa',
    mode: 'light',
    background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 55%, #fff1f2 100%)',
    cardBg: '#ffffff',
    cardBorder: 'rgb(244 114 182 / 18%)',
    accent: '#ec4899',
    accentSecondary: '#14b8a6',
    text: '#831843',
    textMuted: '#9d174d',
    countdownBg: '#ffffff',
    buttonGradient: 'linear-gradient(90deg, #ec4899 0%, #14b8a6 100%)',
  },
  {
    id: 'classic',
    label: 'Clássico',
    mode: 'light',
    background: 'linear-gradient(180deg, #e8dcc8 0%, #f5efe6 50%, #faf6f0 100%)',
    cardBg: '#ffffff',
    cardBorder: 'rgb(180 140 90 / 20%)',
    accent: '#b8860b',
    accentSecondary: '#8b6914',
    text: '#3d2914',
    textMuted: '#6b5344',
    countdownBg: '#ffffff',
    buttonGradient: 'linear-gradient(90deg, #a67c52 0%, #8b6914 100%)',
  },
  {
    id: 'neon',
    label: 'Neon',
    mode: 'dark',
    stars: true,
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 45%, #1e1b4b 100%)',
    cardBg: 'rgb(15 23 42 / 78%)',
    cardBorder: 'rgb(34 211 238 / 22%)',
    accent: '#22d3ee',
    accentSecondary: '#ec4899',
    text: '#f0fdfa',
    textMuted: 'rgb(240 253 250 / 62%)',
    countdownBg: 'rgb(34 211 238 / 8%)',
    buttonGradient: 'linear-gradient(90deg, #22d3ee 0%, #ec4899 100%)',
  },
  {
    id: 'sage',
    label: 'Verde',
    mode: 'light',
    background: 'linear-gradient(180deg, #dcfce7 0%, #ecfdf5 55%, #f0fdf4 100%)',
    cardBg: '#ffffff',
    cardBorder: 'rgb(34 197 94 / 18%)',
    accent: '#16a34a',
    accentSecondary: '#991b1b',
    text: '#14532d',
    textMuted: '#166534',
    countdownBg: '#ffffff',
    buttonGradient: 'linear-gradient(90deg, #16a34a 0%, #991b1b 100%)',
  },
]

export const DEFAULT_RETROSPECTIVE_PALETTE_ID = 'cosmic'

export const RETROSPECTIVE_PALETTE_MAP: Record<string, RetrospectivePalette> = Object.fromEntries(
  RETROSPECTIVE_PALETTES.map((item) => [item.id, item]),
)

export function resolveRetrospectivePalette(
  paletteId?: string | null,
  customAccent?: string | null,
): RetrospectivePalette {
  const base =
    (paletteId && paletteId !== 'custom' ? RETROSPECTIVE_PALETTE_MAP[paletteId] : null) ??
    RETROSPECTIVE_PALETTE_MAP[DEFAULT_RETROSPECTIVE_PALETTE_ID]

  if (paletteId === 'custom' && customAccent) {
    return {
      ...base,
      id: 'custom',
      label: 'Personalizada',
      accent: customAccent,
      buttonGradient: `linear-gradient(90deg, ${customAccent} 0%, ${base.accentSecondary} 100%)`,
    }
  }

  return base
}
