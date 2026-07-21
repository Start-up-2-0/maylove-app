export const MAP_WIZARD_STEPS = ['basics', 'places', 'publish'] as const

export type MapWizardStep = (typeof MAP_WIZARD_STEPS)[number]

export const MAP_WIZARD_STEP_LABELS: Record<MapWizardStep, string> = {
  basics: 'Informações',
  places: 'Locais',
  publish: 'Publicar',
}
