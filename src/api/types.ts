export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const AUTH_TOKEN_HEADER = import.meta.env.VITE_AUTH_TOKEN_HEADER || 'x-maylove-token'
export const STORAGE_UPLOAD_URL = import.meta.env.VITE_STORAGE_UPLOAD_URL

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorBody {
  error?: string
  message?: string
  details?: unknown
}

export interface User {
  id: string
  email: string
  name: string
  email_verified: boolean
}

export interface AuthPayload {
  token: string
  refresh_token?: string
  user: User
}

export interface TributeType {
  id: string
  slug: string
  name: string
  icon: string | null
  default_palette: string[]
  default_texts: Record<string, string>
  sort_order: number
}

export interface Template {
  id: string
  slug: string
  name: string
  category: { id: string; slug: string; name: string }
  thumbnail_url: string | null
  primary_color: string
  max_photos: number
  supports_video: boolean
  supports_music: boolean
  has_animation: boolean
  config_json?: Record<string, unknown>
}

export interface TributeMedia {
  id: string
  storage_file_id: string
  media_type: 'photo' | 'video' | 'audio'
  original_filename: string
  mime_type: string | null
  size_bytes: number | null
  sort_order: number
  url_thumbnail: string | null
  url?: string | null
  created_at: string
}

export interface TributeMusic {
  source: 'none' | 'library' | 'upload'
  track_id: string | null
  media_id: string | null
  track: MusicTrack | null
  url: string | null
  preview_url: string | null
}

export interface TributeDetail {
  id: string
  slug: string
  status: string
  title: string | null
  subtitle: string | null
  honoree_name: string | null
  message: string | null
  closing_message: string | null
  special_date: string | null
  color_primary: string | null
  music_source: 'none' | 'library' | 'upload'
  music_track_id: string | null
  music_media_id: string | null
  music: TributeMusic
  content_json: { effects?: string[] }
  og_image_url: string | null
  views_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  tribute_type: { id: string; slug: string; name: string }
  template: Template
  media: TributeMedia[]
  is_preview?: boolean
}

export interface TributeSummary {
  id: string
  slug: string
  status: string
  title: string | null
  honoree_name: string | null
  views_count: number
  published_at: string | null
  created_at: string
  tribute_type: { id: string; slug: string; name: string }
  template: { id: string; slug: string; name: string }
  color_primary: string | null
}

export interface TributeStats {
  status: string
  views_count: number
  first_viewed_at: string | null
  last_viewed_at: string | null
  photos_count: number
  has_video: boolean
  has_music: boolean
  published_at: string | null
}

export interface ValidationIssue {
  field: string
  code: string
  message: string
}

export interface TributeValidation {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export interface MusicTrack {
  id: string
  slug: string
  title: string
  artist: string
  duration_seconds: number
  category: string
  preview_url: string
  file_url: string
}

export interface MusicTrackList {
  tracks: MusicTrack[]
  categories: string[]
}

export interface PresignResponse {
  media_id: string
  storage_file_id: string
  upload_url: string
  upload_ticket: string
  expires_at: string
}

export interface CheckoutResponse {
  order_id: string
  tribute_id: string
  status: string
  price_cents: number
  checkout_url: string | null
}

export interface SubscriptionInfo {
  has_subscription: boolean
  status?: string
  billing_mode?: string
}

export interface PublicTribute {
  slug: string
  title: string | null
  subtitle: string | null
  honoree_name: string | null
  message: string | null
  closing_message: string | null
  color_primary: string | null
  views_count: number
  og_image_url: string | null
  published_at: string | null
  tribute_type: { slug: string; name: string; icon: string | null }
  template: {
    slug: string
    name: string
    primary_color: string
    supports_video: boolean
    supports_music: boolean
    has_animation: boolean
    config_json: Record<string, unknown>
  }
  media: Array<{
    id: string
    media_type: string
    url: string | null
    url_thumbnail: string | null
    sort_order: number
  }>
  music: Record<string, unknown> | null
}

export const TRIBUTE_EFFECTS = [
  'confetti',
  'hearts',
  'petals',
  'fireworks',
  'stars',
  'snow',
] as const

export type TributeEffect = (typeof TRIBUTE_EFFECTS)[number]

export type WizardStep = 'photos' | 'texts' | 'music' | 'effects' | 'preview' | 'publish'

export const WIZARD_STEPS: WizardStep[] = ['photos', 'texts', 'music', 'effects', 'preview', 'publish']

export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  photos: 'Fotos',
  texts: 'Textos',
  music: 'Música',
  effects: 'Efeitos',
  preview: 'Preview',
  publish: 'Publicar',
}
