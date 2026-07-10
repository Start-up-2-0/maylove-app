import type { AnimationEntrance, AnimationSpeed } from './types'

/**
 * Estilo visual do template. A ESTRUTURA (layout/seções) nunca muda — o estilo só
 * troca a "roupa": paleta, tipografia, fundo, modo (claro/escuro) e o ritmo das
 * animações. Assim o mesmo template pode ser usado de formas completamente
 * distintas. O usuário escolhe primeiro o template e depois um estilo.
 *
 * Adicionar um novo estilo = acrescentar um item aqui. Nada mais precisa mudar.
 */
export interface TemplateStyleOverrides {
  primaryColor: string
  accentColor: string
  fontDisplay: string
  fontBody: string
  background: string
  mode: 'light' | 'dark'
  entrance: AnimationEntrance
  speed: AnimationSpeed
}

export interface TemplateStyle {
  id: string
  label: string
  description: string
  emoji: string
  overrides: TemplateStyleOverrides
}

export const TEMPLATE_STYLES: TemplateStyle[] = [
  {
    id: 'romantico',
    label: 'Romântico',
    description: 'Tons rosados, manuscrito e um clima apaixonado.',
    emoji: '💗',
    overrides: {
      primaryColor: '#e11d7a',
      accentColor: '#f2a5c0',
      fontDisplay: "'Dancing Script', cursive",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: 'linear-gradient(180deg, #fff5f8 0%, #ffe9f0 100%)',
      mode: 'light',
      entrance: 'slide-up',
      speed: 'slow',
    },
  },
  {
    id: 'minimalista',
    label: 'Minimalista',
    description: 'Neutro, limpo e direto ao ponto.',
    emoji: '⚪',
    overrides: {
      primaryColor: '#2b2b30',
      accentColor: '#9a9aa2',
      fontDisplay: "'Space Grotesk', sans-serif",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: '#f7f6f4',
      mode: 'light',
      entrance: 'fade',
      speed: 'normal',
    },
  },
  {
    id: 'elegante',
    label: 'Elegante',
    description: 'Serifada refinada com toques de dourado.',
    emoji: '🤍',
    overrides: {
      primaryColor: '#26303b',
      accentColor: '#b08d57',
      fontDisplay: "'Cormorant Garamond', serif",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: '#fbf7f0',
      mode: 'light',
      entrance: 'fade',
      speed: 'normal',
    },
  },
  {
    id: 'moderno',
    label: 'Moderno',
    description: 'Cores vibrantes e tipografia contemporânea.',
    emoji: '🟣',
    overrides: {
      primaryColor: '#6d28d9',
      accentColor: '#ec4899',
      fontDisplay: "'Space Grotesk', sans-serif",
      fontBody: "'Poppins', sans-serif",
      background: '#f7f8fb',
      mode: 'light',
      entrance: 'zoom',
      speed: 'fast',
    },
  },
  {
    id: 'vintage',
    label: 'Vintage',
    description: 'Ar retrô, papel envelhecido e máquina de escrever.',
    emoji: '📻',
    overrides: {
      primaryColor: '#7a5230',
      accentColor: '#a9824f',
      fontDisplay: "'Special Elite', monospace",
      fontBody: "'Cormorant Garamond', serif",
      background: 'linear-gradient(180deg, #f3ead6 0%, #e9dcc2 100%)',
      mode: 'light',
      entrance: 'fade',
      speed: 'slow',
    },
  },
  {
    id: 'cinematografico',
    label: 'Cinematográfico',
    description: 'Fundo escuro e clima de grande tela.',
    emoji: '🎬',
    overrides: {
      primaryColor: '#e11d48',
      accentColor: '#fb7185',
      fontDisplay: "'Playfair Display', serif",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: 'linear-gradient(180deg, #0b0b0f 0%, #17121c 100%)',
      mode: 'dark',
      entrance: 'fade',
      speed: 'slow',
    },
  },
  {
    id: 'floral',
    label: 'Floral',
    description: 'Verde e rosa suaves, delicado como um jardim.',
    emoji: '🌸',
    overrides: {
      primaryColor: '#3f7d5b',
      accentColor: '#e79db0',
      fontDisplay: "'Cormorant Garamond', serif",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: 'linear-gradient(180deg, #f6fbf3 0%, #fdf1f5 100%)',
      mode: 'light',
      entrance: 'slide-up',
      speed: 'normal',
    },
  },
  {
    id: 'luxuoso',
    label: 'Luxuoso',
    description: 'Preto e dourado com tipografia imponente.',
    emoji: '👑',
    overrides: {
      primaryColor: '#c9a227',
      accentColor: '#e6c65c',
      fontDisplay: "'Cinzel', serif",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: 'linear-gradient(180deg, #0c0c0c 0%, #1a1712 100%)',
      mode: 'dark',
      entrance: 'fade',
      speed: 'slow',
    },
  },
  {
    id: 'divertido',
    label: 'Divertido',
    description: 'Cores quentes e alegres, cheio de energia.',
    emoji: '🎈',
    overrides: {
      primaryColor: '#f59e0b',
      accentColor: '#ef4444',
      fontDisplay: "'Fredoka', sans-serif",
      fontBody: "'Poppins', sans-serif",
      background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
      mode: 'light',
      entrance: 'zoom',
      speed: 'fast',
    },
  },
  {
    id: 'delicado',
    label: 'Delicado',
    description: 'Tons pastéis e leveza em cada detalhe.',
    emoji: '🕊️',
    overrides: {
      primaryColor: '#c084fc',
      accentColor: '#f5b8e0',
      fontDisplay: "'Josefin Sans', sans-serif",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: 'linear-gradient(180deg, #faf5ff 0%, #fdf2f8 100%)',
      mode: 'light',
      entrance: 'fade',
      speed: 'normal',
    },
  },
  {
    id: 'classico',
    label: 'Clássico',
    description: 'Atemporal, com serifada quente e acolhedora.',
    emoji: '📜',
    overrides: {
      primaryColor: '#7c2d12',
      accentColor: '#a8763e',
      fontDisplay: "'Fraunces', serif",
      fontBody: "'Hanken Grotesk', sans-serif",
      background: '#fbf7f2',
      mode: 'light',
      entrance: 'fade',
      speed: 'normal',
    },
  },
  {
    id: 'cartoon',
    label: 'Cartoon',
    description: 'Divertido e colorido, com traços marcantes.',
    emoji: '🎨',
    overrides: {
      primaryColor: '#2563eb',
      accentColor: '#f59e0b',
      fontDisplay: "'Fredoka', sans-serif",
      fontBody: "'Poppins', sans-serif",
      background: 'linear-gradient(180deg, #eef6ff 0%, #e0f2fe 100%)',
      mode: 'light',
      entrance: 'zoom',
      speed: 'fast',
    },
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Sofisticado, escuro e com acabamento nobre.',
    emoji: '💎',
    overrides: {
      primaryColor: '#9333ea',
      accentColor: '#c9a227',
      fontDisplay: "'Cinzel', serif",
      fontBody: "'Space Grotesk', sans-serif",
      background: 'linear-gradient(180deg, #0e0b16 0%, #1a1330 100%)',
      mode: 'dark',
      entrance: 'fade',
      speed: 'slow',
    },
  },
]

export const STYLE_MAP: Record<string, TemplateStyle> = Object.fromEntries(
  TEMPLATE_STYLES.map((style) => [style.id, style]),
)

export function getStyle(id: string | null | undefined): TemplateStyle | null {
  if (!id) return null
  return STYLE_MAP[id] ?? null
}

export function listStyles(): TemplateStyle[] {
  return TEMPLATE_STYLES
}
