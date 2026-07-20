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

/** Livro de memórias: inclui organização em capítulos/memórias. */
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
  if (id === 'classic-photobook' || isPhotoFirstPresentation(id)) {
    return ALBUM_WIZARD_STEPS
  }
  return MEMORY_BOOK_WIZARD_STEPS
}

function normalizePresentationId(presentation?: string | null): string {
  if (!presentation) return 'classic-photobook'
  const map: Record<string, string> = {
    'family-album': 'family-memories',
    'romantic-book': 'wedding-book',
    polaroid: 'polaroid-memories',
    'memory-notebook': 'travel-journal',
    'photo-magazine': 'magazine-style',
  }
  return map[presentation] ?? presentation
}

function isPhotoFirstPresentation(id: string): boolean {
  return id === 'polaroid-board' || id === 'portrait-album' || id === 'instant-photo'
}
