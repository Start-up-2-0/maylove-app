import {
  isMemorialPresentation,
  isPhotoFirstPresentation,
  normalizePresentationId,
} from './book/presentations'

export type AlbumWizardStep =
  | 'basics'
  | 'pages'
  | 'photos'
  | 'music'
  | 'preview'
  | 'publish'

/** Galeria fotográfica: identidade → fototeca → música → preview → publicar. */
export const ALBUM_WIZARD_STEPS: AlbumWizardStep[] = [
  'basics',
  'photos',
  'music',
  'preview',
  'publish',
]

/** Livro de memórias / memorial: inclui organização em capítulos/memórias. */
export const MEMORY_BOOK_WIZARD_STEPS: AlbumWizardStep[] = [
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

export function wizardStepsFor(presentation?: string | null): AlbumWizardStep[] {
  const id = normalizePresentationId(presentation)
  if (isMemorialPresentation(id)) {
    return MEMORY_BOOK_WIZARD_STEPS
  }
  if (id === 'classic-photobook' || isPhotoFirstPresentation(id)) {
    return ALBUM_WIZARD_STEPS
  }
  return MEMORY_BOOK_WIZARD_STEPS
}
