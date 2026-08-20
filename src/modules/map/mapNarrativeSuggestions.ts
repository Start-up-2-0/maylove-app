import type { MapPlaceType } from '@/api/types'

export interface MapNarrativeSuggestion {
  id: string
  label: string
  emoji: string
  placeType: MapPlaceType
  title: string
  descriptionPrompt: string
}

export const MAP_NARRATIVE_SUGGESTIONS: MapNarrativeSuggestion[] = [
  {
    id: 'first-meeting',
    label: 'Onde nos conhecemos',
    emoji: '✨',
    placeType: 'first_meeting',
    title: 'Onde tudo começou',
    descriptionPrompt: 'Conte como vocês se conheceram e o detalhe que tornou esse dia inesquecível.',
  },
  {
    id: 'first-date',
    label: 'Primeiro encontro',
    emoji: '☕',
    placeType: 'first_date',
    title: 'Nosso primeiro encontro',
    descriptionPrompt: 'O que fizeram, como se sentiram e qual lembrança desse encontro ainda faz vocês sorrirem?',
  },
  {
    id: 'first-kiss',
    label: 'Primeiro beijo',
    emoji: '💋',
    placeType: 'first_kiss',
    title: 'Nosso primeiro beijo',
    descriptionPrompt: 'Descreva o momento, a atmosfera e o que mudou depois daquele beijo.',
  },
  {
    id: 'trip',
    label: 'Viagem marcante',
    emoji: '✈️',
    placeType: 'trip',
    title: 'Uma viagem inesquecível',
    descriptionPrompt: 'Conte a aventura favorita de vocês e por que esse destino se tornou especial.',
  },
  {
    id: 'proposal',
    label: 'O pedido',
    emoji: '💍',
    placeType: 'proposal',
    title: 'O nosso sim',
    descriptionPrompt: 'Conte como aconteceu o pedido e a emoção de viver esse momento juntos.',
  },
  {
    id: 'home',
    label: 'Nosso cantinho',
    emoji: '🏡',
    placeType: 'home',
    title: 'Nosso cantinho',
    descriptionPrompt: 'O que faz desse lugar um lar e quais memórias vocês construíram aqui?',
  },
]
