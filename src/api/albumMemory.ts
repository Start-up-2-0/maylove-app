import type { AlbumMemory, AlbumMemoryPayload } from './types'

function readMediaIds(raw: Record<string, unknown>): string[] {
  if (Array.isArray(raw.media_ids)) {
    return raw.media_ids.map(String)
  }
  const content = raw.content_json
  if (content && typeof content === 'object' && Array.isArray((content as Record<string, unknown>).media_ids)) {
    return ((content as Record<string, unknown>).media_ids as unknown[]).map(String)
  }
  return []
}

/** Normaliza resposta da API (media_ids vivem em content_json). */
export function normalizeAlbumMemory(raw: Record<string, unknown>): AlbumMemory {
  const contentJson =
    raw.content_json && typeof raw.content_json === 'object'
      ? (raw.content_json as Record<string, unknown>)
      : null

  return {
    id: String(raw.id),
    sort_order: Number(raw.sort_order ?? 0),
    title: typeof raw.title === 'string' ? raw.title : undefined,
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : undefined,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    date: typeof raw.date === 'string' ? raw.date : undefined,
    time: typeof raw.time === 'string' ? raw.time : undefined,
    location:
      raw.location && typeof raw.location === 'object'
        ? (raw.location as AlbumMemory['location'])
        : undefined,
    climate: typeof raw.climate === 'string' ? raw.climate : undefined,
    sentiment: raw.sentiment as AlbumMemory['sentiment'],
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    people: Array.isArray(raw.people) ? raw.people.map(String) : [],
    media: Array.isArray(raw.media) ? (raw.media as AlbumMemory['media']) : [],
    documents: Array.isArray(raw.documents)
      ? (raw.documents as AlbumMemory['documents'])
      : undefined,
    media_ids: readMediaIds(raw),
    content_json: contentJson,
  }
}

/** Monta payload PATCH/POST — persiste media_ids dentro de content_json (sem alterar backend). */
export function buildAlbumMemoryApiPayload(
  payload: Partial<AlbumMemoryPayload>,
  existingContentJson?: Record<string, unknown> | null,
): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (payload.sort_order !== undefined) body.sort_order = payload.sort_order
  if (payload.title !== undefined) body.title = payload.title
  if (payload.subtitle !== undefined) body.subtitle = payload.subtitle
  if (payload.description !== undefined) body.description = payload.description
  if (payload.date !== undefined) body.date = payload.date
  if (payload.time !== undefined) body.time = payload.time
  if (payload.location !== undefined) body.location = payload.location
  if (payload.climate !== undefined) body.climate = payload.climate
  if (payload.sentiment !== undefined) body.sentiment = payload.sentiment
  if (payload.tags !== undefined) body.tags = payload.tags
  if (payload.people !== undefined) body.people = payload.people

  if (payload.media_ids !== undefined) {
    body.content_json = {
      ...(existingContentJson ?? {}),
      media_ids: payload.media_ids,
    }
  }

  return body
}
