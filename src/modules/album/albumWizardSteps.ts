export type AlbumWizardStep =
  | 'basics'
  | 'pages'
  | 'photos'
  | 'music'
  | 'preview'
  | 'publish'

/** Fluxo único do álbum galeria Polaroid. */
export const ALBUM_WIZARD_STEPS: AlbumWizardStep[] = [
  'basics',
  'photos',
  'music',
  'preview',
  'publish',
]

/** @deprecated alias — todos os estilos usam o mesmo fluxo */
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
