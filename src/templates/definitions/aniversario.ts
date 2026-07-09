import type { TemplateDefinition } from '../types'
import { makeSample, samplePhotos } from '../sample'

export const aniversarioTemplate: TemplateDefinition = {
  slug: 'aniversario',
  name: 'Feliz Aniversário',
  category: 'aniversario',
  tributeTypeSlug: 'aniversario',
  description: 'Uma festa vibrante com confetes, slider de fotos e mensagens dos amigos.',
  theme: {
    primaryColor: '#f59e0b',
    accentColor: '#ec4899',
    fontDisplay: "'Poppins', sans-serif",
    fontBody: "'Hanken Grotesk', sans-serif",
    background: 'linear-gradient(180deg, #fff9ec 0%, #fef1f6 60%, #f4f0ff 100%)',
    mode: 'light',
  },
  layout: 'cinematic',
  animation: { speed: 'fast', entrance: 'zoom' },
  effects: ['confetti'],
  capabilities: { maxPhotos: 24, supportsVideo: true, supportsMusic: true },
  sections: [
    { id: 'hero', type: 'hero', config: { variant: 'fullscreen', eyebrow: 'É dia de festa!' } },
    { id: 'countdown', type: 'countdown', config: { mode: 'countdown', title: 'Contagem para apagar as velas' } },
    { id: 'slider', type: 'photoSlider', config: { title: 'Retrospectiva' } },
    { id: 'messages', type: 'messageSlider', config: { title: 'Recados dos amigos' } },
    { id: 'video', type: 'video', config: { title: 'Vídeo de homenagem' } },
    { id: 'final', type: 'finalMessage', config: { text: 'Que venham muitos anos de alegria!' } },
    { id: 'signature', type: 'signature', config: { prefix: 'Com carinho,' } },
  ],
  sampleContent: makeSample({
    honoreeName: 'Maria',
    senderName: 'Seus amigos',
    title: 'Feliz Aniversário, Maria!',
    subtitle: 'Hoje o mundo comemora você',
    message: 'Que seu dia seja tão especial quanto você é para todos nós!',
    closingMessage: 'Que venham muitos anos de alegria!',
    signature: 'Com amor, todos nós',
    specialDate: new Date(Date.now() + 86_400_000 * 18).toISOString(),
    photos: samplePhotos(6, 'Festa'),
    messages: [
      'Que sorte a nossa de ter você por perto! — Bianca',
      'Você ilumina qualquer ambiente. Parabéns! — Rafa',
      'Um brinde a mais um ano incrível! — Lu',
    ],
  }),
}
