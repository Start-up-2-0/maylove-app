/** Estilos de moldura Polaroid dos álbuns. */

export type BookFrameStyle =
  | 'classic'
  | 'cream'
  | 'charcoal'
  | 'kraft'
  | 'blush'
  | 'ink'

export interface BookFrameStyleOption {
  id: BookFrameStyle
  label: string
  hint: string
}

export const BOOK_FRAME_STYLES: BookFrameStyleOption[] = [
  {
    id: 'classic',
    label: 'Clássica',
    hint: 'Branco polaroid, sombra seca',
  },
  {
    id: 'cream',
    label: 'Creme',
    hint: 'Marfim aquecido, look vintage',
  },
  {
    id: 'charcoal',
    label: 'Carvão',
    hint: 'Moldura escura, contraste alto',
  },
  {
    id: 'kraft',
    label: 'Kraft',
    hint: 'Papel craft, textura artesanal',
  },
  {
    id: 'blush',
    label: 'Blush',
    hint: 'Rosa suave MayLov',
  },
  {
    id: 'ink',
    label: 'Tinta',
    hint: 'Borda gráfica navy',
  },
]

export const DEFAULT_BOOK_FRAME_STYLE: BookFrameStyle = 'classic'

export function normalizeFrameStyle(raw?: string | null): BookFrameStyle {
  const match = BOOK_FRAME_STYLES.find((item) => item.id === raw)
  return match?.id ?? DEFAULT_BOOK_FRAME_STYLE
}
