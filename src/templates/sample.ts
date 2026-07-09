import type { ExperienceContent, ExperienceMediaItem, ExperienceTimelineItem } from './types'

const PHOTO_PAIRS: Array<[string, string]> = [
  ['#f6a5c0', '#f9d4c0'],
  ['#a0c4ff', '#bdb2ff'],
  ['#b9fbc0', '#98f5e1'],
  ['#ffd6a5', '#fdffb6'],
  ['#cdb4db', '#ffc8dd'],
  ['#8ecae6', '#219ebc'],
]

function svgPhoto(from: string, to: string, label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='700'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
  <stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/>
  </linearGradient></defs>
  <rect width='900' height='700' fill='url(#g)'/>
  <circle cx='450' cy='300' r='150' fill='rgba(255,255,255,0.28)'/>
  <text x='450' y='560' font-family='Georgia, serif' font-size='40' fill='rgba(255,255,255,0.9)' text-anchor='middle'>${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** Gera fotos de exemplo (SVG data URLs) para previews e fallback de conteúdo. */
export function samplePhotos(count = 5, label = 'Momento'): ExperienceMediaItem[] {
  return Array.from({ length: count }, (_, i) => {
    const [from, to] = PHOTO_PAIRS[i % PHOTO_PAIRS.length]
    return {
      id: `sample-${i}`,
      url: svgPhoto(from, to, `${label} ${i + 1}`),
      type: 'photo' as const,
    }
  })
}

const baseTimeline: ExperienceTimelineItem[] = [
  { date: '2019', title: 'O começo', description: 'Onde a nossa história começou.' },
  { date: '2021', title: 'Novos capítulos', description: 'Cada dia, uma memória para guardar.' },
  { date: '2024', title: 'Até hoje', description: 'E a história continua a ser escrita.' },
]

/**
 * Conteúdo de exemplo compartilhado. Cada template sobrescreve os campos que
 * definem sua identidade (títulos, mensagens, datas), reutilizando o restante.
 */
export function makeSample(overrides: Partial<ExperienceContent>): Partial<ExperienceContent> {
  return {
    honoreeName: 'Alguém especial',
    senderName: 'Com carinho',
    messages: [
      'Uma mensagem cheia de carinho para você.',
      'Momentos que ficam para sempre no coração.',
      'Obrigado por fazer parte desta história.',
    ],
    timeline: baseTimeline,
    photos: samplePhotos(6),
    eventInfo: { date: '12 de dezembro de 2026', location: 'Um lugar especial' },
    closingMessage: 'Com todo o carinho.',
    ...overrides,
  }
}
