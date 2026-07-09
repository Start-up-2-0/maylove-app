import type { TemplateDefinition } from '../types'
import { makeSample } from '../sample'

/**
 * Template de fallback: reproduz o layout base (hero + mensagem + galeria +
 * encerramento). Usado quando o slug do template nao esta registrado, garantindo
 * compatibilidade com tributos antigos.
 */
export const classicTemplate: TemplateDefinition = {
  slug: 'classic',
  name: 'Clássico',
  category: 'outras',
  tributeTypeSlug: 'homenagem',
  description: 'Layout elegante e atemporal para qualquer ocasião.',
  theme: {
    primaryColor: '#d94f7a',
    fontDisplay: "'Fraunces', serif",
    fontBody: "'Hanken Grotesk', sans-serif",
    background: 'linear-gradient(180deg, #fff7fb 0%, #fdf6f2 100%)',
    mode: 'light',
  },
  layout: 'scroll',
  animation: { speed: 'normal', entrance: 'slide-up' },
  effects: [],
  capabilities: { maxPhotos: 20, supportsVideo: true, supportsMusic: true },
  sections: [
    { id: 'hero', type: 'hero', config: { variant: 'card' } },
    { id: 'message', type: 'typewriter' },
    { id: 'gallery', type: 'gallery', config: { layout: 'masonry' } },
    { id: 'final', type: 'finalMessage' },
    { id: 'signature', type: 'signature' },
  ],
  sampleContent: makeSample({
    honoreeName: 'Maria',
    senderName: 'João',
    title: 'Uma homenagem especial',
    subtitle: 'Para alguém que faz toda a diferença',
    message: 'Há pessoas que tornam a vida mais leve, e você é uma delas.',
    closingMessage: 'Com admiração e carinho.',
    signature: 'João',
  }),
}
