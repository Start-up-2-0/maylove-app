export type BouquetPreviewSize = 'sm' | 'md' | 'lg'

export const BOUQUET_PREVIEW_SIZES: Record<BouquetPreviewSize, number> = {
  sm: 240,
  md: 360,
  lg: 460,
}

export interface BouquetStemLayout {
  x: number
  y: number
  scale: number
}

/** Posições normalizadas (0–1) — espelho do BouquetDisplay do exemplo. */
export const BOUQUET_LAYOUT_BY_COUNT: Record<number, BouquetStemLayout[]> = {
  1: [{ x: 0.5, y: 0.42, scale: 1 }],
  2: [
    { x: 0.4, y: 0.42, scale: 0.95 },
    { x: 0.6, y: 0.42, scale: 0.95 },
  ],
  3: [
    { x: 0.5, y: 0.36, scale: 0.95 },
    { x: 0.36, y: 0.48, scale: 0.85 },
    { x: 0.64, y: 0.48, scale: 0.85 },
  ],
  4: [
    { x: 0.42, y: 0.34, scale: 0.9 },
    { x: 0.6, y: 0.36, scale: 0.9 },
    { x: 0.34, y: 0.5, scale: 0.82 },
    { x: 0.62, y: 0.52, scale: 0.82 },
  ],
  5: [
    { x: 0.5, y: 0.32, scale: 0.92 },
    { x: 0.34, y: 0.42, scale: 0.82 },
    { x: 0.66, y: 0.42, scale: 0.82 },
    { x: 0.42, y: 0.54, scale: 0.8 },
    { x: 0.6, y: 0.55, scale: 0.8 },
  ],
  6: [
    { x: 0.42, y: 0.3, scale: 0.85 },
    { x: 0.6, y: 0.32, scale: 0.85 },
    { x: 0.3, y: 0.44, scale: 0.78 },
    { x: 0.5, y: 0.46, scale: 0.85 },
    { x: 0.7, y: 0.45, scale: 0.78 },
    { x: 0.45, y: 0.58, scale: 0.78 },
  ],
  7: [
    { x: 0.5, y: 0.28, scale: 0.85 },
    { x: 0.34, y: 0.36, scale: 0.78 },
    { x: 0.66, y: 0.36, scale: 0.78 },
    { x: 0.42, y: 0.48, scale: 0.82 },
    { x: 0.6, y: 0.48, scale: 0.82 },
    { x: 0.32, y: 0.58, scale: 0.72 },
    { x: 0.68, y: 0.58, scale: 0.72 },
  ],
}

export function resolvePreviewSize(
  preferred: BouquetPreviewSize,
  viewportWidth: number,
): BouquetPreviewSize {
  if (preferred === 'lg') {
    if (viewportWidth < 420) return 'sm'
    if (viewportWidth < 768) return 'md'
    return 'lg'
  }
  if (preferred === 'md' && viewportWidth < 380) return 'sm'
  return preferred
}

export function getStemLayouts(count: number): BouquetStemLayout[] {
  if (count <= 0) return []
  const layouts = BOUQUET_LAYOUT_BY_COUNT[Math.min(count, 7)] ?? BOUQUET_LAYOUT_BY_COUNT[7]
  return layouts.slice(0, count)
}

export function stemRotation(index: number): number {
  return (index * 47) % 30 - 15
}

export function stemPixelSize(stageSize: number, scale: number): number {
  return stageSize * 0.34 * scale
}
