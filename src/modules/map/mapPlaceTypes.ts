import type { MapPlaceType } from '@/api/types'

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

export const MAP_PLACE_TYPE_OPTIONS = Object.entries(MAP_PLACE_TYPE_LABELS).map(([value, label]) => ({
  value: value as MapPlaceType,
  label,
}))
