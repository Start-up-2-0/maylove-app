import type { WizardStep } from '@/api/types'

/** Fluxo guiado fixo de 9 etapas — experiência progressiva e emocional. */
export const TRIBUTE_WIZARD_STEPS: WizardStep[] = [
  'type',
  'basics',
  'special-date',
  'story',
  'personalization',
  'texts',
  'modules',
  'review',
  'publish',
]

export const TRIBUTE_WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  type: 'Tipo',
  basics: 'Informações',
  'special-date': 'Data especial',
  story: 'Nossa história',
  personalization: 'Personalização',
  texts: 'Textos',
  modules: 'Recursos extras',
  review: 'Revisão',
  publish: 'Publicação',
}

export const TRIBUTE_WIZARD_STEP_DESCRIPTIONS: Record<WizardStep, string> = {
  type: 'Escolha o tipo de homenagem para receber sugestões personalizadas.',
  basics: 'Nome, pessoa homenageada, capa, modelo e música.',
  'special-date': 'Destaque uma data importante com contador regressivo ou desde o evento.',
  story: 'Conte momentos marcantes com fotos, textos e emoções.',
  personalization: 'Estilo de apresentação, paleta, fontes e efeitos visuais.',
  texts: 'Subtítulo, mensagem principal, despedida e assinatura — adaptados ao estilo escolhido.',
  modules: 'Recursos opcionais como QR Code e funcionalidades futuras.',
  review: 'Confira tudo antes de publicar e ajuste o que precisar.',
  publish: 'Publique, compartilhe o link e gere o QR Code.',
}

/** Opções exibidas na etapa 1 — mapeiam categorias de template e slugs de tipo da API. */
export interface WizardTributeTypeOption {
  id: string
  label: string
  icon: string
  description: string
  categorySlug: string
  /** Slugs de tribute_type aceitos pela API (primeiro match é usado). */
  typeSlugs: string[]
}

export const WIZARD_TRIBUTE_TYPE_OPTIONS: WizardTributeTypeOption[] = [
  {
    id: 'pedido-namoro',
    label: 'Pedido de namoro',
    icon: '❤️',
    description: 'Um convite especial para começar uma história a dois.',
    categorySlug: 'pedido-namoro',
    typeSlugs: ['pedido', 'pedido-namoro', 'namorados'],
  },
  {
    id: 'pedido-casamento',
    label: 'Pedido de casamento',
    icon: '💍',
    description: 'Transforme o "sim" em um momento inesquecível.',
    categorySlug: 'pedido-casamento',
    typeSlugs: ['pedido', 'casamento', 'pedido-casamento'],
  },
  {
    id: 'declaracao-amor',
    label: 'Declaração de amor',
    icon: '🥰',
    description: 'Diga tudo o que sente com uma experiência romântica.',
    categorySlug: 'amor',
    typeSlugs: ['namorados', 'amor', 'amizade'],
  },
  {
    id: 'aniversario',
    label: 'Aniversário',
    icon: '🎂',
    description: 'Uma comemoração cheia de alegria e boas lembranças.',
    categorySlug: 'aniversario',
    typeSlugs: ['aniversario'],
  },
  {
    id: 'datas-especiais',
    label: 'Datas especiais',
    icon: '📅',
    description: 'Marque ocasiões comemorativas e momentos únicos.',
    categorySlug: 'datas',
    typeSlugs: ['natal', 'ano-novo', 'dia-da-mulher', 'formatura'],
  },
  {
    id: 'desculpas',
    label: 'Desculpas',
    icon: '🙏',
    description: 'Peça desculpas com sinceridade e carinho.',
    categorySlug: 'agradecimento',
    typeSlugs: ['amizade', 'agradecimento'],
  },
  {
    id: 'memorial',
    label: 'Memorial',
    icon: '🕊️',
    description: 'Uma homenagem delicada para eternizar memórias.',
    categorySlug: 'memorial',
    typeSlugs: ['memorial'],
  },
  {
    id: 'outro',
    label: 'Outro',
    icon: '✨',
    description: 'Uma experiência versátil para qualquer tipo de homenagem.',
    categorySlug: 'outras',
    typeSlugs: ['amizade', 'agradecimento', 'formatura'],
  },
]

export type SpecialDateKind =
  | 'first_meeting'
  | 'first_kiss'
  | 'dating_proposal'
  | 'wedding'
  | 'anniversary'
  | 'custom'

export const SPECIAL_DATE_KIND_OPTIONS: Array<{
  id: SpecialDateKind
  label: string
  icon: string
}> = [
  { id: 'first_meeting', label: 'Primeiro encontro', icon: '☕' },
  { id: 'first_kiss', label: 'Primeiro beijo', icon: '💋' },
  { id: 'dating_proposal', label: 'Pedido de namoro', icon: '❤️' },
  { id: 'wedding', label: 'Casamento', icon: '💍' },
  { id: 'anniversary', label: 'Aniversário', icon: '🎂' },
  { id: 'custom', label: 'Data personalizada', icon: '✨' },
]

export const STORY_EMOTION_OPTIONS = [
  { id: 'love', label: 'Amor', icon: '❤️' },
  { id: 'joy', label: 'Alegria', icon: '😊' },
  { id: 'gratitude', label: 'Gratidão', icon: '🙏' },
  { id: 'nostalgia', label: 'Saudade', icon: '🥲' },
  { id: 'surprise', label: 'Surpresa', icon: '🎉' },
  { id: 'pride', label: 'Orgulho', icon: '🌟' },
] as const

export interface TributeModuleOption {
  id: keyof import('@/api/types').TributeModulesConfig
  label: string
  description: string
  icon: string
  badge?: string
}

export const TRIBUTE_MODULE_OPTIONS: TributeModuleOption[] = [
  { id: 'digital_album', label: 'Álbum digital', description: 'Galeria de fotos em formato de álbum.', icon: '📷' },
  { id: 'letter', label: 'Carta', description: 'Experiência de carta aberta com animação.', icon: '💌' },
  { id: 'timeline', label: 'Linha do tempo', description: 'Momentos organizados cronologicamente.', icon: '📜' },
  { id: 'couple_map', label: 'Mapa de casal', description: 'Lugares especiais marcados no mapa.', icon: '🗺️', badge: 'Em breve' },
  { id: 'digital_book', label: 'Livro digital', description: 'Páginas viradas como um livro de memórias.', icon: '📖' },
  { id: 'quiz', label: 'Quiz', description: 'Perguntas divertidas sobre o casal.', icon: '❓', badge: 'Em breve' },
  { id: 'playlist', label: 'Playlist', description: 'Lista de músicas especiais.', icon: '🎵', badge: 'Em breve' },
  { id: 'night_sky', label: 'Céu daquela noite', description: 'Mapa estelar da data especial.', icon: '🌌', badge: 'Em breve' },
  { id: 'qr_code', label: 'QR Code', description: 'Código para compartilhar facilmente.', icon: '📱' },
  { id: 'comments', label: 'Comentários', description: 'Visitantes podem deixar mensagens.', icon: '💬', badge: 'Em breve' },
  { id: 'reactions', label: 'Reações', description: 'Corações e reações emocionais.', icon: '💖', badge: 'Em breve' },
  { id: 'gifts', label: 'Presentes', description: 'Lista de presentes ou PIX.', icon: '🎁', badge: 'Em breve' },
]

/** Módulos opcionais editáveis na etapa Recursos — os estruturais vêm da apresentação. */
export const TRIBUTE_ADDON_MODULE_OPTIONS = TRIBUTE_MODULE_OPTIONS.filter(
  (mod) => !['letter', 'timeline', 'digital_album'].includes(mod.id),
)

/** Mapeia query params antigos para o novo fluxo. */
export const LEGACY_STEP_ALIASES: Record<string, WizardStep> = {
  presentation: 'personalization',
  style: 'personalization',
  texts: 'texts',
  photos: 'basics',
  moments: 'story',
  music: 'basics',
  video: 'story',
  event: 'special-date',
  effects: 'personalization',
  preview: 'review',
}

export function resolveWizardStep(raw: string | undefined | null): WizardStep {
  if (!raw) return 'type'
  if (TRIBUTE_WIZARD_STEPS.includes(raw as WizardStep)) return raw as WizardStep
  return LEGACY_STEP_ALIASES[raw] ?? 'type'
}

export function stepIndex(step: WizardStep): number {
  return TRIBUTE_WIZARD_STEPS.indexOf(step)
}
