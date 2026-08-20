import { describe, expect, it } from 'vitest'
import {
  BOUQUET_COMBINATIONS,
  BOUQUET_FLOWERS,
  BOUQUET_MAX_STEMS,
  getBouquetCombination,
  getFlower,
} from './bouquetCatalog'
import { NEW_BOUQUET_DESCRIPTION } from './bouquetCopy'

describe('bouquetCatalog', () => {
  it('keeps every suggested flower available in the catalog', () => {
    for (const combination of BOUQUET_COMBINATIONS) {
      expect(combination.flowerIds.length).toBeGreaterThan(1)
      expect(combination.flowerIds.length).toBeLessThanOrEqual(BOUQUET_MAX_STEMS)
      for (const flowerId of combination.flowerIds) {
        expect(getFlower(flowerId), `${combination.id}: ${flowerId}`).toBeDefined()
      }
    }
  })

  it('uses stable unique identifiers', () => {
    expect(new Set(BOUQUET_FLOWERS.map((flower) => flower.id)).size).toBe(BOUQUET_FLOWERS.length)
    expect(new Set(BOUQUET_COMBINATIONS.map((combination) => combination.id)).size).toBe(BOUQUET_COMBINATIONS.length)
    expect(getBouquetCombination('passionate')?.label).toBe('Amor intenso')
  })

  it('describes the product as digital without implying physical delivery', () => {
    const copy = NEW_BOUQUET_DESCRIPTION.toLocaleLowerCase('pt-BR')
    expect(copy).toContain('digital')
    expect(copy).toContain('link')
    expect(copy).not.toContain('físic')
    expect(copy).not.toContain('entrega')
  })
})
