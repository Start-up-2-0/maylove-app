/** Fluxo Romance — 5 etapas inspirado em Love Cards / LoveTale. */
export type RomanceStep = 'occasion' | 'couple' | 'story' | 'style' | 'finish'

export const ROMANCE_WIZARD_STEPS: RomanceStep[] = [
  'occasion',
  'couple',
  'story',
  'style',
  'finish',
]

export const ROMANCE_STEP_LABELS: Record<RomanceStep, string> = {
  occasion: 'Ocasião',
  couple: 'Vocês',
  story: 'História',
  style: 'Estilo',
  finish: 'Finalizar',
}

export const ROMANCE_STEP_DESCRIPTIONS: Record<RomanceStep, string> = {
  occasion: 'Escolha o momento que vocês estão celebrando.',
  couple: 'Quem ama quem — nomes e foto de capa.',
  story: 'Sua mensagem, momentos especiais e data marcante.',
  style: 'Visual, música e como a página será exibida.',
  finish: 'Veja a prévia e publique o presente digital.',
}

/** Tipos românticos — subconjunto do wizard de homenagens. */
export const ROMANCE_TYPE_IDS = [
  'declaracao-amor',
  'pedido-namoro',
  'pedido-casamento',
  'aniversario',
  'datas-especiais',
] as const

export type RomanceTypeId = (typeof ROMANCE_TYPE_IDS)[number]

export function isRomanceTypeId(id?: string | null): id is RomanceTypeId {
  return Boolean(id && ROMANCE_TYPE_IDS.includes(id as RomanceTypeId))
}

export function resolveRomanceStep(raw: string | undefined | null): RomanceStep {
  if (!raw) return 'occasion'
  if (ROMANCE_WIZARD_STEPS.includes(raw as RomanceStep)) return raw as RomanceStep
  const legacy: Record<string, RomanceStep> = {
    type: 'occasion',
    basics: 'couple',
    'special-date': 'story',
    story: 'story',
    texts: 'story',
    personalization: 'style',
    modules: 'style',
    review: 'finish',
    publish: 'finish',
  }
  return legacy[raw] ?? 'occasion'
}

export function nextRomanceStep(current: RomanceStep): RomanceStep | null {
  const index = ROMANCE_WIZARD_STEPS.indexOf(current)
  return index >= 0 && index < ROMANCE_WIZARD_STEPS.length - 1
    ? ROMANCE_WIZARD_STEPS[index + 1]
    : null
}

export function previousRomanceStep(current: RomanceStep): RomanceStep | null {
  const index = ROMANCE_WIZARD_STEPS.indexOf(current)
  return index > 0 ? ROMANCE_WIZARD_STEPS[index - 1] : null
}
