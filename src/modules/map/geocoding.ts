export interface GeocodeResult {
  label: string
  latitude: number
  longitude: number
  city?: string | null
  country?: string | null
}

let lastRequestAt = 0

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastRequestAt))
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastRequestAt = Date.now()

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', trimmed)
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '6')

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return []

  const data = (await response.json()) as Array<{
    display_name: string
    lat: string
    lon: string
    address?: { city?: string; town?: string; village?: string; country_code?: string }
  }>

  return data.map((item) => ({
    label: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    city: item.address?.city ?? item.address?.town ?? item.address?.village ?? null,
    country: item.address?.country_code?.toUpperCase() ?? null,
  }))
}
