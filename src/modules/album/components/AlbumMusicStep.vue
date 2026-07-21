<template>
  <div class="music-step">
    <WizardStepHeader
      title="Trilha sonora"
      description="Cole um link do YouTube ou deixe sem música de fundo."
    />

    <div class="source-toggle">
      <button
        v-for="option in sourceOptions"
        :key="option.value"
        type="button"
        class="ml-chip"
        :class="{ 'ml-chip--active': isSourceActive(option.value) }"
        @click="setSource(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <section v-if="youtubeMode">
      <p class="youtube-legal">
        Ao importar de terceiros, você declara ter direito de uso. Alguns vídeos do YouTube podem não
        estar disponíveis.
      </p>
      <label class="ml-field">
        <span class="ml-field__label">Link do YouTube</span>
        <input
          v-model="youtubeUrl"
          type="url"
          class="ml-input"
          placeholder="https://www.youtube.com/watch?v=..."
          :disabled="importing || processing"
        />
      </label>
      <button
        type="button"
        class="ml-btn ml-btn--primary mt-3"
        :disabled="importing || processing || !youtubeUrl.trim()"
        @click="importYoutube"
      >
        <span v-if="importing" class="ml-spinner ml-spinner--inline" />
        {{ importing ? 'Importando áudio...' : 'Importar áudio' }}
      </button>

      <div v-if="processing" class="music-processing">
        <span class="ml-spinner ml-spinner--inline" />
        <span>Extraindo áudio… isso pode levar alguns segundos.</span>
      </div>
    </section>

    <MusicTrimEditor
      v-if="showTrimEditor && trimAudioUrl"
      :audio-url="trimAudioUrl"
      :duration-seconds="music.duration_seconds"
      :start-seconds="music.start_seconds"
      :end-seconds="effectiveEndSeconds"
      title="Áudio do YouTube"
      artist="YouTube"
      :source-label="null"
      @update:start-seconds="onStartChange"
      @update:end-seconds="onEndChange"
    />

    <section v-if="music.source !== 'none'" class="player-options">
      <h4 class="player-options__title">Opções do player</h4>
      <label class="player-toggle">
        <input v-model="music.autoplay" type="checkbox" />
        <span>
          <strong>Tocar automaticamente</strong>
          <small>Inicia a música assim que o visitante interage com a página.</small>
        </span>
      </label>
      <label class="player-toggle">
        <input v-model="music.loop" type="checkbox" />
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  fetchAlbum,
  fetchAlbumMusicStatus,
  importAlbumMusicFromYoutube,
} from '@/api/albums'
import type { AlbumMedia } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import { isYoutubeUrl, loadAudioDuration } from '@/storage/musicMime'
import { DEFAULT_BOOK_MUSIC, normalizeBookMusic, type BookConfigMusic } from '../book/bookConfig'
import MusicTrimEditor from '@/components/wizard/MusicTrimEditor.vue'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  albumId: string
  audio: AlbumMedia | null
  form: ReturnType<typeof useAlbumWizard>['form']
}>()

const emit = defineEmits<{ changed: [] }>()

const sourceOptions = [
  { value: 'youtube' as const, label: 'YouTube' },
  { value: 'none' as const, label: 'Sem música' },
]

const importing = ref(false)
const processing = ref(false)
const error = ref('')
const youtubeUrl = ref('')
const youtubeMode = ref(false)
const trimAudioUrl = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

function musicState(): BookConfigMusic {
  if (!props.form.book_config.music) {
    props.form.book_config.music = normalizeBookMusic(DEFAULT_BOOK_MUSIC)
  }
  return props.form.book_config.music
}

const music = computed(() => musicState())

const effectiveEndSeconds = computed(() =>
  music.value.end_seconds > 0 ? music.value.end_seconds : music.value.duration_seconds,
)

const showTrimEditor = computed(
  () =>
    music.value.source !== 'none' &&
    music.value.duration_seconds > 0 &&
    !processing.value &&
    !importing.value,
)

onMounted(async () => {
  ensureMusic()
  await refreshMusicState()
})

onUnmounted(() => {
  stopPolling()
})

function ensureMusic() {
  if (!props.form.book_config.music) {
    props.form.book_config.music = normalizeBookMusic(DEFAULT_BOOK_MUSIC)
  }
}

function isSourceActive(source: 'none' | 'youtube'): boolean {
  if (source === 'youtube') return youtubeMode.value || music.value.source === 'upload'
  return music.value.source === 'none'
}

function setSource(source: 'none' | 'youtube') {
  error.value = ''
  const current = musicState()
  if (source === 'youtube') {
    youtubeMode.value = true
    current.source = 'upload'
    return
  }
  youtubeMode.value = false
  youtubeUrl.value = ''
  trimAudioUrl.value = ''
  props.form.book_config.music = {
    ...normalizeBookMusic(DEFAULT_BOOK_MUSIC),
    source: 'none',
    autoplay: current.autoplay,
    loop: current.loop,
  }
}

function onStartChange(value: number) {
  musicState().start_seconds = value
}

function onEndChange(value: number) {
  musicState().end_seconds = value
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
    const status = await importAlbumMusicFromYoutube(props.albumId, url)
    youtubeMode.value = true
    musicState().source = 'upload'
    if (status.processing_status === 'processing') {
      processing.value = true
      startMusicPolling()
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
  const current = musicState()
  let resolvedDuration = duration ?? 0
  if (resolvedDuration <= 0) {
    try {
      resolvedDuration = await loadAudioDuration(url)
    } catch {
      resolvedDuration = 0
    }
  }
  if (resolvedDuration > 0) {
    current.source = 'upload'
    current.duration_seconds = resolvedDuration
    if (current.end_seconds <= 0 || current.end_seconds > resolvedDuration) {
      current.end_seconds = resolvedDuration
    }
    if (!current.start_seconds) {
      current.start_seconds = 0
    }
  }
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

async function pollMusicStatus() {
  try {
    const status = await fetchAlbumMusicStatus(props.albumId)
    if (status.processing_status === 'processing') return
    stopPolling()
    processing.value = false
    if (status.processing_status === 'failed') {
      error.value = status.processing_error || 'Falha ao importar o áudio.'
      return
    }
    await applyReadyMusic(status.url, status.duration_seconds)
    emit('changed')
  } catch {
    // mantém polling
  }
}

async function refreshMusicState() {
  try {
    ensureMusic()
    if (music.value.source === 'none') return

    youtubeMode.value = true
    const status = await fetchAlbumMusicStatus(props.albumId)
    if (status.processing_status === 'processing') {
      processing.value = true
      startMusicPolling()
      return
    }
    const album = await fetchAlbum(props.albumId)
    const audioUrl =
      status.url ||
      album.media.find((item) => item.media_type === 'audio' && item.id === album.music_media_id)
        ?.url ||
      props.audio?.url ||
      ''
    trimAudioUrl.value = audioUrl
    if (status.duration_seconds) {
      const current = musicState()
      current.duration_seconds = status.duration_seconds
      if (current.end_seconds <= 0) {
        current.end_seconds = status.duration_seconds
      }
    }
  } catch {
    // ignora no mount
  }
}
</script>

<style scoped>
.source-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
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
.music-processing {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--accent, #c45d7a) 8%, var(--surface-2));
  border: 1px solid color-mix(in srgb, var(--accent, #c45d7a) 20%, var(--border));
  font-size: 0.88rem;
  color: var(--muted);
}
.mt-3 {
  margin-top: 12px;
}
</style>
