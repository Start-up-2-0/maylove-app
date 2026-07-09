import type { TemplateDefinition } from '../types'
import { makeSample, samplePhotos } from '../sample'

export const namoradosTemplate: TemplateDefinition = {
  slug: 'namorados',
  name: 'Dia dos Namorados',
  category: 'amor',
  tributeTypeSlug: 'namorados',
  description: 'Uma declaração romântica em tela cheia, com timeline e chuva de corações.',
  theme: {
    primaryColor: '#e0245e',
    accentColor: '#ff7aa2',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Hanken Grotesk', sans-serif",
    background: 'linear-gradient(180deg, #fff5f7 0%, #ffe9f0 55%, #fff2f6 100%)',
    mode: 'light',
  },
  layout: 'cinematic',
  animation: { speed: 'normal', entrance: 'fade' },
  effects: ['hearts'],
  capabilities: { maxPhotos: 20, supportsVideo: true, supportsMusic: true },
  sections: [
    { id: 'hero', type: 'hero', config: { variant: 'fullscreen', parallax: true } },
    { id: 'intro', type: 'typewriter', config: { eyebrow: 'Para você' } },
    { id: 'timeline', type: 'timeline', config: { title: 'Nossa história' } },
    { id: 'slider', type: 'photoSlider', config: { title: 'Momentos nossos' } },
    { id: 'countdown', type: 'countdown', config: { mode: 'countup', title: 'Juntos há' } },
    { id: 'messages', type: 'messageSlider', config: { title: 'O que sinto por você' } },
    { id: 'final', type: 'finalMessage' },
    { id: 'signature', type: 'signature', config: { prefix: 'Eternamente seu(sua),' } },
  ],
  sampleContent: makeSample({
    honoreeName: 'Meu amor',
    senderName: 'Ana',
    title: 'Para o meu amor',
    subtitle: 'Uma história que escolho viver todos os dias',
    message: 'Com você aprendi que o amor está nos pequenos detalhes do dia a dia.',
    closingMessage: 'Te amo hoje, amanhã e sempre.',
    signature: 'Ana',
    specialDate: '2021-06-12T00:00:00.000Z',
    photos: samplePhotos(5, 'Nós'),
    messages: [
      'Você é o meu lugar favorito no mundo.',
      'Cada dia ao seu lado é o meu presente.',
      'Obrigada por transformar o comum em extraordinário.',
    ],
    timeline: [
      { date: 'Jun 2021', title: 'O primeiro olhar', description: 'Um café que virou horas de conversa.' },
      { date: 'Dez 2021', title: 'A primeira viagem', description: 'Juntos, qualquer lugar é casa.' },
      { date: 'Ago 2023', title: 'Nosso lar', description: 'As chaves e um recomeço a dois.' },
    ],
  }),
}
