import type { ExperienceContent } from '@/templates/types'

/** Monta ExperienceContent mínimo para o AlbumLayout standalone. */
export function buildAlbumExperienceContent(input: {
  title?: string | null
  subtitle?: string | null
  closingMessage?: string | null
  signature?: string | null
  photos: Array<{
    id: string
    url: string
    sort_order?: number
    title?: string | null
    caption?: string | null
  }>
}): ExperienceContent {
  return {
    honoreeName: '',
    senderName: input.signature ?? '',
    title: input.title ?? 'Meu álbum',
    subtitle: input.subtitle ?? '',
    message: '',
    messages: input.photos.map((p) => p.caption ?? ''),
    closingMessage: input.closingMessage ?? '',
    includeOpeningMessage: false,
    includeClosingMessage: Boolean(input.closingMessage),
    question: '',
    celebration: '',
    signature: input.signature ?? '',
    specialDate: null,
    photos: input.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      type: 'photo' as const,
    })),
    videoUrl: null,
    music: { url: null, title: '' },
    timeline: input.photos.map((photo) => ({
      title: photo.title ?? '',
      description: photo.caption ?? undefined,
    })),
    eventInfo: null,
    effects: [],
    sectionOrder: null,
    photoStyle: null,
    textStyle: null,
    slug: '',
    viewsCount: null,
  }
}
