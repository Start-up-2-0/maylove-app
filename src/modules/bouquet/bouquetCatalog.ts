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

/** PNGs fotorealistas — hospedar em /public/bouquet na F2. */
const BOUQUET_CDN = 'https://digitalloveletters.com/assets'
const cdn = (file: string) => `${BOUQUET_CDN}/${file}`

export interface BouquetFlowerDefinition {
  id: BouquetFlowerId
  label: string
  meaning: string
  image: string
}

export const BOUQUET_MAX_STEMS = 7

export const BOUQUET_GREENERY_IMAGE = cdn('greenery-base-aMPcMOwV.png')

export const BOUQUET_FLOWERS: BouquetFlowerDefinition[] = [
  { id: 'red_rose', label: 'Rosa vermelha', meaning: 'Amor profundo', image: cdn('head-red-rose-DOw4zvrA.png') },
  { id: 'pink_peony', label: 'Peônia rosa', meaning: 'Romance', image: cdn('head-pink-peony-CHAFwrJR.png') },
  { id: 'white_lily', label: 'Lírio branco', meaning: 'Devoção', image: cdn('head-white-lily-CsQ_uL1z.png') },
  { id: 'ranunculus', label: 'Ranúnculo', meaning: 'Charme', image: cdn('head-orange-ranunculus-Ctl3-6Mb.png') },
  { id: 'lilac_tulip', label: 'Tulipa lilás', meaning: 'Carinho', image: cdn('head-purple-tulip-DJzNUb9f.png') },
  { id: 'sunflower', label: 'Girassol', meaning: 'Adoração', image: cdn('head-sunflower-Dsvxq3yQ.png') },
  { id: 'lavender', label: 'Lavanda', meaning: 'Amor sereno', image: cdn('head-lavender-F_JZu-jF.png') },
  { id: 'babys_breath', label: 'Gipsófila', meaning: 'Coração puro', image: cdn('head-babys-breath-DBtFJ_Qo.png') },
]

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
