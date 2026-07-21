export const BOUQUET_WIZARD_STEPS = ['stems', 'letter'] as const

export type BouquetWizardStep = (typeof BOUQUET_WIZARD_STEPS)[number]

export const BOUQUET_WIZARD_STEP_LABELS: Record<BouquetWizardStep, string> = {
  stems: 'Flores',
  letter: 'Carta',
}
