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
  code?: string
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
  refreshToken?: string
  refresh_token?: string
  expiresAt?: string
  refreshExpiresAt?: string
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
  processing_status?: 'ready' | 'processing' | 'failed'
  processing_error?: string | null
  duration_seconds?: number | null
}

export interface TributeMusic {
  source: 'none' | 'library' | 'upload'
  track_id: string | null
  media_id: string | null
  track: MusicTrack | null
  url: string | null
  preview_url: string | null
  duration_seconds?: number | null
}

export interface MusicMediaStatus {
  media_id: string
  processing_status: 'ready' | 'processing' | 'failed'
  processing_error: string | null
  duration_seconds: number | null
  url: string | null
}

export interface TributeTimelineItem {
  date?: string
  title?: string
  description?: string
  photo_url?: string
  photo_media_id?: string
}

export interface TributeEventInfo {
  date?: string
  location?: string
  map_url?: string
}

/**
 * Conteudo rico da homenagem, persistido em content_json. Todos os campos sao
 * opcionais para manter compatibilidade com tributos antigos (que so tinham effects).
 */
export interface TributeContentJson {
  effects?: string[]
  sender_name?: string
  signature?: string
  messages?: string[]
  timeline?: TributeTimelineItem[]
  event_info?: TributeEventInfo
  video_url?: string
  /** Fonte de destaque (família CSS) escolhida pelo usuário. Sobrepõe o estilo. */
  font?: string
  /** Plano de fundo (id de preset). Sobrepõe o estilo/template. */
  background?: string
  animation_speed?: 'slow' | 'normal' | 'fast'
  /** Transição de entrada dos blocos (fade/deslizar/zoom). Sobrepõe o estilo. */
  entrance?: 'fade' | 'slide-up' | 'zoom'
  /** Ordem das seções habilitadas (por id). Aplica-se ao layout de rolagem. */
  section_order?: string[]
  /** Forma de exibição das fotos (slider/galeria/mosaico/polaroid). */
  photo_style?: 'slider' | 'gallery' | 'mosaic' | 'polaroid'
  /** Forma como os textos surgem (padrão/digitação). */
  text_style?: 'default' | 'typewriter'
  /** Estilo visual escolhido (paleta/tipografia/fundo). Não altera a estrutura. */
  style_id?: string | null
  /** Estilo de apresentação (experiência/layout) escolhido pelo usuário. */
  presentation?: string | null
  /** Pergunta do pedido (usada no estilo "Pedido interativo"). */
  question?: string
  /** Mensagem exibida quando o pedido é aceito. */
  celebration?: string
  /** Player de música começa a tocar automaticamente. */
  music_autoplay?: boolean
  /** Player de música repete ao terminar. */
  music_loop?: boolean
  /** Segundo em que a música começa a tocar. */
  music_start_seconds?: number
  /** Segundo em que a música para (fim do trecho). */
  music_end_seconds?: number
  /** Duração total da faixa em segundos. */
  music_duration_seconds?: number
  /** Exibe texto de abertura antes dos trechos/momentos (apresentações narrativas). */
  include_opening_message?: boolean
  /** Exibe mensagem de encerramento ao final da experiência. */
  include_closing_message?: boolean
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
  content_json: TributeContentJson
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
  presentation?: string | null
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

export interface AlbumMedia {
  id: string
  storage_file_id: string
  media_type: 'photo' | 'audio'
  original_filename: string
  mime_type: string | null
  size_bytes: number | null
  sort_order: number
  title: string | null
  caption: string | null
  memory_date: string | null
  url_thumbnail: string | null
  url?: string | null
  created_at: string
}

export interface AlbumSummary {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  title: string | null
  subtitle: string | null
  color_primary: string | null
  presentation: string
  is_public: boolean
  photo_count: number
  views_count: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface AlbumDetail extends AlbumSummary {
  closing_message: string | null
  signature: string | null
  music_media_id: string | null
  media: AlbumMedia[]
}

export interface AlbumValidation {
  valid: boolean
  errors: Array<{ field: string; code: string; message: string }>
}

export interface PublicAlbumPhoto {
  id: string
  url: string | null
  title: string | null
  caption: string | null
  memory_date: string | null
  sort_order: number
}

export interface PublicAlbum {
  slug: string
  title: string | null
  subtitle: string | null
  closing_message: string | null
  signature: string | null
  color_primary: string | null
  presentation: string
  published_at: string | null
  views_count: number
  photos: PublicAlbumPhoto[]
  music: { id: string; url: string | null } | null
}

export interface AlbumUploadPolicy {
  photo: {
    accepted_mimes: string[]
    accepted_extensions: string[]
    max_file_bytes: number
    max_long_edge_px: number
    max_count_per_album: number
    output_format_hint: string
  }
  audio: {
    accepted_mimes: string[]
    accepted_extensions: string[]
    max_file_bytes: number
    max_count_per_album: number
    output_format_hint: string
  }
}

export interface CheckoutResponse {
  order_id: string
  tribute_id: string
  status: string
  price_cents: number
  checkout_url: string | null
}

export interface SubscriptionInfo {
  billing_enabled?: boolean
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
  special_date: string | null
  color_primary: string | null
  views_count: number
  og_image_url: string | null
  published_at: string | null
  content_json: TributeContentJson
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

export type WizardStep =
  | 'presentation'
  | 'photos'
  | 'moments'
  | 'texts'
  | 'style'
  | 'music'
  | 'video'
  | 'event'
  | 'effects'
  | 'preview'
  | 'publish'

export const WIZARD_STEPS: WizardStep[] = [
  'presentation',
  'style',
  'texts',
  'photos',
  'music',
  'effects',
  'preview',
  'publish',
]

export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  presentation: 'Apresentação',
  photos: 'Fotos',
  moments: 'Momentos',
  texts: 'Textos',
  style: 'Estilo',
  music: 'Música',
  video: 'Vídeo',
  event: 'Evento',
  effects: 'Efeitos',
  preview: 'Revisar e Concluir',
  publish: 'Publicar',
}
