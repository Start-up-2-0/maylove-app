import type { TemplateDefinition } from '../types'
import { makeSample, samplePhotos } from '../sample'

export const cartaDigitalTemplate: TemplateDefinition = {
  slug: 'carta-digital',
  name: 'Carta Digital Animada',
  category: 'agradecimento',
  tributeTypeSlug: 'carta',
  description: 'Uma carta que se revela linha a linha, com toque manuscrito e assinatura.',
  theme: {
    primaryColor: '#b4763f',
    accentColor: '#d8a15f',
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Hanken Grotesk', sans-serif",
    background: 'linear-gradient(180deg, #fbf6ee 0%, #f5ece0 100%)',
    mode: 'light',
  },
  layout: 'envelope',
  animation: { speed: 'slow', entrance: 'fade' },
  effects: [],
  capabilities: { maxPhotos: 8, supportsVideo: false, supportsMusic: true },
  sections: [
    { id: 'hero', type: 'hero', config: { variant: 'card', background: 'gradient', eyebrow: 'Uma carta para você' } },
    { id: 'letter', type: 'typewriter' },
    { id: 'messages', type: 'messageSlider', config: { title: 'Entre linhas' } },
    { id: 'gallery', type: 'gallery', config: { layout: 'grid', title: 'Lembranças' } },
    { id: 'final', type: 'finalMessage' },
    { id: 'signature', type: 'signature', config: { prefix: 'Com todo o meu afeto,' } },
  ],
  sampleContent: makeSample({
    honoreeName: 'Mãe',
    senderName: 'Sua filha',
    title: 'Uma carta para você',
    subtitle: 'Palavras que eu guardava há tempo demais',
    message:
      'Sento para escrever e percebo que não há palavras suficientes.\nObrigada por cada abraço, cada conselho e cada silêncio que dizia tudo.',
    closingMessage: 'Você é o meu maior exemplo de amor.',
    signature: 'Sua filha, para sempre',
    photos: samplePhotos(3, 'Lembrança'),
    messages: [
      'Se hoje sou quem sou, é porque tive você como colo.',
      'Guardo cada memória como um tesouro.',
    ],
  }),
}
