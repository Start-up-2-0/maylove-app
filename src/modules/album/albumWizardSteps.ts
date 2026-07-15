export type AlbumWizardStep =
  | 'basics'
  | 'pages'
  | 'photos'
  | 'music'
  | 'preview'
  | 'publish'

/** Photobook editorial: identidade → fototeca → diagramação → música → preview → publicar. */
export const ALBUM_WIZARD_STEPS: AlbumWizardStep[] = [
  'basics',
  'photos',
  'pages',
  'music',
  'preview',
  'publish',
]

/** @deprecated alias */
export const MURAL_WIZARD_STEPS = ALBUM_WIZARD_STEPS
export const POLAROID_BOARD_WIZARD_STEPS = ALBUM_WIZARD_STEPS

export const ALBUM_WIZARD_STEP_LABELS: Record<AlbumWizardStep, string> = {
  basics: 'Identidade',
  pages: 'Páginas',
  photos: 'Fototeca',
  music: 'Música',
  preview: 'Preview',
  publish: 'Publicar',
}

export function wizardStepsFor(_presentation?: string | null): AlbumWizardStep[] {
  return ALBUM_WIZARD_STEPS
}
