import type {
  MusicTrack,
  TributeDetail,
  TributeMedia,
  TributeSummary,
} from '@/api/types'
import {
  buildPhoto,
  buildTribute,
  initialTributes,
  mockMusicTracks,
  mockTemplates,
  mockTributeTypes,
} from './fixtures'

/**
 * "Banco" em memoria para manter a navegacao coerente entre create/patch/reorder/delete
 * enquanto os mocks estao ativos. O estado reseta a cada reload da pagina.
 */
const tributes = new Map<string, TributeDetail>()

for (const tribute of initialTributes()) {
  tributes.set(tribute.id, tribute)
}

let idSeq = 0

function nextId(prefix: string): string {
  idSeq += 1
  return `${prefix}-${Date.now().toString(36)}-${idSeq}`
}

function touch(tribute: TributeDetail): void {
  tribute.updated_at = new Date().toISOString()
}

export const db = {
  listTributes(status?: string): TributeSummary[] {
    return Array.from(tributes.values())
      .filter((tribute) => (status ? tribute.status === status : true))
      .map((tribute) => ({
        id: tribute.id,
        slug: tribute.slug,
        status: tribute.status,
        title: tribute.title,
        honoree_name: tribute.honoree_name,
        views_count: tribute.views_count,
        published_at: tribute.published_at,
        created_at: tribute.created_at,
        tribute_type: tribute.tribute_type,
        template: {
          id: tribute.template.id,
          slug: tribute.template.slug,
          name: tribute.template.name,
        },
        color_primary: tribute.color_primary,
      }))
  },

  getTribute(id: string): TributeDetail | undefined {
    return tributes.get(id)
  },

  getTributeBySlug(slug: string): TributeDetail | undefined {
    return Array.from(tributes.values()).find((tribute) => tribute.slug === slug)
  },

  createTribute(tributeTypeId: string, templateId: string): TributeDetail {
    const typeIndex = Math.max(
      0,
      mockTributeTypes.findIndex((type) => type.id === tributeTypeId),
    )
    const templateIndex = Math.max(
      0,
      mockTemplates.findIndex((template) => template.id === templateId),
    )
    const id = nextId('tribute')
    const tribute = buildTribute({
      id,
      slug: `homenagem-${id.slice(-6)}`,
      status: 'draft',
      typeIndex,
      templateIndex,
      photos: 0,
      effects: [],
    })
    tributes.set(id, tribute)
    return tribute
  },

  updateTribute(id: string, payload: Record<string, unknown>): TributeDetail | undefined {
    const tribute = tributes.get(id)
    if (!tribute) return undefined

    const assignable: Array<keyof TributeDetail> = [
      'title',
      'subtitle',
      'honoree_name',
      'message',
      'closing_message',
      'special_date',
      'slug',
      'color_primary',
    ]
    for (const key of assignable) {
      if (key in payload) {
        // @ts-expect-error atribuicao dinamica controlada pela allowlist acima
        tribute[key] = payload[key] ?? null
      }
    }

    if (typeof payload.music_source === 'string') {
      tribute.music_source = payload.music_source as TributeDetail['music_source']
      tribute.music.source = tribute.music_source
    }
    if ('music_track_id' in payload) {
      const trackId = (payload.music_track_id as string | null) ?? null
      tribute.music_track_id = trackId
      tribute.music.track_id = trackId
      tribute.music.track = trackId
        ? mockMusicTracks.find((track) => track.id === trackId) ?? null
        : null
    }
    if (payload.content_json && typeof payload.content_json === 'object') {
      // Mescla para preservar o conteudo rico (timeline, mensagens, etc.) que o
      // wizard ainda nao edita, atualizando apenas os campos enviados.
      tribute.content_json = {
        ...tribute.content_json,
        ...(payload.content_json as TributeDetail['content_json']),
      }
    }

    touch(tribute)
    return tribute
  },

  publishTribute(id: string): TributeDetail | undefined {
    const tribute = tributes.get(id)
    if (!tribute) return undefined
    tribute.status = 'published'
    tribute.published_at = new Date().toISOString()
    touch(tribute)
    return tribute
  },

  addPhoto(tributeId: string, mediaId: string): TributeMedia | undefined {
    const tribute = tributes.get(tributeId)
    if (!tribute) return undefined
    const photo = buildPhoto(tributeId, tribute.media.length)
    photo.id = mediaId
    tribute.media.push(photo)
    touch(tribute)
    return photo
  },

  addAudio(tributeId: string, mediaId: string): TributeMedia | undefined {
    const tribute = tributes.get(tributeId)
    if (!tribute) return undefined
    const audio: TributeMedia = {
      id: mediaId,
      storage_file_id: `sf-${mediaId}`,
      media_type: 'audio',
      original_filename: 'trilha.mp3',
      mime_type: 'audio/mpeg',
      size_bytes: 2_400_000,
      sort_order: tribute.media.length,
      url_thumbnail: null,
      url: null,
      created_at: new Date().toISOString(),
    }
    tribute.media.push(audio)
    tribute.music_source = 'upload'
    tribute.music_media_id = mediaId
    tribute.music.source = 'upload'
    tribute.music.media_id = mediaId
    touch(tribute)
    return audio
  },

  deleteMedia(tributeId: string, mediaId: string): boolean {
    const tribute = tributes.get(tributeId)
    if (!tribute) return false
    const before = tribute.media.length
    tribute.media = tribute.media.filter((item) => item.id !== mediaId)
    tribute.media.forEach((item, index) => {
      item.sort_order = index
    })
    touch(tribute)
    return tribute.media.length !== before
  },

  reorderMedia(tributeId: string, order: string[]): boolean {
    const tribute = tributes.get(tributeId)
    if (!tribute) return false
    tribute.media.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    tribute.media.forEach((item, index) => {
      item.sort_order = index
    })
    touch(tribute)
    return true
  },

  incrementViews(slug: string): void {
    const tribute = this.getTributeBySlug(slug)
    if (tribute) {
      tribute.views_count += 1
    }
  },

  musicTracks(category?: string): MusicTrack[] {
    if (!category) return mockMusicTracks
    return mockMusicTracks.filter((track) => track.category === category)
  },
}
