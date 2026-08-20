import { describe, expect, it } from 'vitest'
import { MAP_PLACE_TYPE_OPTIONS } from './mapPlaceTypes'
import { MAP_NARRATIVE_SUGGESTIONS } from './mapNarrativeSuggestions'

describe('MAP_NARRATIVE_SUGGESTIONS', () => {
  it('uses supported place types and complete copy', () => {
    const supportedTypes = new Set(MAP_PLACE_TYPE_OPTIONS.map((option) => option.value))
    for (const suggestion of MAP_NARRATIVE_SUGGESTIONS) {
      expect(supportedTypes.has(suggestion.placeType), suggestion.id).toBe(true)
      expect(suggestion.title.trim()).not.toBe('')
      expect(suggestion.descriptionPrompt.trim()).not.toBe('')
    }
  })

  it('has stable unique identifiers', () => {
    expect(new Set(MAP_NARRATIVE_SUGGESTIONS.map((suggestion) => suggestion.id)).size)
      .toBe(MAP_NARRATIVE_SUGGESTIONS.length)
  })
})
