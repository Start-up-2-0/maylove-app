import type { TributeEffect } from '@/api/types'

/**
 * Tipos de secao suportados pela engine. Adicionar uma nova capacidade =
 * criar o componente + registrar em SECTION_REGISTRY + adicionar o type aqui.
 */
export type SectionType =
  | 'hero'
  | 'photoSlider'
  | 'gallery'
  | 'messageSlider'
  | 'typewriter'
  | 'timeline'
  | 'countdown'
  | 'video'
  | 'signature'
  | 'finalMessage'

/** Rótulo e emoji amigáveis por tipo de seção (usado no editor de seções). */
export const SECTION_META: Record<SectionType, { label: string; emoji: string }> = {
  hero: { label: 'Capa', emoji: '🖼️' },
  photoSlider: { label: 'Slider de fotos', emoji: '🎞️' },
  gallery: { label: 'Galeria', emoji: '🌆' },
  messageSlider: { label: 'Mensagens', emoji: '💬' },
  typewriter: { label: 'Texto animado', emoji: '⌨️' },
  timeline: { label: 'Linha do tempo', emoji: '📅' },
  countdown: { label: 'Contagem regressiva', emoji: '⏳' },
  video: { label: 'Vídeo', emoji: '▶️' },
  signature: { label: 'Assinatura', emoji: '✍️' },
  finalMessage: { label: 'Mensagem final', emoji: '💌' },
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast'

/** Forma como as fotos aparecem nos blocos de fotos. */
export type PhotoStyle = 'slider' | 'gallery' | 'mosaic' | 'polaroid'

export const PHOTO_STYLE_LABELS: Record<PhotoStyle, string> = {
  slider: 'Slider',
  gallery: 'Galeria',
  mosaic: 'Mosaico',
  polaroid: 'Polaroid',
}

/** Forma como os textos surgem nos blocos de texto. */
export type TextStyle = 'default' | 'typewriter'

export const TEXT_STYLE_LABELS: Record<TextStyle, string> = {
  default: 'Padrão',
  typewriter: 'Digitação',
}

export type AnimationEntrance = 'fade' | 'slide-up' | 'zoom'

/**
 * "Shell" de experiencia: define o fluxo de navegacao e a composicao visual do
 * template, muito alem de trocar cores. Cada layout tem personalidade propria.
 * Adicionar um novo = criar o componente + registrar em LAYOUT_REGISTRY + tipo aqui.
 */
export type ExperienceLayout =
  | 'scroll' // seções empilhadas (rolagem clássica)
  | 'letter' // carta simples e centrada, foco na mensagem
  | 'envelope' // envelope que abre e revela uma carta
  | 'album' // livro de fotos com virar de páginas
  | 'storytelling' // capítulos em tela cheia, como um curta
  | 'cinematic' // slides em tela cheia com Ken Burns
  | 'proposal' // história em etapas + "Você aceita?"
  | 'timeline' // linha do tempo construída pelo scroll

export const EXPERIENCE_LAYOUT_LABELS: Record<ExperienceLayout, string> = {
  scroll: 'Rolagem',
  letter: 'Carta simples',
  envelope: 'Carta animada',
  album: 'Álbum folheável',
  storytelling: 'Storytelling',
  cinematic: 'Slider cinematográfico',
  proposal: 'Pedido interativo',
  timeline: 'Linha do tempo',
}

/**
 * Ajustes que uma apresentação (estilo) passa para o shell de layout. Permite que o
 * mesmo layout se comporte de formas diferentes (ex.: slider com/sem música).
 */
export interface LayoutConfig {
  /** Habilita player/trilha de música. Default: true. */
  music?: boolean
  /** Versão minimalista, sem animações complexas. */
  minimal?: boolean
  /** Clima mais dramático/cinematográfico (vinheta reforçada). */
  dramatic?: boolean
}

/** Instancia de uma secao dentro de um template (metadados). */
export interface SectionInstance {
  id: string
  type: SectionType
  /** Opcoes especificas da secao (variantes de layout, rotulos, etc.). */
  config?: Record<string, unknown>
}

export interface TemplateTheme {
  primaryColor: string
  accentColor?: string
  fontDisplay: string
  fontBody: string
  /** background CSS (gradiente/cor) aplicado ao container da experiencia. */
  background: string
  mode: 'light' | 'dark'
}

/**
 * Definicao completa de um template. E o "JSON/metadados" (tipado) que torna a
 * biblioteca escalavel: novo template = novo objeto destes + registro.
 */
export interface TemplateDefinition {
  slug: string
  name: string
  category: string
  tributeTypeSlug: string
  description?: string
  theme: TemplateTheme
  /** Shell de experiencia (fluxo/navegacao). Default: 'scroll'. */
  layout?: ExperienceLayout
  animation: { speed: AnimationSpeed; entrance: AnimationEntrance }
  effects: TributeEffect[]
  sections: SectionInstance[]
  capabilities: {
    maxPhotos: number
    supportsVideo: boolean
    supportsMusic: boolean
  }
  /** Conteudo de exemplo usado quando o tributo ainda nao definiu esses campos. */
  sampleContent?: Partial<ExperienceContent>
}

export interface ExperienceMediaItem {
  id: string
  url: string
  thumbnail?: string
  type: 'photo' | 'video'
}

export interface ExperienceTimelineItem {
  date?: string
  title: string
  description?: string
  photoUrl?: string
  photoMediaId?: string
}

export interface ExperienceEventInfo {
  date?: string
  location?: string
  mapUrl?: string
}

/** Conteudo resolvido consumido pelos componentes de secao. */
export interface ExperienceContent {
  honoreeName: string
  senderName: string
  title: string
  subtitle: string
  message: string
  messages: string[]
  closingMessage: string
  /** Texto de abertura opcional (antes dos trechos/momentos). */
  includeOpeningMessage: boolean
  /** Mensagem de encerramento opcional ao final. */
  includeClosingMessage: boolean
  /** Pergunta do pedido (estilo "Pedido interativo"). */
  question: string
  /** Mensagem exibida ao aceitar o pedido. */
  celebration: string
  signature: string
  specialDate: string | null
  photos: ExperienceMediaItem[]
  videoUrl: string | null
  music: {
    url: string | null
    title: string
    autoplay?: boolean
    loop?: boolean
    startAt?: number
    endAt?: number | null
  }
  timeline: ExperienceTimelineItem[]
  eventInfo: ExperienceEventInfo | null
  effects: TributeEffect[]
  /** Ordem/ativação das seções (ids habilitados). null = ordem padrão do template. */
  sectionOrder: string[] | null
  /** Como as fotos aparecem na galeria. null = padrão do template. */
  photoStyle: PhotoStyle | null
  /** Como os textos surgem. null = padrão do template. */
  textStyle: TextStyle | null
  slug: string
  viewsCount: number | null
}

export interface ResolvedTheme {
  primaryColor: string
  accentColor: string
  fontDisplay: string
  fontBody: string
  background: string
  mode: 'light' | 'dark'
  entrance: AnimationEntrance
  /** multiplicador do tempo das animacoes (1 = normal). */
  speedMultiplier: number
  cssVars: Record<string, string>
}

export interface SectionComponentProps {
  section: SectionInstance
  content: ExperienceContent
  theme: ResolvedTheme
}

/** Props recebidas por todo shell de experiencia (layout). */
export interface LayoutComponentProps {
  definition: TemplateDefinition
  content: ExperienceContent
  theme: ResolvedTheme
  mode: 'full' | 'preview'
  shareUrl?: string
  /** Ajustes vindos da apresentação escolhida (música on/off, minimal, etc.). */
  config?: LayoutConfig
}
