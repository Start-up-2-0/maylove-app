import type { ExperienceLayout, LayoutConfig } from './types'

/**
 * Estilo de apresentação (a "experiência"): define COMO a homenagem é exibida e
 * como o visitante interage com ela. É desacoplado do template — assim o mesmo
 * template (identidade visual) pode ser apresentado de formas completamente
 * diferentes (carta, slider, timeline, álbum, cinematográfico...).
 *
 * Cada apresentação aponta para um shell de layout + uma configuração. Vários
 * estilos podem reutilizar o mesmo layout com configs distintas.
 *
 * Adicionar uma nova apresentação = acrescentar um item aqui. Nada mais muda.
 */
export interface PresentationStyle {
  id: string
  label: string
  emoji: string
  description: string
  layout: ExperienceLayout
  config?: LayoutConfig
  /** Bullets curtos exibidos no card de seleção. */
  highlights: string[]
}

export const PRESENTATION_STYLES: PresentationStyle[] = [
  {
    id: 'carta-simples',
    label: 'Carta Simples',
    emoji: '💌',
    description: 'Experiência minimalista, focada na mensagem escrita.',
    layout: 'letter',
    config: { minimal: true, music: false },
    highlights: ['Carta elegante e centrada', 'Fotos opcionais', 'Sem animações complexas'],
  },
  {
    id: 'carta-animada',
    label: 'Carta Animada',
    emoji: '✉️',
    description: 'Uma carta que conta uma história, com envelope e digitação.',
    layout: 'envelope',
    config: { music: true },
    highlights: ['Envelope que abre', 'Texto surgindo aos poucos', 'Fotos entre os parágrafos'],
  },
  {
    id: 'slider-fotos',
    label: 'Slider de Fotos',
    emoji: '🎞️',
    description: 'Apresentação em tela cheia com fotos em destaque.',
    layout: 'cinematic',
    config: { music: false },
    highlights: ['Fotos em tela cheia', 'Legendas personalizadas', 'Efeito Ken Burns'],
  },
  {
    id: 'slider-musica',
    label: 'Slider com Música',
    emoji: '🎵',
    description: 'Como um videoclipe: fotos sincronizadas com trilha sonora.',
    layout: 'cinematic',
    config: { music: true },
    highlights: ['Player integrado', 'Fotos sincronizadas', 'Transições cinematográficas'],
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    emoji: '📖',
    description: 'Narrativa interativa em capítulos, como um curta.',
    layout: 'storytelling',
    config: { music: true },
    highlights: ['Seções em tela cheia', 'Fotos, textos e vídeo', 'Animações entre capítulos'],
  },
  {
    id: 'timeline',
    label: 'Timeline',
    emoji: '🕰️',
    description: 'Linha do tempo para contar uma trajetória.',
    layout: 'timeline',
    config: { music: false },
    highlights: ['Datas importantes', 'Fotos e mensagens', 'Animações ao rolar'],
  },
  {
    id: 'album',
    label: 'Álbum de Memórias',
    emoji: '📚',
    description: 'Fotos organizadas como um álbum que se folheia.',
    layout: 'album',
    config: { music: true },
    highlights: ['Efeito de virar páginas', 'Mensagem em cada página', 'Música ambiente'],
  },
  {
    id: 'cinematografico',
    label: 'Cinematográfico',
    emoji: '🎬',
    description: 'Experiência tipo trailer, com clima de grande tela.',
    layout: 'cinematic',
    config: { music: true, dramatic: true },
    highlights: ['Abertura em tela cheia', 'Textos em momentos-chave', 'Transições suaves'],
  },
  {
    id: 'rolagem',
    label: 'Rolagem Clássica',
    emoji: '📜',
    description: 'Seções empilhadas, exploradas pela rolagem da página.',
    layout: 'scroll',
    config: { music: true },
    highlights: ['Blocos reordenáveis', 'Galeria e mensagens', 'Fluxo tradicional'],
  },
  {
    id: 'pedido',
    label: 'Pedido Interativo',
    emoji: '💍',
    description: 'História em etapas terminando em uma grande pergunta.',
    layout: 'proposal',
    config: { music: true },
    highlights: ['História em passos', 'Botão “Você aceita?”', 'Final surpreendente'],
  },
]

export const PRESENTATION_MAP: Record<string, PresentationStyle> = Object.fromEntries(
  PRESENTATION_STYLES.map((style) => [style.id, style]),
)

export function getPresentation(id: string | null | undefined): PresentationStyle | null {
  if (!id) return null
  return PRESENTATION_MAP[id] ?? null
}

export function listPresentations(): PresentationStyle[] {
  return PRESENTATION_STYLES
}

/** Encontra a apresentação cujo layout corresponde ao default do template. */
export function presentationForLayout(layout: ExperienceLayout | undefined): PresentationStyle | null {
  if (!layout) return null
  return PRESENTATION_STYLES.find((style) => style.layout === layout) ?? null
}
