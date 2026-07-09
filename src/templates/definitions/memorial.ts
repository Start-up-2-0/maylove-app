import type { TemplateDefinition } from '../types'
import { makeSample, samplePhotos } from '../sample'

export const memorialTemplate: TemplateDefinition = {
  slug: 'memorial',
  name: 'Memorial',
  category: 'memorial',
  tributeTypeSlug: 'memorial',
  description: 'Uma homenagem serena e minimalista, com linha da vida e partículas discretas.',
  theme: {
    primaryColor: '#c9a86a',
    accentColor: '#e7d3a6',
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Hanken Grotesk', sans-serif",
    background: 'linear-gradient(180deg, #14110f 0%, #1c1814 100%)',
    mode: 'dark',
  },
  layout: 'album',
  animation: { speed: 'slow', entrance: 'fade' },
  effects: ['stars'],
  capabilities: { maxPhotos: 30, supportsVideo: true, supportsMusic: true },
  sections: [
    { id: 'hero', type: 'hero', config: { variant: 'fullscreen', parallax: true } },
    { id: 'intro', type: 'typewriter', config: { eyebrow: 'Em memória' } },
    { id: 'timeline', type: 'timeline', config: { title: 'Uma vida bem vivida' } },
    { id: 'gallery', type: 'gallery', config: { layout: 'masonry', title: 'Recordações' } },
    { id: 'messages', type: 'messageSlider', config: { title: 'Palavras da família' } },
    { id: 'final', type: 'finalMessage', config: { text: 'Para sempre em nossos corações.' } },
    { id: 'signature', type: 'signature', config: { prefix: 'Com saudade,' } },
  ],
  sampleContent: makeSample({
    honoreeName: 'José',
    senderName: 'A família',
    title: 'Em memória de José',
    subtitle: '1948 — 2024',
    message: 'Uma vida dedicada ao amor, à família e aos pequenos gestos que ficam para sempre.',
    closingMessage: 'Para sempre em nossos corações.',
    signature: 'Com amor eterno, sua família',
    photos: samplePhotos(6, 'Recordação'),
    messages: [
      'Meu pai me ensinou que grandeza está na simplicidade. — Carlos',
      'Vovô, suas histórias vivem em cada um de nós. — Laura',
      'Obrigada por tanto amor, para sempre. — Helena',
    ],
    timeline: [
      { date: '1948', title: 'O começo', description: 'Nasceu numa pequena cidade, cercado de afeto.' },
      { date: '1972', title: 'O grande amor', description: 'Casou-se com Helena, sua companheira de vida.' },
      { date: '1980', title: 'A família cresce', description: 'Tornou-se pai e encontrou seu maior orgulho.' },
      { date: '2010', title: 'O legado', description: 'Netos, risadas e uma casa sempre cheia.' },
    ],
  }),
}
