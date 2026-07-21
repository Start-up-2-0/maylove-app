export type BouquetFlowerId =
  | 'red_rose'
  | 'pink_peony'
  | 'white_lily'
  | 'ranunculus'
  | 'lilac_tulip'
  | 'sunflower'
  | 'lavender'
  | 'babys_breath'

export type WrapColorId = 'blush' | 'cream' | 'burgundy'
export type LetterDesignId = 'classic' | 'romantic'

export interface BouquetFlowerDefinition {
  id: BouquetFlowerId
  label: string
  meaning: string
  emoji: string
  /** Posição relativa no preview (%) */
  preview: { left: number; top: number; rotate: number; scale: number }
}

export const BOUQUET_MAX_STEMS = 7

export const BOUQUET_FLOWERS: BouquetFlowerDefinition[] = [
  { id: 'red_rose', label: 'Rosa vermelha', meaning: 'Amor profundo', emoji: '🌹', preview: { left: 44, top: 18, rotate: -8, scale: 1.15 } },
  { id: 'pink_peony', label: 'Peônia rosa', meaning: 'Romance', emoji: '🌸', preview: { left: 58, top: 22, rotate: 12, scale: 1.05 } },
  { id: 'white_lily', label: 'Lírio branco', meaning: 'Devoção', emoji: '🤍', preview: { left: 36, top: 28, rotate: -4, scale: 1.1 } },
  { id: 'ranunculus', label: 'Ranúnculo', meaning: 'Charme', emoji: '🌼', preview: { left: 52, top: 32, rotate: 6, scale: 0.95 } },
  { id: 'lilac_tulip', label: 'Tulipa lilás', meaning: 'Carinho', emoji: '💜', preview: { left: 30, top: 24, rotate: -10, scale: 0.9 } },
  { id: 'sunflower', label: 'Girassol', meaning: 'Adoração', emoji: '🌻', preview: { left: 62, top: 30, rotate: 8, scale: 1 } },
  { id: 'lavender', label: 'Lavanda', meaning: 'Amor sereno', emoji: '💐', preview: { left: 48, top: 36, rotate: 0, scale: 0.85 } },
  { id: 'babys_breath', label: "Gipsófila", meaning: 'Coração puro', emoji: '✨', preview: { left: 40, top: 34, rotate: 4, scale: 0.75 } },
]

export const BOUQUET_WRAP_COLORS: Array<{ id: WrapColorId; label: string; swatch: string }> = [
  { id: 'blush', label: 'Blush', swatch: '#f2c4c4' },
  { id: 'cream', label: 'Creme', swatch: '#f5efe3' },
  { id: 'burgundy', label: 'Burgundy', swatch: '#6b1f2b' },
]

export const BOUQUET_LETTER_DESIGNS: Array<{ id: LetterDesignId; label: string; tagline: string; emoji: string }> = [
  { id: 'classic', label: 'Classic', tagline: 'Suave e simples', emoji: '❤️' },
  { id: 'romantic', label: 'Romantic', tagline: 'Ornamentado e elegante', emoji: '💛' },
]

export function getFlower(id: string): BouquetFlowerDefinition | undefined {
  return BOUQUET_FLOWERS.find((f) => f.id === id)
}

export function countStems(stems: string[]): Record<string, number> {
  return stems.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1
    return acc
  }, {})
}
