import type {
  MusicTrack,
  Template,
  TributeContentJson,
  TributeDetail,
  TributeMedia,
  TributeType,
  User,
} from '@/api/types'
import { placeholderImage } from './placeholder'
import { listTemplateDefinitions } from '@/templates/registry'
import { categoryLabel } from '@/templates/categories'

export const mockUser: User = {
  id: 'user-demo',
  email: 'demo@maylove.app',
  name: 'Ana Demo',
  email_verified: true,
}

export const mockTributeTypes: TributeType[] = [
  {
    id: 'type-aniversario',
    slug: 'aniversario',
    name: 'Aniversário',
    icon: '🎂',
    default_palette: ['#d94f7a', '#f59e0b', '#8b5cf6'],
    default_texts: {
      title: 'Feliz Aniversário!',
      message: 'Que este novo ciclo seja repleto de amor e conquistas.',
    },
    sort_order: 1,
  },
  {
    id: 'type-dia-das-maes',
    slug: 'dia-das-maes',
    name: 'Dia das Mães',
    icon: '🌷',
    default_palette: ['#ec4899', '#f472b6', '#fbcfe8'],
    default_texts: {
      title: 'Para a melhor mãe do mundo',
      message: 'Obrigada por todo amor e cuidado de sempre.',
    },
    sort_order: 2,
  },
  {
    id: 'type-namorados',
    slug: 'namorados',
    name: 'Namorados',
    icon: '❤️',
    default_palette: ['#ef4444', '#d94f7a', '#f59e0b'],
    default_texts: {
      title: 'Eu te amo',
      message: 'Cada dia ao seu lado é o meu lugar favorito.',
    },
    sort_order: 3,
  },
  {
    id: 'type-amizade',
    slug: 'amizade',
    name: 'Amizade',
    icon: '🤝',
    default_palette: ['#0ea5e9', '#10b981', '#8b5cf6'],
    default_texts: {
      title: 'Amizade que vale ouro',
      message: 'Obrigado por estar sempre presente.',
    },
    sort_order: 4,
  },
  {
    id: 'type-dia-dos-pais',
    slug: 'dia-dos-pais',
    name: 'Dia dos Pais',
    icon: '👔',
    default_palette: ['#0f766e', '#5eead4', '#0891b2'],
    default_texts: { title: 'Ao meu herói', message: 'Obrigado por tudo, pai.' },
    sort_order: 5,
  },
  {
    id: 'type-casamento',
    slug: 'casamento',
    name: 'Casamento',
    icon: '💍',
    default_palette: ['#b08968', '#ddb892', '#a16207'],
    default_texts: { title: 'Vamos nos casar', message: 'E queremos você ao nosso lado.' },
    sort_order: 6,
  },
  {
    id: 'type-cha-de-bebe',
    slug: 'cha-de-bebe',
    name: 'Chá de Bebê',
    icon: '👶',
    default_palette: ['#60a5fa', '#a5d8ff', '#f9a8d4'],
    default_texts: { title: 'Bem-vindo, pequeno amor', message: 'Já te amamos tanto!' },
    sort_order: 7,
  },
  {
    id: 'type-pedido',
    slug: 'pedido',
    name: 'Pedido de Casamento',
    icon: '💐',
    default_palette: ['#be123c', '#fb7185', '#e0245e'],
    default_texts: { title: 'Você aceita?', message: 'Quero você, para sempre.' },
    sort_order: 8,
  },
  {
    id: 'type-formatura',
    slug: 'formatura',
    name: 'Formatura',
    icon: '🎓',
    default_palette: ['#1d4ed8', '#fbbf24', '#0891b2'],
    default_texts: { title: 'Parabéns, formando!', message: 'Este é só o começo!' },
    sort_order: 9,
  },
  {
    id: 'type-natal',
    slug: 'natal',
    name: 'Natal',
    icon: '🎄',
    default_palette: ['#c1121f', '#e5c07b', '#0d2818'],
    default_texts: { title: 'Feliz Natal', message: 'Que seu Natal seja repleto de luz.' },
    sort_order: 10,
  },
  {
    id: 'type-ano-novo',
    slug: 'ano-novo',
    name: 'Ano Novo',
    icon: '🎆',
    default_palette: ['#eab308', '#fde68a', '#131a33'],
    default_texts: { title: 'Um brinde ao novo ano', message: 'Que venha um ano de conquistas!' },
    sort_order: 11,
  },
  {
    id: 'type-dia-da-mulher',
    slug: 'dia-da-mulher',
    name: 'Dia da Mulher',
    icon: '🌸',
    default_palette: ['#9333ea', '#e879f9', '#ec4899'],
    default_texts: { title: 'À sua força e delicadeza', message: 'Você transforma o mundo.' },
    sort_order: 12,
  },
  {
    id: 'type-dia-dos-professores',
    slug: 'dia-dos-professores',
    name: 'Dia dos Professores',
    icon: '👩‍🏫',
    default_palette: ['#0891b2', '#f59e0b', '#10b981'],
    default_texts: { title: 'Obrigado, professor(a)', message: 'Gratidão por tudo que nos ensinou.' },
    sort_order: 13,
  },
  {
    id: 'type-memorial',
    slug: 'memorial',
    name: 'Memorial',
    icon: '🕊️',
    default_palette: ['#c9a86a', '#e7d3a6', '#14110f'],
    default_texts: { title: 'Em memória', message: 'Para sempre em nossos corações.' },
    sort_order: 14,
  },
  {
    id: 'type-carta',
    slug: 'carta',
    name: 'Carta Digital',
    icon: '💌',
    default_palette: ['#b4763f', '#d8a15f', '#a16207'],
    default_texts: { title: 'Uma carta para você', message: 'Palavras que eu guardava.' },
    sort_order: 15,
  },
  {
    id: 'type-historia',
    slug: 'historia',
    name: 'História de Vida',
    icon: '📖',
    default_palette: ['#a16207', '#d4a373', '#0f766e'],
    default_texts: { title: 'A história da nossa vida', message: 'E a história continua...' },
    sort_order: 16,
  },
  {
    id: 'type-homenagem',
    slug: 'homenagem',
    name: 'Homenagem',
    icon: '💗',
    default_palette: ['#d94f7a', '#8b5cf6', '#f59e0b'],
    default_texts: { title: 'Uma homenagem especial', message: 'Com admiração e carinho.' },
    sort_order: 17,
  },
]

/**
 * Catálogo de templates gerado a partir do TEMPLATE_REGISTRY (fonte única).
 * Assim, qualquer modelo adicionado à biblioteca aparece automaticamente no
 * catálogo mock, na galeria e no fluxo de criação — sem duplicar dados.
 */
export const mockTemplates: Template[] = listTemplateDefinitions().map((def) => ({
  id: `tpl-${def.slug}`,
  slug: def.slug,
  name: def.name,
  category: {
    id: `cat-${def.category}`,
    slug: def.category,
    name: categoryLabel(def.category),
  },
  thumbnail_url: placeholderImage(def.slug, def.name),
  primary_color: def.theme.primaryColor,
  max_photos: def.capabilities.maxPhotos,
  supports_video: def.capabilities.supportsVideo,
  supports_music: def.capabilities.supportsMusic,
  has_animation: true,
  config_json: { experience: true },
}))

export const mockMusicTracks: MusicTrack[] = [
  {
    id: 'track-1',
    slug: 'acorde-do-coracao',
    title: 'Acorde do Coração',
    artist: 'MayLove Studio',
    duration_seconds: 142,
    category: 'Romântica',
    preview_url: '',
    file_url: '',
  },
  {
    id: 'track-2',
    slug: 'luz-da-manha',
    title: 'Luz da Manhã',
    artist: 'MayLove Studio',
    duration_seconds: 168,
    category: 'Romântica',
    preview_url: '',
    file_url: '',
  },
  {
    id: 'track-3',
    slug: 'festa-surpresa',
    title: 'Festa Surpresa',
    artist: 'MayLove Studio',
    duration_seconds: 121,
    category: 'Animada',
    preview_url: '',
    file_url: '',
  },
  {
    id: 'track-4',
    slug: 'brinde-feliz',
    title: 'Brinde Feliz',
    artist: 'MayLove Studio',
    duration_seconds: 133,
    category: 'Animada',
    preview_url: '',
    file_url: '',
  },
  {
    id: 'track-5',
    slug: 'memorias-suaves',
    title: 'Memórias Suaves',
    artist: 'MayLove Studio',
    duration_seconds: 195,
    category: 'Instrumental',
    preview_url: '',
    file_url: '',
  },
]

export const mockMusicCategories = ['Romântica', 'Animada', 'Instrumental']

let mediaSeq = 0

export function buildPhoto(tributeId: string, sortOrder: number): TributeMedia {
  mediaSeq += 1
  const id = `media-${tributeId}-${mediaSeq}`
  const image = placeholderImage(id, `Foto ${sortOrder + 1}`)
  return {
    id,
    storage_file_id: `sf-${id}`,
    media_type: 'photo',
    original_filename: `foto-${sortOrder + 1}.jpg`,
    mime_type: 'image/jpeg',
    size_bytes: 512_000,
    sort_order: sortOrder,
    url_thumbnail: image,
    url: image,
    created_at: new Date().toISOString(),
  }
}

interface BuildTributeOptions {
  id: string
  slug: string
  status?: string
  typeIndex?: number
  templateIndex?: number
  templateSlug?: string
  title?: string | null
  subtitle?: string | null
  honoreeName?: string | null
  message?: string | null
  closingMessage?: string | null
  specialDate?: string | null
  photos?: number
  effects?: string[]
  content?: Partial<TributeContentJson>
  viewsCount?: number
  publishedAt?: string | null
}

export function buildTribute(options: BuildTributeOptions): TributeDetail {
  const type = mockTributeTypes[options.typeIndex ?? 0]
  const template = options.templateSlug
    ? mockTemplates.find((item) => item.slug === options.templateSlug) ?? mockTemplates[0]
    : mockTemplates[options.templateIndex ?? 0]
  const now = new Date().toISOString()
  const media: TributeMedia[] = Array.from({ length: options.photos ?? 0 }, (_, index) =>
    buildPhoto(options.id, index),
  )

  return {
    id: options.id,
    slug: options.slug,
    status: options.status ?? 'draft',
    title: options.title ?? null,
    subtitle: options.subtitle ?? null,
    honoree_name: options.honoreeName ?? null,
    message: options.message ?? null,
    closing_message: options.closingMessage ?? null,
    special_date: options.specialDate ?? null,
    color_primary: template.primary_color,
    music_source: 'none',
    music_track_id: null,
    music_media_id: null,
    music: {
      source: 'none',
      track_id: null,
      media_id: null,
      track: null,
      url: null,
      preview_url: null,
    },
    content_json: { effects: options.effects ?? [], ...(options.content ?? {}) },
    og_image_url: null,
    views_count: options.viewsCount ?? 0,
    published_at: options.publishedAt ?? null,
    created_at: now,
    updated_at: now,
    tribute_type: { id: type.id, slug: type.slug, name: type.name },
    template,
    media,
  }
}

export function initialTributes(): TributeDetail[] {
  const daysAhead = (days: number) => new Date(Date.now() + 86_400_000 * days).toISOString()
  const daysAgo = (days: number) => new Date(Date.now() - 86_400_000 * days).toISOString()

  return [
    // Rascunho editável no wizard (template Namorados).
    buildTribute({
      id: 'tribute-rascunho',
      slug: 'ana-e-joao',
      status: 'draft',
      typeIndex: 2,
      templateSlug: 'namorados',
      title: 'Para o meu amor',
      subtitle: 'Uma história que escolho viver todos os dias',
      honoreeName: 'João',
      message: 'Você é o meu lugar favorito no mundo.',
      closingMessage: 'Te amo hoje, amanhã e sempre.',
      specialDate: '2021-06-12T00:00:00.000Z',
      photos: 5,
      effects: ['hearts'],
      content: {
        sender_name: 'Ana',
        signature: 'Ana',
        messages: [
          'Com você aprendi que amar é também cuidar dos detalhes.',
          'Cada dia ao seu lado é o meu lugar favorito.',
          'Obrigada por transformar o comum em extraordinário.',
        ],
        timeline: [
          { date: 'Jun 2021', title: 'O primeiro olhar', description: 'Foi só um café que virou horas de conversa.', photo_url: placeholderImage('tl-namoro-1', '2021') },
          { date: 'Dez 2021', title: 'A primeira viagem', description: 'Descobrimos que juntos qualquer lugar é casa.', photo_url: placeholderImage('tl-namoro-2', '2021') },
          { date: 'Ago 2023', title: 'Nosso lar', description: 'As chaves, as caixas e um recomeço a dois.', photo_url: placeholderImage('tl-namoro-3', '2023') },
        ],
      },
      viewsCount: 0,
    }),
    // Aniversário publicado.
    buildTribute({
      id: 'tribute-publicada',
      slug: 'feliz-aniversario-maria',
      status: 'published',
      typeIndex: 0,
      templateSlug: 'aniversario',
      title: 'Feliz Aniversário, Maria!',
      subtitle: 'Hoje o mundo comemora você',
      honoreeName: 'Maria',
      message: 'Que seu dia seja tão especial quanto você é para todos nós.',
      closingMessage: 'Que venham muitos anos de alegria!',
      specialDate: daysAhead(18),
      photos: 6,
      effects: ['confetti'],
      content: {
        sender_name: 'Seus amigos',
        signature: 'Com amor, todos nós',
        messages: [
          'Que sorte a nossa de ter você por perto! — Bianca',
          'Você ilumina qualquer ambiente. Feliz aniversário! — Rafa',
          'Um brinde a mais um ano incrível ao seu lado! — Lu',
        ],
      },
      viewsCount: 128,
      publishedAt: daysAgo(3),
    }),
    // Carta digital publicada.
    buildTribute({
      id: 'tribute-carta',
      slug: 'carta-para-voce',
      status: 'published',
      typeIndex: 1,
      templateSlug: 'carta-digital',
      title: 'Uma carta para você',
      subtitle: 'Palavras que eu guardava há tempo demais',
      honoreeName: 'Mãe',
      message:
        'Sento para escrever e percebo que não há palavras suficientes.\nObrigada por cada abraço, cada conselho e cada silêncio que dizia tudo.',
      closingMessage: 'Você é o meu maior exemplo de amor.',
      photos: 3,
      effects: [],
      content: {
        sender_name: 'Sua filha',
        signature: 'Sua filha, para sempre',
        messages: [
          'Se hoje sou quem sou, é porque tive você como colo.',
          'Guardo cada memória como um tesouro.',
        ],
      },
      viewsCount: 54,
      publishedAt: daysAgo(8),
    }),
    // Memorial publicado (tema escuro).
    buildTribute({
      id: 'tribute-memorial',
      slug: 'em-memoria-jose',
      status: 'published',
      typeIndex: 3,
      templateSlug: 'memorial',
      title: 'Em memória de José',
      subtitle: '1948 — 2024',
      honoreeName: 'José',
      message: 'Uma vida dedicada ao amor, à família e aos pequenos gestos que ficam para sempre.',
      closingMessage: 'Para sempre em nossos corações.',
      photos: 6,
      effects: ['stars'],
      content: {
        sender_name: 'A família',
        signature: 'Com amor eterno, sua família',
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
      },
      viewsCount: 342,
      publishedAt: daysAgo(20),
    }),
  ]
}
