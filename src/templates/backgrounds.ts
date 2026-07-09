/**
 * Planos de fundo prontos para a experiência. Cada preset já carrega o "modo"
 * de texto adequado (claro/escuro), garantindo legibilidade independentemente do
 * template/estilo escolhido. Guardamos apenas o `id` em content_json.background.
 */
export interface BackgroundPreset {
  id: string
  label: string
  value: string
  mode: 'light' | 'dark'
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'rose', label: 'Rosé', value: 'linear-gradient(180deg, #fff5f8 0%, #ffe9f0 100%)', mode: 'light' },
  { id: 'cream', label: 'Creme', value: '#fbf7f0', mode: 'light' },
  { id: 'mint', label: 'Menta', value: 'linear-gradient(180deg, #f3fbf6 0%, #eafaf1 100%)', mode: 'light' },
  { id: 'lavender', label: 'Lavanda', value: 'linear-gradient(180deg, #faf5ff 0%, #f3ecfe 100%)', mode: 'light' },
  { id: 'sky', label: 'Céu', value: 'linear-gradient(180deg, #eff6ff 0%, #e0f2fe 100%)', mode: 'light' },
  { id: 'sand', label: 'Areia', value: 'linear-gradient(180deg, #f6f0e6 0%, #efe4cf 100%)', mode: 'light' },
  { id: 'charcoal', label: 'Grafite', value: 'linear-gradient(180deg, #0e0e12 0%, #17141c 100%)', mode: 'dark' },
  { id: 'midnight', label: 'Meia-noite', value: 'linear-gradient(180deg, #0b1020 0%, #141a2e 100%)', mode: 'dark' },
  { id: 'noir', label: 'Noir & Ouro', value: 'linear-gradient(180deg, #0c0c0c 0%, #1a1712 100%)', mode: 'dark' },
]

export const BACKGROUND_MAP: Record<string, BackgroundPreset> = Object.fromEntries(
  BACKGROUND_PRESETS.map((bg) => [bg.id, bg]),
)

export function getBackground(id: string | null | undefined): BackgroundPreset | null {
  if (!id) return null
  return BACKGROUND_MAP[id] ?? null
}
