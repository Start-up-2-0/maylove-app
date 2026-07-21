import type { TributeEventInfo } from '@/api/types'

export function hasEventInfo(eventInfo?: TributeEventInfo | null): boolean {
  if (!eventInfo) return false
  return Boolean(
    eventInfo.date?.trim() || eventInfo.location?.trim() || eventInfo.map_url?.trim(),
  )
}

export function summarizeEventInfo(eventInfo?: TributeEventInfo | null): string {
  if (!hasEventInfo(eventInfo)) return ''
  const parts = [eventInfo?.date?.trim(), eventInfo?.location?.trim()].filter(Boolean)
  return parts.join(' · ')
}
