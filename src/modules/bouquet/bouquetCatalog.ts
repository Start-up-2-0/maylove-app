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

const bouquetAsset = (file: string) => `/bouquet/${file}`

export interface BouquetFlowerDefinition {
  id: BouquetFlowerId
  label: string
  meaning: string
  image: string
}

export interface BouquetCombination {
  id: string
  label: string
  description: string
  flowerIds: BouquetFlowerId[]
}

export const BOUQUET_MAX_STEMS = 7

export const BOUQUET_GREENERY_IMAGE = bouquetAsset('greenery-base-aMPcMOwV.png')

export const BOUQUET_FLOWERS: BouquetFlowerDefinition[] = [
  { id: 'red_rose', label: 'Rosa vermelha', meaning: 'Amor profundo', image: bouquetAsset('head-red-rose-DOw4zvrA.png') },
  { id: 'pink_peony', label: 'Peônia rosa', meaning: 'Romance', image: bouquetAsset('head-pink-peony-CHAFwrJR.png') },
  { id: 'white_lily', label: 'Lírio branco', meaning: 'Devoção', image: bouquetAsset('head-white-lily-CsQ_uL1z.png') },
  { id: 'ranunculus', label: 'Ranúnculo', meaning: 'Charme', image: bouquetAsset('head-orange-ranunculus-Ctl3-6Mb.png') },
  { id: 'lilac_tulip', label: 'Tulipa lilás', meaning: 'Carinho', image: bouquetAsset('head-purple-tulip-DJzNUb9f.png') },
  { id: 'sunflower', label: 'Girassol', meaning: 'Adoração', image: bouquetAsset('head-sunflower-Dsvxq3yQ.png') },
  { id: 'lavender', label: 'Lavanda', meaning: 'Amor sereno', image: bouquetAsset('head-lavender-F_JZu-jF.png') },
  { id: 'babys_breath', label: 'Gipsófila', meaning: 'Coração puro', image: bouquetAsset('head-babys-breath-DBtFJ_Qo.png') },
]

export const BOUQUET_COMBINATIONS: BouquetCombination[] = [
  {
    id: 'passionate',
    label: 'Amor intenso',
    description: 'Paixão, romance e devoção.',
    flowerIds: ['red_rose', 'pink_peony', 'white_lily'],
  },
  {
    id: 'joyful',
    label: 'Alegria e admiração',
    description: 'Uma composição luminosa, carinhosa e cheia de encanto.',
    flowerIds: ['sunflower', 'ranunculus', 'lilac_tulip'],
  },
  {
    id: 'serene',
    label: 'Amor sereno',
    description: 'Delicadeza, pureza e afeto tranquilo.',
    flowerIds: ['lavender', 'babys_breath', 'white_lily'],
  },
]

export function getBouquetCombination(id: string): BouquetCombination | undefined {
  return BOUQUET_COMBINATIONS.find((combination) => combination.id === id)
}

export const BOUQUET_WRAP_COLORS: Array<{ id: WrapColorId; label: string; swatch: string; glow: string }> = [
  {
    id: 'blush',
    label: 'Blush',
    swatch: 'linear-gradient(135deg, #f2d4cf, #d9a8a0)',
    glow: 'hsl(345 60% 70%)',
  },
  {
    id: 'cream',
    label: 'Creme',
    swatch: 'linear-gradient(135deg, #f5efe3, #dcc9ad)',
    glow: 'hsl(35 50% 75%)',
  },
  {
    id: 'burgundy',
    label: 'Burgundy',
    swatch: 'linear-gradient(135deg, #8f3a4a, #4a1420)',
    glow: 'hsl(345 50% 35%)',
  },
]

export const BOUQUET_LETTER_DESIGNS: Array<{ id: LetterDesignId; label: string; tagline: string; emoji: string }> = [
  { id: 'classic', label: 'Classic', tagline: 'Suave e simples', emoji: '❤️' },
  { id: 'romantic', label: 'Romantic', tagline: 'Ornamentado e elegante', emoji: '💛' },
]

export function getFlower(id: string): BouquetFlowerDefinition | undefined {
  return BOUQUET_FLOWERS.find((f) => f.id === id)
}

export function getWrapGlow(id: WrapColorId): string {
  return BOUQUET_WRAP_COLORS.find((w) => w.id === id)?.glow ?? BOUQUET_WRAP_COLORS[0].glow
}
