<template>
  <div class="music-step">
    <WizardStepHeader
      title="Música de fundo (opcional)"
      :description="`Uma trilha suave para acompanhar o álbum. ${audioUploadHint()}`"
    />

    <div v-if="audio?.url" class="music-current ml-card">
      <p class="music-current__label">Música atual</p>
      <audio :src="audio.url" controls class="music-current__player" />
      <button class="ml-btn ml-btn--ghost ml-btn--sm" @click="remove">Remover música</button>
    </div>

    <label v-else class="ml-dropzone" :class="{ 'ml-dropzone--disabled': uploading }">
      <input
        type="file"
        accept="audio/mpeg,audio/mp3,.mp3"
        class="hidden"
        :disabled="uploading"
        @change="onFileSelected"
      />
      <span v-if="uploading" class="ml-spinner" />
      <template v-else>
        <span class="ml-dropzone__title">Enviar MP3</span>
        <span class="ml-dropzone__hint">{{ audioUploadHint() }}</span>
      </template>
    </label>

    <p v-if="error" class="ml-alert ml-alert--danger mt-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { confirmAlbumMedia, deleteAlbumMedia, presignAlbumMedia } from '@/api/albums'
import type { AlbumMedia } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import { uploadFile } from '@/storage/upload'
import { audioUploadHint, validateAudioUpload } from '@/storage/validateUpload'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  albumId: string
  audio: AlbumMedia | null
}>()

const emit = defineEmits<{ changed: [] }>()

const uploading = ref(false)
const error = ref('')

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const validation = validateAudioUpload(file, props.audio ? 1 : 0)
  if (!validation.ok) {
    error.value = validation.message ?? 'Arquivo inválido.'
    return
  }

  uploading.value = true
  error.value = ''

  try {
    const presign = await presignAlbumMedia(props.albumId, {
      media_type: 'audio',
      filename: file.name,
      mime_type: 'audio/mpeg',
      size_bytes: file.size,
    })
    await uploadFile(file, presign)
    await confirmAlbumMedia(props.albumId, presign.media_id)
    emit('changed')
  } catch (err) {
    error.value = resolveApiError(err, 'Falha no upload de áudio.')
  } finally {
    uploading.value = false
  }
}

async function remove() {
  if (!props.audio) return
  try {
    await deleteAlbumMedia(props.albumId, props.audio.id)
    emit('changed')
  } catch {
    error.value = 'Não foi possível remover a música.'
  }
}
</script>

<style scoped>
.music-current {
  padding: 16px;
  margin-bottom: 16px;
}

.music-current__label {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.music-current__player {
  width: 100%;
  margin-bottom: 10px;
}

.hidden {
  display: none;
}
</style>
