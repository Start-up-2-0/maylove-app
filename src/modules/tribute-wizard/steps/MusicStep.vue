<template>
  <div class="music-step">
    <WizardStepHeader
      title="Trilha sonora"
      :description="
        !supportsMusic
          ? 'Este template não suporta música.'
          : 'Escolha uma faixa da biblioteca ou envie um MP3 (máx. 15 MB).'
      "
    />

    <div v-if="supportsMusic" class="source-toggle">
      <button
        v-for="option in sourceOptions"
        :key="option.value"
        class="ml-chip"
        :class="{ 'ml-chip--active': form.music_source === option.value }"
        @click="setSource(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <section v-if="supportsMusic && form.music_source === 'library'">
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

    <section v-else-if="supportsMusic && form.music_source === 'upload'">
      <label class="ml-dropzone" :class="{ 'ml-dropzone--disabled': uploading }">
        <input type="file" accept="audio/mpeg,audio/mp3" class="hidden" :disabled="uploading" @change="onAudioSelected" />
        <span v-if="uploading" class="ml-spinner" />
        <span v-else class="ml-dropzone__glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 18V5l10-2v13" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="16" cy="16" r="3" />
          </svg>
        </span>
        <span v-if="uploading">Enviando áudio...</span>
        <template v-else>
          <span class="ml-dropzone__title">Clique para enviar MP3</span>
          <span class="ml-dropzone__hint">Formato MP3 · até 15 MB</span>
        </template>
      </label>
      <p v-if="uploadedName" class="ml-alert ml-alert--success mt-3">Arquivo enviado: {{ uploadedName }}</p>
    </section>

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
          <small>Recomeça a faixa quando ela terminar.</small>
        </span>
      </label>
    </section>

    <p v-if="error" class="ml-alert ml-alert--danger mt-3">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { listMusicTracks } from '@/api/catalog'
import { confirmMedia, presignMedia } from '@/api/tributes'
import type { MusicTrack } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { uploadFile } from '@/storage/upload'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  tributeId: string
  supportsMusic: boolean
  form: ReturnType<typeof useTributeWizard>['form']
}>()

const emit = defineEmits<{ changed: [] }>()

const sourceOptions = [
  { value: 'library' as const, label: 'Biblioteca' },
  { value: 'upload' as const, label: 'Upload MP3' },
  { value: 'none' as const, label: 'Sem música' },
]

const tracks = ref<MusicTrack[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref('')
const loadingTracks = ref(false)
const uploading = ref(false)
const uploadedName = ref('')
const error = ref('')
let previewAudio: HTMLAudioElement | null = null

onMounted(async () => {
  if (!props.supportsMusic) return
  await loadTracks()
})

watch(selectedCategory, loadTracks)

async function loadTracks() {
  loadingTracks.value = true
  try {
    const result = await listMusicTracks(
      selectedCategory.value && selectedCategory.value !== 'Todas'
        ? selectedCategory.value
        : undefined,
    )
    tracks.value = result.tracks
    categories.value = ['Todas', ...result.categories]
    if (!selectedCategory.value) selectedCategory.value = 'Todas'
  } finally {
    loadingTracks.value = false
  }
}

function setSource(source: 'none' | 'library' | 'upload') {
  props.form.music_source = source
  if (source === 'none') {
    props.form.music_track_id = null
  }
}

function selectTrack(track: MusicTrack) {
  props.form.music_source = 'library'
  props.form.music_track_id = track.id
}

function preview(url: string) {
  previewAudio?.pause()
  previewAudio = new Audio(url)
  void previewAudio.play()
}

async function onAudioSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  uploading.value = true
  error.value = ''
  try {
    const presign = await presignMedia(props.tributeId, {
      media_type: 'audio',
      filename: file.name,
      mime_type: file.type || 'audio/mpeg',
      size_bytes: file.size,
    })
    await uploadFile(file, presign)
    await confirmMedia(props.tributeId, presign.media_id)
    props.form.music_source = 'upload'
    props.form.music_track_id = null
    uploadedName.value = file.name
    emit('changed')
  } catch {
    error.value = 'Falha no upload do áudio.'
  } finally {
    uploading.value = false
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
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
}
.track:hover {
  border-color: var(--primary);
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
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
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
  color: var(--ink);
}
.track__meta {
  font-size: 0.84rem;
  color: var(--muted);
}
.track__play {
  flex-shrink: 0;
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
.player-toggle input {
  margin-top: 3px;
  accent-color: var(--primary);
}
.player-toggle span {
  display: flex;
  flex-direction: column;
}
.player-toggle strong {
  font-weight: 600;
  color: var(--ink);
}
.player-toggle small {
  font-size: 0.82rem;
  color: var(--muted);
}

.mt-3 {
  margin-top: 12px;
}
.hidden {
  display: none;
}
.ml-dropzone__title {
  font-weight: 600;
  color: inherit;
}
.ml-dropzone__hint {
  font-size: 0.82rem;
  color: var(--subtle);
}
</style>
