/** Passos do fluxo simplificado — só o que o usuário precisa preencher. */
export type RomanceExperienceStepId =
  | 'recipient'
  | 'photos'
  | 'message'
  | 'music'
  | 'special-date'
  | 'video'
  | 'chapters'
  | 'theme'
  | 'effects'
  | 'preview'

import type { TributeEffect } from '@/api/types'

export type RomanceExperienceId =
  | 'declaracao-amor'
  | 'pedido-namoro'
  | 'pedido-casamento'
  | 'mapa-casal'
  | 'buque-digital'
  | 'carta-amor'
  | 'nossa-historia'
  | 'playlist-casal'

export type RomanceExperienceProduct = 'tribute' | 'map' | 'bouquet' | 'coming_soon'

export interface RomanceExperienceDefinition {
  id: RomanceExperienceId
  icon: string
  label: string
  tagline: string
  description: string
  opening: string
  product: RomanceExperienceProduct
  /** Slug do wizard type usado na API (tributos). */
  wizardTypeId?: string
  categorySlug?: string
  defaultTemplateSlug?: string
  /** Tema padrão no passo "Tema da página" (Love Cards). */
  defaultThemeId?: string
  lockedPresentationId?: string
  steps: RomanceExperienceStepId[]
  photosMode?: 'cover' | 'gallery'
  /** Data especial habilitada por padrão (pedidos). */
  enableSpecialDateByDefault?: boolean
  /** Se true, o passo de data pode ser pulado sem preencher. */
  specialDateOptional?: boolean
  /** Contagem regressiva opcional no pedido de casamento. */
  allowCountdown?: boolean
  /** Efeitos sugeridos ao criar — o usuário pode adicionar mais no passo Efeitos. */
  defaultEffects?: TributeEffect[]
}

export const ROMANCE_EXPERIENCE_STEP_LABELS: Record<RomanceExperienceStepId, string> = {
  recipient: 'Vocês',
  photos: 'Fotos',
  message: 'Carta',
  music: 'Música',
  'special-date': 'Data',
  video: 'Vídeo',
  chapters: 'Capítulos',
  theme: 'Tema',
  effects: 'Efeitos',
  preview: 'Publicar',
}

export const ROMANCE_EXPERIENCES: RomanceExperienceDefinition[] = [
  {
    id: 'declaracao-amor',
    icon: '❤️',
    label: 'Declaração de Amor',
    tagline: 'Uma mensagem sincera que emociona',
    description: 'Nome, foto de capa, carta e trilha — a plataforma cuida do resto.',
    opening: 'Corações surgindo suavemente antes da mensagem.',
    product: 'tribute',
    wizardTypeId: 'declaracao-amor',
    categorySlug: 'amor',
    defaultTemplateSlug: 'namorados',
    defaultThemeId: 'nossa-serie',
    steps: ['recipient', 'message', 'photos', 'music', 'theme', 'preview'],
    photosMode: 'cover',
    specialDateOptional: true,
    defaultEffects: ['hearts'],
  },
  {
    id: 'pedido-namoro',
    icon: '💍',
    label: 'Pedido de Namoro',
    tagline: 'O convite que muda tudo',
    description: 'Fotos, carta, música e a data que marca o início de vocês.',
    opening: 'Envelope abrindo lentamente até a pergunta especial.',
    product: 'tribute',
    wizardTypeId: 'pedido-namoro',
    categorySlug: 'pedido-namoro',
    defaultTemplateSlug: 'pedido-namoro',
    defaultThemeId: 'cortina-amor',
    steps: ['recipient', 'message', 'photos', 'music', 'theme', 'preview'],
    photosMode: 'gallery',
    enableSpecialDateByDefault: true,
    defaultEffects: ['hearts', 'confetti'],
  },
  {
    id: 'pedido-casamento',
    icon: '💎',
    label: 'Pedido de Casamento',
    tagline: 'A pergunta mais importante',
    description: 'Fotos, vídeo, carta, música e data — com contagem regressiva opcional.',
    opening: 'Anéis brilhando antes da grande pergunta.',
    product: 'tribute',
    wizardTypeId: 'pedido-casamento',
    categorySlug: 'pedido-casamento',
    defaultTemplateSlug: 'pedido-casamento',
    defaultThemeId: 'cortina-amor',
    steps: ['recipient', 'message', 'photos', 'video', 'music', 'theme', 'preview'],
    photosMode: 'gallery',
    enableSpecialDateByDefault: true,
    allowCountdown: true,
    defaultEffects: ['hearts', 'fireworks'],
  },
  {
    id: 'mapa-casal',
    icon: '🌍',
    label: 'Mapa do Casal',
    tagline: 'Lugares que contam a história de vocês',
    description: 'Marque locais, fotos e datas — jornada cinematográfica no mapa.',
    opening: 'Mapa sendo desenhado automaticamente, ponto a ponto.',
    product: 'map',
    steps: [],
  },
  {
    id: 'buque-digital',
    icon: '💐',
    label: 'Buquê Digital',
    tagline: 'Monte flor por flor, com significado',
    description: 'Escolha o modelo, monte o arranjo e escreva o cartão — como um presente físico.',
    opening: 'Flores desabrochando enquanto o buquê ganha forma.',
    product: 'bouquet',
    steps: [],
  },
  {
    id: 'carta-amor',
    icon: '💌',
    label: 'Carta de Amor',
    tagline: 'Simples, íntima e cinematográfica',
    description: 'Nome, carta e música — envelope animado abrindo para a leitura.',
    opening: 'Carta sendo retirada lentamente do envelope.',
    product: 'tribute',
    wizardTypeId: 'declaracao-amor',
    categorySlug: 'amor',
    defaultTemplateSlug: 'carta-digital',
    defaultThemeId: 'envelope-story',
    steps: ['recipient', 'message', 'music', 'theme', 'preview'],
    specialDateOptional: true,
    defaultEffects: ['hearts', 'petals'],
  },
  {
    id: 'nossa-historia',
    icon: '📖',
    label: 'Nossa História',
    tagline: 'Capítulos do relacionamento em linha do tempo',
    description: 'Adicione marcos com data, título, texto e foto — como um livro de memórias.',
    opening: 'Livro da história sendo aberto, capítulo a capítulo.',
    product: 'tribute',
    wizardTypeId: 'declaracao-amor',
    categorySlug: 'amor',
    defaultTemplateSlug: 'namorados',
    defaultThemeId: 'livro',
    steps: ['recipient', 'chapters', 'theme', 'preview'],
    defaultEffects: ['stars'],
  },
  {
    id: 'playlist-casal',
    icon: '🎵',
    label: 'Playlist do Casal',
    tagline: 'As músicas que marcam vocês',
    description: 'Nome da playlist, faixas favoritas e memórias ligadas a cada música.',
    opening: 'Disco de vinil iniciando a trilha sentimental.',
    product: 'coming_soon',
    steps: [],
  },
]

export function getRomanceExperience(id?: string | null): RomanceExperienceDefinition | null {
  if (!id) return null
  return ROMANCE_EXPERIENCES.find((item) => item.id === id) ?? null
}

export function resolveRomanceExperienceId(params: {
  romanceExperienceId?: string | null
  wizardTypeId?: string | null
}): RomanceExperienceId | null {
  const direct = getRomanceExperience(params.romanceExperienceId)
  if (direct) return direct.id

  const byWizard: Partial<Record<string, RomanceExperienceId>> = {
    'declaracao-amor': 'declaracao-amor',
    'pedido-namoro': 'pedido-namoro',
    'pedido-casamento': 'pedido-casamento',
    aniversario: 'declaracao-amor',
    'datas-especiais': 'nossa-historia',
  }
  const mapped = params.wizardTypeId ? byWizard[params.wizardTypeId] : undefined
  return mapped ?? null
}

export function getExperienceSteps(experienceId?: string | null): RomanceExperienceStepId[] {
  const experience = getRomanceExperience(experienceId)
  return experience?.steps.length
    ? [...experience.steps]
    : ['recipient', 'message', 'photos', 'music', 'theme', 'preview']
}
