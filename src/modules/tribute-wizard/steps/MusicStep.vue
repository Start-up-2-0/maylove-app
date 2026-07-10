<template>
  <div class="music-step">
    <WizardStepHeader
      title="Trilha sonora"
      :description="
        !supportsMusic
          ? 'Este template não suporta música.'
          : 'Cole um link do YouTube ou deixe sem música de fundo.'
      "
    />

    <div v-if="supportsMusic" class="source-toggle">
      <button
        v-for="option in sourceOptions"
        :key="option.value"
        class="ml-chip"
        :class="{ 'ml-chip--active': isSourceActive(option.value) }"
        @click="setSource(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <section v-if="supportsMusic && youtubeMode">
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { fetchMusicStatus, fetchTribute, importMusicFromYoutube } from '@/api/tributes'
import { resolveApiError } from '@/api/errors'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { isYoutubeUrl, loadAudioDuration } from '@/storage/musicMime'
import MusicTrimEditor from '@/components/wizard/MusicTrimEditor.vue'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  tributeId: string
  supportsMusic: boolean
  form: ReturnType<typeof useTributeWizard>['form']
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

const effectiveEndSeconds = computed(() =>
  props.form.music_end_seconds > 0 ? props.form.music_end_seconds : props.form.music_duration_seconds,
)

const trimTitle = computed(() => (youtubeUrl.value.trim() ? 'Áudio do YouTube' : 'Sua trilha'))
const trimArtist = computed(() => 'YouTube')
const trimSourceLabel = computed(() => null)

const showTrimEditor = computed(
  () =>
    props.form.music_source !== 'none' &&
    props.form.music_duration_seconds > 0 &&
    !processing.value &&
    !importing.value,
)

onMounted(async () => {
  if (!props.supportsMusic) return
  await refreshMusicState()
})

onUnmounted(() => {
  stopPolling()
})

function isSourceActive(source: 'none' | 'youtube'): boolean {
  if (source === 'youtube') return youtubeMode.value || props.form.music_source === 'upload'
  return props.form.music_source === 'none'
}

function setSource(source: 'none' | 'youtube') {
  error.value = ''
  if (source === 'youtube') {
    youtubeMode.value = true
    props.form.music_source = 'upload'
    return
  }
  youtubeMode.value = false
  youtubeUrl.value = ''
  props.form.music_source = 'none'
  props.form.music_track_id = null
  trimAudioUrl.value = ''
  props.form.music_duration_seconds = 0
  props.form.music_start_seconds = 0
  props.form.music_end_seconds = 0
}

function onStartChange(value: number) {
  props.form.music_start_seconds = value
}

function onEndChange(value: number) {
  props.form.music_end_seconds = value
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
    youtubeMode.value = true
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
    await applyReadyMusic(status.url, status.duration_seconds)
    emit('changed')
  } catch {
    // mantém polling
  }
}

async function refreshMusicState() {
  try {
    const tribute = await fetchTribute(props.tributeId)
    if (props.form.music_source === 'none') return

    youtubeMode.value = true
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
.mt-3 {
  margin-top: 12px;
}
</style>
