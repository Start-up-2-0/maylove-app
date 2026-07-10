<template>
  <div class="music-step">
    <WizardStepHeader
      title="Trilha sonora"
      :description="
        !supportsMusic
          ? 'Este template não suporta música.'
          : 'Escolha da biblioteca, envie MP3/vídeo ou cole um link do YouTube.'
      "
    />

    <div v-if="supportsMusic" class="source-toggle">
      <button
        v-for="option in sourceOptions"
        :key="option.value"
        class="ml-chip"
        :class="{ 'ml-chip--active': form.music_source === option.value || (option.value === 'youtube' && youtubeMode) }"
        @click="setSource(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <section v-if="supportsMusic && form.music_source === 'library' && !youtubeMode">
      <div class="category-row">
        <button
          v-for="category in categories"
          :key="category"
          class="ml-chip ml-chip--sm"
          :class="{ 'ml-chip--active': selectedCategory === category }"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div v-if="loadingTracks" class="tracks-loading">
        <span class="ml-spinner" />
        Carregando faixas...
      </div>

      <ul v-else class="track-list">
        <li
          v-for="track in tracks"
          :key="track.id"
          class="track"
          :class="{ 'track--active': form.music_track_id === track.id }"
          @click="selectTrack(track)"
        >
          <span class="track__radio" aria-hidden="true" />
          <div class="track__info">
            <strong class="track__title">{{ track.title }}</strong>
            <span class="track__meta">{{ track.artist }} · {{ formatDuration(track.duration_seconds) }}</span>
          </div>
          <button class="ml-icon-btn track__play" title="Ouvir prévia" @click.stop="preview(track.preview_url)">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </li>
      </ul>
    </section>

    <section v-else-if="supportsMusic && form.music_source === 'upload' && !youtubeMode">
      <label class="ml-dropzone" :class="{ 'ml-dropzone--disabled': uploading || processing }">
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,video/mp4"
          class="hidden"
          :disabled="uploading || processing"
          @change="onAudioSelected"
        />
        <span v-if="uploading || processing" class="ml-spinner" />
        <span v-else class="ml-dropzone__glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 18V5l10-2v13" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="16" cy="16" r="3" />
          </svg>
        </span>
        <span v-if="uploading">Enviando arquivo...</span>
        <span v-else-if="processing">Extraindo áudio do vídeo...</span>
        <template v-else>
          <span class="ml-dropzone__title">Clique para enviar MP3 ou vídeo MP4</span>
          <span class="ml-dropzone__hint">MP3 ou MP4 · até 50 MB</span>
        </template>
      </label>
      <p v-if="uploadedName" class="ml-alert ml-alert--success mt-3">Arquivo enviado: {{ uploadedName }}</p>
    </section>

    <section v-else-if="supportsMusic && youtubeMode">
      <p class="youtube-legal">
        Ao importar de terceiros, você declara ter direito de uso. Alguns vídeos do YouTube podem não estar disponíveis.
      </p>
      <label class="ml-field">
        <span class="ml-field__label">Link do YouTube</span>
        <input
          v-model="youtubeUrl"
          type="url"
          class="ml-input"
          placeholder="https://www.youtube.com/watch?v=..."
          :disabled="importing"
        />
      </label>
      <button
        type="button"
        class="ml-btn ml-btn--primary mt-3"
        :disabled="importing || !youtubeUrl.trim()"
        @click="importYoutube"
      >
        <span v-if="importing" class="ml-spinner ml-spinner--inline" />
        {{ importing ? 'Importando áudio...' : 'Importar áudio' }}
      </button>
    </section>

    <MusicTrimEditor
      v-if="supportsMusic && showTrimEditor && trimAudioUrl"
      :audio-url="trimAudioUrl"
      :duration-seconds="form.music_duration_seconds"
      :start-seconds="form.music_start_seconds"
      :end-seconds="effectiveEndSeconds"
      :title="trimTitle"
      :artist="trimArtist"
      :source-label="trimSourceLabel"
      @update:start-seconds="onStartChange"
      @update:end-seconds="onEndChange"
    />

    <section v-if="supportsMusic && form.music_source !== 'none'" class="player-options">
      <h4 class="player-options__title">Opções do player</h4>
      <label class="player-toggle">
        <input v-model="form.music_autoplay" type="checkbox" />
        <span>
          <strong>Tocar automaticamente</strong>
          <small>Inicia a música assim que o visitante interage com a página.</small>
        </span>
      </label>
      <label class="player-toggle">
        <input v-model="form.music_loop" type="checkbox" />
        <span>
          <strong>Repetir em loop</strong>
          <small>Recomeça o trecho escolhido quando ele terminar.</small>
        </span>
      </label>
    </section>

    <p v-if="error" class="ml-alert ml-alert--danger mt-3">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { listMusicTracks } from '@/api/catalog'
import { confirmMedia, fetchMusicStatus, fetchTribute, importMusicFromYoutube, presignMedia } from '@/api/tributes'
import { resolveApiError } from '@/api/errors'
import type { MusicTrack } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { uploadFile } from '@/storage/upload'
import { inferMusicMimeType, isVideoMusicSource, isYoutubeUrl, loadAudioDuration } from '@/storage/musicMime'
import MusicTrimEditor from '@/components/wizard/MusicTrimEditor.vue'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  tributeId: string
  supportsMusic: boolean
  form: ReturnType<typeof useTributeWizard>['form']
}>()

const emit = defineEmits<{ changed: [] }>()

const sourceOptions = [
  { value: 'library' as const, label: 'Biblioteca' },
  { value: 'upload' as const, label: 'Upload' },
  { value: 'youtube' as const, label: 'YouTube' },
  { value: 'none' as const, label: 'Sem música' },
]

const tracks = ref<MusicTrack[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref('')
const loadingTracks = ref(false)
const uploading = ref(false)
const processing = ref(false)
const importing = ref(false)
const uploadedName = ref('')
const error = ref('')
const youtubeUrl = ref('')
const youtubeMode = ref(false)
const trimAudioUrl = ref('')
const activeMediaId = ref<string | null>(null)
let previewAudio: HTMLAudioElement | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

const effectiveEndSeconds = computed(() =>
  props.form.music_end_seconds > 0 ? props.form.music_end_seconds : props.form.music_duration_seconds,
)

const selectedTrack = computed(
  () => tracks.value.find((item) => item.id === props.form.music_track_id) ?? null,
)

const trimTitle = computed(() => {
  if (selectedTrack.value) return selectedTrack.value.title
  if (uploadedName.value) return uploadedName.value.replace(/\.[^.]+$/, '')
  if (youtubeUrl.value.trim()) return 'Áudio do YouTube'
  return 'Sua trilha'
})

const trimArtist = computed(() => {
  if (selectedTrack.value) return selectedTrack.value.artist
  if (youtubeUrl.value.trim()) return 'YouTube'
  if (uploadedName.value) return 'Arquivo enviado'
  return 'MayLov'
})

const trimSourceLabel = computed(() => {
  if (selectedTrack.value) return selectedTrack.value.category
  return null
})

const showTrimEditor = computed(
  () =>
    props.form.music_source !== 'none' &&
    props.form.music_duration_seconds > 0 &&
    !processing.value &&
    !importing.value,
)

onMounted(async () => {
  if (!props.supportsMusic) return
  await loadTracks()
  await refreshMusicState()
})

onUnmounted(() => {
  stopPolling()
})

watch(selectedCategory, loadTracks)

async function loadTracks() {
  loadingTracks.value = true
  try {
    const result = await listMusicTracks(
      selectedCategory.value && selectedCategory.value !== 'Todas' ? selectedCategory.value : undefined,
    )
    tracks.value = result.tracks
    categories.value = ['Todas', ...result.categories]
    if (!selectedCategory.value) selectedCategory.value = 'Todas'
  } finally {
    loadingTracks.value = false
  }
}

function setSource(source: 'none' | 'library' | 'upload' | 'youtube') {
  youtubeMode.value = source === 'youtube'
  if (source === 'youtube') {
    props.form.music_source = 'upload'
    return
  }
  props.form.music_source = source
  if (source === 'none') {
    props.form.music_track_id = null
    trimAudioUrl.value = ''
  }
}

function selectTrack(track: MusicTrack) {
  youtubeMode.value = false
  props.form.music_source = 'library'
  props.form.music_track_id = track.id
  props.form.music_duration_seconds = track.duration_seconds
  props.form.music_start_seconds = 0
  props.form.music_end_seconds = track.duration_seconds
  trimAudioUrl.value = track.preview_url
}

function preview(url: string) {
  previewAudio?.pause()
  previewAudio = new Audio(url)
  void previewAudio.play()
}

function onStartChange(value: number) {
  props.form.music_start_seconds = value
}

function onEndChange(value: number) {
  props.form.music_end_seconds = value
}

async function onAudioSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const mimeType = inferMusicMimeType(file)
  if (!mimeType) {
    error.value = 'Formato não suportado. Use MP3 ou MP4.'
    return
  }

  uploading.value = true
  error.value = ''
  try {
    const presign = await presignMedia(props.tributeId, {
      media_type: 'audio',
      filename: file.name,
      mime_type: mimeType,
      size_bytes: file.size,
    })
    await uploadFile(file, presign)
    const media = await confirmMedia(props.tributeId, presign.media_id)
    props.form.music_source = 'upload'
    props.form.music_track_id = null
    uploadedName.value = file.name
    activeMediaId.value = media.id

    if (media.processing_status === 'processing' || isVideoMusicSource(mimeType)) {
      processing.value = true
      startPolling(media.id)
    } else {
      await applyReadyMusic(media.url ?? null, media.duration_seconds ?? null)
    }
    emit('changed')
  } catch (err) {
    error.value = resolveApiError(err, 'Falha no upload do áudio.')
  } finally {
    uploading.value = false
  }
}

async function importYoutube() {
  const url = youtubeUrl.value.trim()
  if (!isYoutubeUrl(url)) {
    error.value = 'Informe um link válido do YouTube.'
    return
  }

  importing.value = true
  error.value = ''
  try {
    const status = await importMusicFromYoutube(props.tributeId, url)
    props.form.music_source = 'upload'
    props.form.music_track_id = null
    if (status.processing_status === 'processing') {
      processing.value = true
      if (status.media_id) startPolling(status.media_id)
      else startMusicPolling()
    } else {
      await applyReadyMusic(status.url, status.duration_seconds)
    }
    emit('changed')
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível importar o áudio do YouTube.')
  } finally {
    importing.value = false
  }
}

async function applyReadyMusic(url: string | null, duration: number | null) {
  if (!url) return
  trimAudioUrl.value = url
  let resolvedDuration = duration ?? 0
  if (resolvedDuration <= 0) {
    try {
      resolvedDuration = await loadAudioDuration(url)
    } catch {
      resolvedDuration = 0
    }
  }
  if (resolvedDuration > 0) {
    props.form.music_duration_seconds = resolvedDuration
    if (props.form.music_end_seconds <= 0 || props.form.music_end_seconds > resolvedDuration) {
      props.form.music_end_seconds = resolvedDuration
    }
  }
}

function startPolling(mediaId: string) {
  stopPolling()
  activeMediaId.value = mediaId
  pollTimer = setInterval(() => {
    void pollMediaStatus(mediaId)
  }, 2500)
  void pollMediaStatus(mediaId)
}

function startMusicPolling() {
  stopPolling()
  pollTimer = setInterval(() => {
    void pollMusicStatus()
  }, 2500)
  void pollMusicStatus()
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function pollMediaStatus(mediaId: string) {
  try {
    const status = await fetchMusicStatus(props.tributeId, mediaId)
    if (status.processing_status === 'processing') return
    stopPolling()
    processing.value = false
    if (status.processing_status === 'failed') {
      error.value = status.processing_error || 'Falha ao processar o áudio.'
      return
    }
    await applyReadyMusic(status.url, status.duration_seconds)
    emit('changed')
  } catch {
    // mantém polling
  }
}

async function pollMusicStatus() {
  try {
    const status = await fetchMusicStatus(props.tributeId)
    if (status.processing_status === 'processing') return
    stopPolling()
    processing.value = false
    if (status.processing_status === 'failed') {
      error.value = status.processing_error || 'Falha ao importar o áudio.'
      return
    }
    if (status.media_id) activeMediaId.value = status.media_id
    await applyReadyMusic(status.url, status.duration_seconds)
    emit('changed')
  } catch {
    // mantém polling
  }
}

async function refreshMusicState() {
  try {
    const tribute = await fetchTribute(props.tributeId)
    if (props.form.music_source === 'library' && props.form.music_track_id) {
      const track = tracks.value.find((item) => item.id === props.form.music_track_id)
      trimAudioUrl.value = track?.preview_url || tribute.music?.preview_url || tribute.music?.url || ''
      return
    }
    if (props.form.music_source === 'upload') {
      const status = await fetchMusicStatus(props.tributeId)
      if (status.processing_status === 'processing') {
        processing.value = true
        if (status.media_id) startPolling(status.media_id)
        else startMusicPolling()
        return
      }
      trimAudioUrl.value = status.url || tribute.music?.url || ''
      if (status.duration_seconds) {
        props.form.music_duration_seconds = status.duration_seconds
      }
    }
  } catch {
    // ignora no mount
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
</script>

<style scoped>
.source-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}
.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}
.ml-chip--sm {
  padding: 5px 12px;
  font-size: 0.82rem;
}
.tracks-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  padding: 22px 4px;
}
.track-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.track {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
}
.track--active {
  border-color: var(--primary);
  background: var(--primary-softer);
}
.track__radio {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid var(--border-strong);
  flex-shrink: 0;
}
.track--active .track__radio {
  border-color: var(--primary);
  background: var(--primary);
  box-shadow: inset 0 0 0 3px var(--surface);
}
.track__info {
  flex: 1;
  min-width: 0;
}
.track__title {
  display: block;
  font-weight: 600;
}
.track__meta {
  font-size: 0.84rem;
  color: var(--muted);
}
.player-options {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.player-options__title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0;
}
.player-toggle {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}
.player-toggle span {
  display: flex;
  flex-direction: column;
}
.youtube-legal {
  margin: 0 0 12px;
  font-size: 0.82rem;
  color: var(--muted);
}
.mt-3 {
  margin-top: 12px;
}
.hidden {
  display: none;
}
</style>
