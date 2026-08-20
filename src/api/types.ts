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
  location?: string
  emotion?: string
  video_url?: string
}

export type SpecialDateCounterMode = 'countdown' | 'since' | 'none'
export type SpecialDateDisplayFormat = 'compact' | 'card' | 'hero' | 'inline'

export interface TributeSpecialDateConfig {
  enabled?: boolean
  kind?: 'first_meeting' | 'first_kiss' | 'dating_proposal' | 'wedding' | 'anniversary' | 'custom'
  date?: string
  time?: string
  title?: string
  description?: string
  counter_mode?: SpecialDateCounterMode
  display_format?: SpecialDateDisplayFormat
}

export interface TributeModulesConfig {
  digital_album?: boolean
  letter?: boolean
  timeline?: boolean
  couple_map?: boolean
  digital_book?: boolean
  quiz?: boolean
  playlist?: boolean
  night_sky?: boolean
  qr_code?: boolean
  comments?: boolean
  reactions?: boolean
  gifts?: boolean
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
  /** Tema visual do wizard de romances (Love Cards). */
  romance_theme_id?: string | null
  /** Paleta de cores do tema Retrospectiva Interativa. */
  retrospective_palette_id?: string | null
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
  /** Configuração da data especial com contador. */
  special_date_config?: TributeSpecialDateConfig
  /** Módulos extras ativos na homenagem. */
  modules?: TributeModulesConfig
  /** Categoria escolhida no wizard (slug interno). */
  wizard_category_slug?: string | null
  /** ID estável do tipo escolhido no wizard (ex.: declaracao-amor). */
  wizard_type_id?: string | null
  /** Experiência romance escolhida na galeria (ex.: carta-amor). */
  romance_experience_id?: string | null
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
  unique_visitors: number
  shares_count: number
  daily_views: Array<{ date: string; views: number }>
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
  media_type: AlbumMediaType
  original_filename: string
  mime_type: string | null
  size_bytes: number | null
  sort_order: number
  title: string | null
  caption: string | null
  memory_date: string | null
  place_name?: string | null
  url_thumbnail: string | null
  url?: string | null
  created_at: string
}

export interface AlbumSummary {
  id: string
  slug: string
  status: 'draft' | 'awaiting_payment' | 'published' | 'archived'
  category?: AlbumCategory | null
  title: string | null
  subtitle: string | null
  color_primary: string | null
  presentation?: string | null
  is_public: boolean
  chapter_count?: number
  memory_count?: number
  views_count: number
  cover_url?: string | null
  preview_thumbs?: string[]
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface AlbumDetail extends AlbumSummary {
  category?: AlbumCategory | null
  honoree_names?: string | null
  dedication?: string | null
  closing_message?: string | null
  presentation?: string | null
  music_media_id: string | null
  media: AlbumMedia[]
  book_config?: Record<string, unknown> | null
  chapters: AlbumChapter[]
  experiences: AlbumExperience[]
  content_json?: Record<string, unknown> | null
}

export interface AlbumValidation {
  valid: boolean
  errors: Array<{ field: string; code: string; message: string }>
  warnings: Array<{ field: string; code: string; message: string }>
}

export interface PublicAlbumPhoto {
  id: string
  url: string | null
  title: string | null
  caption: string | null
  memory_date: string | null
  place_name?: string | null
  sort_order: number
}

export interface PublicAlbum {
  slug: string
  title: string | null
  subtitle: string | null
  color_primary: string | null
  presentation?: string | null
  category?: AlbumCategory | null
  honoree_names?: string | null
  dedication?: string | null
  published_at: string | null
  views_count: number
  photos: PublicAlbumPhoto[]
  chapters: AlbumChapter[]
  experiences: AlbumExperience[]
  content_json?: Record<string, unknown> | null
  music: {
    id: string
    url: string | null
    autoplay?: boolean
    loop?: boolean
    duration_seconds?: number | null
    start_seconds?: number | null
    end_seconds?: number | null
  } | null
}

// ---- Álbum (modelo genérico / spec 16) ----

export type AlbumCategory =
  | 'couple'
  | 'wedding'
  | 'proposal'
  | 'marriage_proposal'
  | 'birthday'
  | 'family'
  | 'parents'
  | 'mother'
  | 'children'
  | 'friends'
  | 'graduation'
  | 'company'
  | 'pet'
  | 'memorial'
  | 'posthumous'
  | 'holiday'
  | 'custom'

export type AlbumStatus = 'draft' | 'awaiting_payment' | 'published' | 'archived'

export type AlbumMediaType = 'photo' | 'audio'

export type Sentiment = 'feliz' | 'saudade' | 'amor' | 'gratidao' | 'orgulho' | 'paz' | 'outro'

export type ExperienceType = 'bouquet' | 'map' | 'starry_sky' | 'surprise' | 'game'

export interface AlbumMemoryMediaRef {
  id: string
  media_type: AlbumMediaType
  url: string
}

export interface AlbumMemoryDocumentRef {
  id: string
  doc_type: string
  label?: string
  url: string
}

export interface AlbumMemory {
  id: string
  sort_order: number
  title?: string
  subtitle?: string
  description?: string
  date?: string
  time?: string
  location?: { lat: number; lng: number; label?: string }
  climate?: string
  sentiment?: Sentiment
  tags: string[]
  people: string[]
  media: AlbumMemoryMediaRef[]
  documents?: AlbumMemoryDocumentRef[]
  /** IDs de AlbumMedia (fototeca solta) vinculados a esta memória, persistidos em content_json. */
  media_ids?: string[]
  content_json?: Record<string, unknown> | null
}

export type AlbumMemoryPayload = Partial<
  Omit<AlbumMemory, 'id' | 'media' | 'documents' | 'tags' | 'people'>
> & {
  sort_order?: number
  tags?: string[]
  people?: string[]
  media?: AlbumMemoryMediaRef[]
  documents?: AlbumMemoryDocumentRef[]
  media_ids?: string[]
}

export interface AlbumChapter {
  id: string
  title: string
  sort_order: number
  memories: AlbumMemory[]
}

export interface AlbumExperience {
  id: string
  type: ExperienceType
  config: Record<string, unknown>
}

export interface AlbumTimelineItemDto {
  date: string
  title: string
  description?: string
  chapter_id?: string
  memory_id?: string
  media?: AlbumMemoryMediaRef[]
}

export interface AlbumTimeline {
  items: AlbumTimelineItemDto[]
}

export interface AlbumQr {
  slug: string
  public_url: string
  deep_link: string
  url: string
  memory_id?: string | null
}

export type AlbumVisitorTributeType = 'candle' | 'flower' | 'message'

export interface AlbumVisitorTribute {
  id: string
  type: AlbumVisitorTributeType
  author_name: string
  message: string
  expires_at: string | null
  created_at: string
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

export interface PixPaymentData {
  qr_code: string | null
  qr_code_base64: string | null
  ticket_url: string | null
}

export interface CheckoutResponse {
  order_id: string
  kind?: 'tribute' | 'album' | 'map'
  tribute_id?: string | null
  album_id?: string | null
  couple_map_id?: string | null
  status: string
  price_cents: number
  payment_method?: 'pix'
  checkout_url: string | null
  pix?: PixPaymentData | null
}

export interface BillingProductPrice {
  billing_mode: string
  price_cents: number
  formatted: string
}

export interface BillingProduct {
  slug: string
  name: string
  features: Record<string, unknown>
  prices: BillingProductPrice[]
}

export interface OrderStatusResponse {
  id: string
  status: string
  amount_cents: number
  payment_method?: string
  tribute_id: string | null
  album_id: string | null
  checkout_url: string | null
  pix?: PixPaymentData | null
  paid_at: string | null
  created_at: string
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
  | 'type'
  | 'basics'
  | 'special-date'
  | 'story'
  | 'personalization'
  | 'texts'
  | 'modules'
  | 'review'
  | 'publish'

/** @deprecated Use TRIBUTE_WIZARD_STEPS de tributeWizardSteps.ts */
export const WIZARD_STEPS: WizardStep[] = [
  'type',
  'basics',
  'special-date',
  'story',
  'personalization',
  'texts',
  'modules',
  'review',
  'publish',
]

export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  type: 'Tipo',
  basics: 'Informações',
  'special-date': 'Data especial',
  story: 'Nossa história',
  personalization: 'Personalização',
  texts: 'Textos',
  modules: 'Recursos extras',
  review: 'Revisão',
  publish: 'Publicação',
}

export type CoupleMapStatus = 'draft' | 'awaiting_payment' | 'published' | 'archived'
export type MapStyle = 'default' | 'romantic' | 'minimal' | 'vintage'
export type MapPlaceType =
  | 'first_meeting'
  | 'first_date'
  | 'first_kiss'
  | 'proposal'
  | 'wedding'
  | 'anniversary'
  | 'trip'
  | 'vacation'
  | 'restaurant'
  | 'home'
  | 'milestone'
  | 'other'
export type MapMediaType = 'photo' | 'video'

export interface MapMedia {
  id: string
  place_id: string
  media_type: MapMediaType
  original_filename: string
  mime_type?: string | null
  size_bytes?: number | null
  sort_order: number
  url?: string | null
  url_thumbnail?: string | null
  created_at: string
}

export interface MapPlace {
  id: string
  place_type: MapPlaceType
  title: string
  subtitle?: string | null
  description?: string | null
  memory_date?: string | null
  memory_time?: string | null
  latitude: number
  longitude: number
  address_label?: string | null
  city?: string | null
  country?: string | null
  sentiment?: string | null
  is_highlight: boolean
  sort_order: number
  content_json?: Record<string, unknown>
  media?: MapMedia[]
  created_at: string
  updated_at: string
}

export interface CoupleMapSummary {
  id: string
  slug: string
  status: CoupleMapStatus
  title: string
  subtitle?: string | null
  couple_names: string
  map_style: MapStyle
  show_route: boolean
  places_count: number
  views_count: number
  highlight_title?: string | null
  published_at?: string | null
  created_at: string
  updated_at: string
}

export interface CoupleMapDetail extends CoupleMapSummary {
  center_lat?: number | null
  center_lng?: number | null
  default_zoom?: number | null
  content_json?: Record<string, unknown>
  media_urls_expire_at?: string
  places: MapPlace[]
}

export interface PublicCoupleMap extends CoupleMapDetail {
  public_url: string
  highlight_place?: {
    id: string
    title: string
    latitude: number
    longitude: number
    cover_url?: string | null
  } | null
  route_polyline?: Array<{ lat: number; lng: number }> | null
}

export interface CoupleMapValidation {
  valid: boolean
  errors: Array<{ field: string; code: string; message: string }>
  warnings: Array<{ field: string; code: string; message: string }>
}

export type DigitalBouquetStatus = 'draft' | 'awaiting_payment' | 'published' | 'archived'
export type BouquetWrapColor = 'blush' | 'cream' | 'burgundy'
export type BouquetLetterDesign = 'classic' | 'romantic'

export interface DigitalBouquetSummary {
  id: string
  slug: string
  status: DigitalBouquetStatus
  title: string
  stems_count: number
  wrap_color: BouquetWrapColor
  recipient_name: string
  sender_name: string
  letter_design: BouquetLetterDesign
  views_count: number
  published_at?: string | null
  created_at: string
  updated_at: string
}

export interface DigitalBouquetDetail extends DigitalBouquetSummary {
  stems: string[]
  letter_body: string
  content_json?: Record<string, unknown>
}

export interface PublicDigitalBouquet {
  slug: string
  title: string
  stems: string[]
  wrap_color: BouquetWrapColor
  recipient_name: string
  sender_name: string
  letter_body: string
  letter_design: BouquetLetterDesign
  content_json?: Record<string, unknown>
  published_at?: string | null
}

export interface DigitalBouquetValidation {
  valid: boolean
  errors: Array<{ field: string; code: string; message: string }>
  warnings: Array<{ field: string; code: string; message: string }>
}

export interface MapUploadPolicy {
  photo: {
    accepted_mimes: string[]
    accepted_extensions: string[]
    max_file_bytes: number
    max_count_per_place: number
  }
  video: {
    accepted_mimes: string[]
    accepted_extensions: string[]
    max_file_bytes: number
    max_count_per_place: number
  }
  max_places_per_map: number
}
