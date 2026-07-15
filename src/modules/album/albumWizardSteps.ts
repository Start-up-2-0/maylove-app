import { isMemoryBookPresentation, isPhotoFirstPresentation } from './book/presentations'

export type AlbumWizardStep =
  | 'basics'
  | 'pages'
  | 'photos'
  | 'music'
  | 'preview'
  | 'publish'

/** Steps padrão do Memory Book (fototeca antes das páginas, que usam as fotos). */
export const ALBUM_WIZARD_STEPS: AlbumWizardStep[] = [
  'basics',
  'photos',
  'pages',
  'music',
  'preview',
  'publish',
]

/** Estilos só-foto: sem editor de páginas. */
export const MURAL_WIZARD_STEPS: AlbumWizardStep[] = [
  'basics',
  'photos',
  'music',
  'preview',
  'publish',
]

/** @deprecated use MURAL_WIZARD_STEPS */
export const POLAROID_BOARD_WIZARD_STEPS = MURAL_WIZARD_STEPS

export const ALBUM_WIZARD_STEP_LABELS: Record<AlbumWizardStep, string> = {
  basics: 'Identidade',
  pages: 'Páginas',
  photos: 'Fototeca',
  music: 'Música',
  preview: 'Preview',
  publish: 'Publicar',
}

export function wizardStepsFor(presentation: string | null | undefined): AlbumWizardStep[] {
  if (isPhotoFirstPresentation(presentation)) {
    return MURAL_WIZARD_STEPS
  }
  if (isMemoryBookPresentation(presentation) || !presentation) {
    return ALBUM_WIZARD_STEPS
  }
  return MURAL_WIZARD_STEPS
}
