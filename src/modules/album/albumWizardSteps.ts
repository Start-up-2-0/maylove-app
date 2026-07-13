export type AlbumWizardStep =
  | 'presentation'
  | 'basics'
  | 'photos'
  | 'music'
  | 'preview'
  | 'publish'

export const ALBUM_WIZARD_STEPS: AlbumWizardStep[] = [
  'presentation',
  'basics',
  'photos',
  'music',
  'preview',
  'publish',
]

export const ALBUM_WIZARD_STEP_LABELS: Record<AlbumWizardStep, string> = {
  presentation: 'Estilo do livro',
  basics: 'Informações',
  photos: 'Fotos',
  music: 'Música',
  preview: 'Preview',
  publish: 'Publicar',
}
