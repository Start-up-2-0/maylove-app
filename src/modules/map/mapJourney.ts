import type { MapPlace } from '@/api/types'

export type MapViewMode = 'explore' | 'journey' | 'timeline' | 'globe'

export function sortPlacesChronologically(places: MapPlace[]): MapPlace[] {
  return [...places].sort((a, b) => {
    const da = a.memory_date ?? ''
    const db = b.memory_date ?? ''
    if (da !== db) {
      if (!da) return 1
      if (!db) return -1
      return da.localeCompare(db)
    }
    return a.sort_order - b.sort_order
  })
}

export function formatMemoryDate(value?: string | null): string {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
