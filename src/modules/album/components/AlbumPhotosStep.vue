<template>
  <div class="photos-step">
    <WizardStepHeader
      title="Páginas do livro"
      :description="`Cada foto é um capítulo da história. Adicione até ${maxPhotos} páginas. ${photoUploadHint()}`"
    />

    <div v-if="photos.length" class="photo-grid">
      <figure v-for="(photo, index) in photos" :key="photo.id" class="photo-tile">
        <img class="photo-tile__img" :src="photo.url || photo.url_thumbnail || ''" alt="" loading="lazy" />
        <figcaption class="photo-tile__bar">
          <span class="photo-tile__index">#{{ index + 1 }}</span>
          <div class="photo-tile__actions">
            <button class="ml-icon-btn" :disabled="index === 0" title="Mover para cima" @click="move(index, -1)">
              ↑
            </button>
            <button
              class="ml-icon-btn"
              :disabled="index === photos.length - 1"
              title="Mover para baixo"
              @click="move(index, 1)"
            >
              ↓
            </button>
            <button class="ml-icon-btn ml-icon-btn--danger" title="Remover" @click="remove(photo.id)">×</button>
          </div>
        </figcaption>
        <div class="photo-meta">
          <input
            v-model="captions[photo.id].title"
            class="ml-input ml-input--sm"
            placeholder="Título (opcional)"
            @blur="saveCaption(photo.id)"
          />
          <input
            v-model="captions[photo.id].memory_date"
            class="ml-input ml-input--sm"
            placeholder="Data ou período (opcional)"
            @blur="saveCaption(photo.id)"
          />
          <textarea
            v-model="captions[photo.id].caption"
            class="ml-input ml-input--sm"
            rows="2"
            placeholder="Descrição (opcional)"
            @blur="saveCaption(photo.id)"
          />
        </div>
      </figure>
    </div>

    <label class="ml-dropzone" :class="{ 'ml-dropzone--disabled': photos.length >= maxPhotos || uploading }">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="hidden"
        :disabled="photos.length >= maxPhotos || uploading"
        @change="onFilesSelected"
      />
      <span v-if="uploading" class="ml-spinner" />
      <template v-else>
        <span class="ml-dropzone__title">Clique para adicionar fotos</span>
        <span class="ml-dropzone__hint">{{ photoUploadHint() }}</span>
      </template>
    </label>

    <p v-if="error" class="ml-alert ml-alert--danger mt-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
  confirmAlbumMedia,
  deleteAlbumMedia,
  presignAlbumMedia,
  reorderAlbumMedia,
  updateAlbum,
} from '@/api/albums'
import type { AlbumMedia } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import { uploadFile } from '@/storage/upload'
import { inferImageMimeType } from '@/storage/mime'
import { photoUploadHint, validatePhotoUpload } from '@/storage/validateUpload'
import { MEDIA_LIMITS } from '@/config/mediaLimits'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  albumId: string
  photos: AlbumMedia[]
}>()

const emit = defineEmits<{ changed: [] }>()

const maxPhotos = MEDIA_LIMITS.photo.maxCountPerAlbum
const uploading = ref(false)
const error = ref('')
const captions = reactive<Record<string, { title: string; caption: string; memory_date: string }>>({})

watch(
  () => props.photos,
  (photos) => {
    for (const photo of photos) {
      if (!captions[photo.id]) {
        captions[photo.id] = {
          title: photo.title ?? '',
          caption: photo.caption ?? '',
          memory_date: photo.memory_date ?? '',
        }
      }
    }
  },
  { immediate: true },
)

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return

  uploading.value = true
  error.value = ''

  try {
    let count = props.photos.length
    for (const file of files) {
      if (count >= maxPhotos) break

      const validation = await validatePhotoUpload(file, count)
      if (!validation.ok) {
        throw new Error(validation.message)
      }

      const mimeType = inferImageMimeType(file)
      if (!mimeType) {
        throw new Error('Formato não suportado. Use JPEG, PNG ou WebP.')
      }

      const presign = await presignAlbumMedia(props.albumId, {
        media_type: 'photo',
        filename: file.name,
        mime_type: mimeType,
        size_bytes: file.size,
      })
      await uploadFile(file, presign)
      await confirmAlbumMedia(props.albumId, presign.media_id)
      count += 1
      emit('changed')
    }
  } catch (err) {
    error.value = resolveApiError(
      err,
      'Falha no upload. Verifique formato, tamanho e quantidade de fotos.',
    )
  } finally {
    uploading.value = false
  }
}

async function remove(mediaId: string) {
  try {
    await deleteAlbumMedia(props.albumId, mediaId)
    emit('changed')
  } catch {
    error.value = 'Não foi possível remover a foto.'
  }
}

async function move(index: number, direction: -1 | 1) {
  const order = props.photos.map((photo) => photo.id)
  const target = index + direction
  if (target < 0 || target >= order.length) return
  ;[order[index], order[target]] = [order[target], order[index]]
  try {
    await reorderAlbumMedia(props.albumId, order)
    emit('changed')
  } catch {
    error.value = 'Não foi possível reordenar as fotos.'
  }
}

async function saveCaption(mediaId: string) {
  const meta = captions[mediaId]
  if (!meta) return
  try {
    await updateAlbum(props.albumId, {
      pages: [{
        media_id: mediaId,
        title: meta.title,
        caption: meta.caption,
        memory_date: meta.memory_date,
      }],
    })
  } catch {
    error.value = 'Não foi possível salvar o texto da foto.'
  }
}
</script>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.photo-tile {
  margin: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-2);
}

.photo-tile__img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.photo-tile__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
}

.photo-meta {
  padding: 0 10px 10px;
  display: grid;
  gap: 8px;
}

.hidden {
  display: none;
}

.mt-4 {
  margin-top: 16px;
}
</style>
