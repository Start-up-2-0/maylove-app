import type { MapPlace, MapPlaceType } from '@/api/types'
import { parsePlaceContent } from './mapPlaceContent'

export const MAP_PLACE_TYPE_LABELS: Record<MapPlaceType, string> = {
  first_meeting: 'Primeiro encontro',
  first_date: 'Primeiro encontro romântico',
  first_kiss: 'Primeiro beijo',
  proposal: 'Pedido',
  wedding: 'Casamento',
  anniversary: 'Aniversário',
  trip: 'Viagem',
  vacation: 'Férias',
  restaurant: 'Restaurante',
  home: 'Nosso lar',
  milestone: 'Marco importante',
  other: 'Outro',
}

export const MAP_PLACE_TYPE_EMOJIS: Record<MapPlaceType, string> = {
  first_meeting: '☕',
  first_date: '🍷',
  first_kiss: '💋',
  proposal: '💍',
  wedding: '⛪',
  anniversary: '🎂',
  trip: '✈️',
  vacation: '🏖️',
  restaurant: '🍽️',
  home: '🏡',
  milestone: '⭐',
  other: '📍',
}

export const MAP_PLACE_TYPE_OPTIONS = Object.entries(MAP_PLACE_TYPE_LABELS).map(([value, label]) => ({
  value: value as MapPlaceType,
  label: `${MAP_PLACE_TYPE_EMOJIS[value as MapPlaceType]} ${label}`,
}))

export const SENTIMENT_OPTIONS = [
  { value: 'happiness', label: 'Felicidade', emoji: '😊' },
  { value: 'love', label: 'Amor', emoji: '❤️' },
  { value: 'excitement', label: 'Emoção', emoji: '✨' },
  { value: 'gratitude', label: 'Gratidão', emoji: '🙏' },
  { value: 'nostalgia', label: 'Saudade', emoji: '🥹' },
  { value: 'peace', label: 'Paz', emoji: '🕊️' },
] as const

export function getPlaceEmoji(place: MapPlace): string {
  const custom = parsePlaceContent(place).custom_emoji
  if (custom) return custom
  return MAP_PLACE_TYPE_EMOJIS[place.place_type] ?? '📍'
}

export function getSentimentLabel(value?: string | null): string {
  if (!value) return ''
  return SENTIMENT_OPTIONS.find((s) => s.value === value)?.label ?? value
}

export function getSentimentEmoji(value?: string | null): string {
  if (!value) return ''
  return SENTIMENT_OPTIONS.find((s) => s.value === value)?.emoji ?? '💫'
}
