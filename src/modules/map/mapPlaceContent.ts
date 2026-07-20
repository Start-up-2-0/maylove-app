import type { MapPlace } from '@/api/types'

export interface MapMomentTimelineEntry {
  id: string
  label: string
  time?: string | null
}

export interface MapPlaceRichContent {
  letter?: string | null
  people?: string[]
  weather?: string | null
  objects?: string[]
  music_url?: string | null
  music_title?: string | null
  moment_timeline?: MapMomentTimelineEntry[]
  custom_emoji?: string | null
}

export function parsePlaceContent(place: MapPlace): MapPlaceRichContent {
  const raw = place.content_json ?? {}
  return {
    letter: typeof raw.letter === 'string' ? raw.letter : null,
    people: Array.isArray(raw.people) ? raw.people.map(String) : [],
    weather: typeof raw.weather === 'string' ? raw.weather : null,
    objects: Array.isArray(raw.objects) ? raw.objects.map(String) : [],
    music_url: typeof raw.music_url === 'string' ? raw.music_url : null,
    music_title: typeof raw.music_title === 'string' ? raw.music_title : null,
    moment_timeline: Array.isArray(raw.moment_timeline)
      ? raw.moment_timeline
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map((item, index) => ({
            id: String(item.id ?? index),
            label: String(item.label ?? ''),
            time: typeof item.time === 'string' ? item.time : null,
          }))
          .filter((item) => item.label)
      : [],
    custom_emoji: typeof raw.custom_emoji === 'string' ? raw.custom_emoji : null,
  }
}

export function buildPlaceContentPayload(content: MapPlaceRichContent): Record<string, unknown> {
  return {
    letter: content.letter?.trim() || null,
    people: content.people?.filter(Boolean) ?? [],
    weather: content.weather?.trim() || null,
    objects: content.objects?.filter(Boolean) ?? [],
    music_url: content.music_url?.trim() || null,
    music_title: content.music_title?.trim() || null,
    moment_timeline: content.moment_timeline ?? [],
    custom_emoji: content.custom_emoji?.trim() || null,
  }
}

export function countPlaceMedia(place: MapPlace) {
  const media = place.media ?? []
  return {
    photos: media.filter((m) => m.media_type === 'photo').length,
    videos: media.filter((m) => m.media_type === 'video').length,
  }
}
