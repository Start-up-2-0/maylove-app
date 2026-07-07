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

    <div v-if="supportsMusic" class="flex flex-wrap gap-2 mb-5">
      <FwbButton
        :color="form.music_source === 'library' ? 'pink' : 'alternative'"
        size="sm"
        @click="setSource('library')"
      >
        Biblioteca
      </FwbButton>
      <FwbButton
        :color="form.music_source === 'upload' ? 'pink' : 'alternative'"
        size="sm"
        @click="setSource('upload')"
      >
        Upload MP3
      </FwbButton>
      <FwbButton
        :color="form.music_source === 'none' ? 'pink' : 'alternative'"
        size="sm"
        @click="setSource('none')"
      >
        Sem música
      </FwbButton>
    </div>

    <section v-if="supportsMusic && form.music_source === 'library'">
      <div class="flex flex-wrap gap-2 mb-4">
        <FwbButton
          v-for="category in categories"
          :key="category"
          size="xs"
          :color="selectedCategory === category ? 'pink' : 'light'"
          @click="selectedCategory = category"
        >
          {{ category }}
        </FwbButton>
      </div>

      <div v-if="loadingTracks" class="flex items-center gap-2 text-gray-500 py-6">
        <FwbSpinner size="6" />
        Carregando faixas...
      </div>

      <FwbListGroup v-else class="mb-4">
        <FwbListGroupItem
          v-for="track in tracks"
          :key="track.id"
          :class="{ 'bg-pink-50 dark:bg-pink-950/20': form.music_track_id === track.id }"
          @click="selectTrack(track)"
        >
          <div class="flex items-center justify-between gap-3 w-full">
            <div>
              <strong class="block text-gray-900 dark:text-white">{{ track.title }}</strong>
              <span class="text-sm text-gray-500">
                {{ track.artist }} · {{ formatDuration(track.duration_seconds) }}
              </span>
            </div>
            <FwbButton color="light" size="xs" @click.stop="preview(track.preview_url)">
              ▶
            </FwbButton>
          </div>
        </FwbListGroupItem>
      </FwbListGroup>
    </section>

    <section v-else-if="supportsMusic && form.music_source === 'upload'">
      <label
        class="flex flex-col items-center justify-center min-h-[120px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center cursor-pointer"
        :class="{ 'opacity-60 cursor-not-allowed': uploading }"
      >
        <input
          type="file"
          accept="audio/mpeg,audio/mp3"
          class="hidden"
          :disabled="uploading"
          @change="onAudioSelected"
        />
        <FwbSpinner v-if="uploading" size="6" class="mb-2" />
        <span v-if="uploading" class="text-gray-500">Enviando áudio...</span>
        <span v-else class="text-gray-500">Clique para enviar MP3</span>
      </label>
      <FwbAlert v-if="uploadedName" type="success" class="mt-3">
        Arquivo enviado: {{ uploadedName }}
      </FwbAlert>
    </section>

    <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
  FwbAlert,
  FwbButton,
  FwbListGroup,
  FwbListGroupItem,
  FwbSpinner,
} from 'flowbite-vue'
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
