import { describe, expect, it } from 'vitest'
import {
  MAP_GLOBE_BUMP_URL,
  MAP_GLOBE_TEXTURE_URL,
  resolveMapGlobeErrorMessage,
} from './mapGlobeConfig'

describe('mapGlobeConfig', () => {
  it('loads globe textures through explicit HTTPS URLs', () => {
    expect(MAP_GLOBE_TEXTURE_URL).toMatch(/^https:\/\//)
    expect(MAP_GLOBE_BUMP_URL).toMatch(/^https:\/\//)
  })

  it('explains network failures and offers a safe map fallback', () => {
    expect(resolveMapGlobeErrorMessage(new Error('Failed to fetch dynamically imported module')))
      .toContain('conexão')
    expect(resolveMapGlobeErrorMessage(new Error('WebGL unavailable')))
      .toContain('mapa')
  })
})
