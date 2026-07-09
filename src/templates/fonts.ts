/**
 * Fontes de destaque disponíveis para personalização (títulos da homenagem).
 * Todas já carregadas em index.html. Guardamos a família CSS diretamente em
 * content_json.font. Adicionar uma nova = incluir a fonte no index.html + item aqui.
 */
export interface DisplayFont {
  id: string
  label: string
  /** Família CSS aplicada em --exp-font-display. */
  value: string
}

export const DISPLAY_FONTS: DisplayFont[] = [
  { id: 'fraunces', label: 'Fraunces', value: "'Fraunces', serif" },
  { id: 'playfair', label: 'Playfair Display', value: "'Playfair Display', serif" },
  { id: 'cormorant', label: 'Cormorant', value: "'Cormorant Garamond', serif" },
  { id: 'cinzel', label: 'Cinzel', value: "'Cinzel', serif" },
  { id: 'space', label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { id: 'josefin', label: 'Josefin Sans', value: "'Josefin Sans', sans-serif" },
  { id: 'poppins', label: 'Poppins', value: "'Poppins', sans-serif" },
  { id: 'fredoka', label: 'Fredoka', value: "'Fredoka', sans-serif" },
  { id: 'dancing', label: 'Dancing Script', value: "'Dancing Script', cursive" },
  { id: 'caveat', label: 'Caveat', value: "'Caveat', cursive" },
  { id: 'elite', label: 'Special Elite', value: "'Special Elite', monospace" },
]
