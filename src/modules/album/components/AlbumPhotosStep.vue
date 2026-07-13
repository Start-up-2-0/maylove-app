<template>
  <div class="photos-step">
    <WizardStepHeader
      title="Páginas do livro"
      :description="stepDescription"
    />

    <section class="layout-panel ml-card">
      <label class="layout-panel__field">
        <span class="layout-panel__label">Fotos por página</span>
        <select v-model.number="photosPerPage" class="ml-input ml-input--sm">
          <option v-for="option in layoutOptions" :key="option" :value="option">
            {{ option }} {{ option === 1 ? 'foto' : 'fotos' }} por página
          </option>
        </select>
      </label>
      <p class="layout-panel__hint text-muted">
        {{ pageEstimate }} páginas no livro com {{ photos.length }} foto(s) enviada(s).
        Textos de título e descrição aparecem em cada foto na prévia.
      </p>
    </section>

    <div v-if="photos.length" class="photo-grid">
      <figure v-for="(photo, index) in photos" :key="photo.id" class="photo-tile">
        <img
          v-if="mediaPreviewUrl(photo)"
          class="photo-tile__img"
          :src="mediaPreviewUrl(photo)!"
          alt=""
          loading="lazy"
        />
        <div v-else class="photo-tile__placeholder">Prévia indisponível</div>
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
            @input="queueCaptionSave(photo.id)"
          />
          <label class="photo-meta__date">
            <span class="photo-meta__date-label">Data (opcional)</span>
            <input
              v-model="captions[photo.id].memory_date"
              class="ml-input ml-input--sm"
              type="date"
              @change="queueCaptionSave(photo.id)"
            />
          </label>
          <textarea
            v-model="captions[photo.id].caption"
            class="ml-input ml-input--sm"
            rows="2"
            placeholder="Descrição (opcional)"
            @input="queueCaptionSave(photo.id)"
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
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
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
import { estimateBookPageCount } from '@/modules/album/book/buildModel'
import { resolveMediaUrl } from '@/modules/album/book/mediaUrl'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  albumId: string
  photos: AlbumMedia[]
  form: ReturnType<typeof useAlbumWizard>['form']
}>()

const emit = defineEmits<{ changed: [] }>()

const maxPhotos = MEDIA_LIMITS.photo.maxCountPerAlbum
const layoutOptions = [1, 2, 3, 4]
const uploading = ref(false)
const error = ref('')
const captions = reactive<Record<string, { title: string; caption: string; memory_date: string }>>({})
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()

const photosPerPage = computed({
  get: () => props.form.photos_per_page,
  set: (value: number) => {
    props.form.photos_per_page = value
  },
})

const pageEstimate = computed(() =>
  estimateBookPageCount(props.photos.length, photosPerPage.value),
)

const stepDescription = computed(
  () =>
    `Organize as fotos e os textos de cada página. Adicione até ${maxPhotos} fotos. ${photoUploadHint()}`,
)

watch(
  () => props.photos,
  (photos) => {
    for (const photo of photos) {
      captions[photo.id] = {
        title: photo.title ?? '',
        caption: photo.caption ?? '',
        memory_date: photo.memory_date ?? '',
      }
    }
  },
  { immediate: true, deep: true },
)

onBeforeUnmount(() => {
  void flushPendingCaptionSaves()
})

function mediaPreviewUrl(photo: AlbumMedia): string | null {
  return resolveMediaUrl(photo.url, photo.url_thumbnail)
}

function queueCaptionSave(mediaId: string) {
  const existing = saveTimers.get(mediaId)
  if (existing) clearTimeout(existing)
  saveTimers.set(
    mediaId,
    setTimeout(() => {
      saveTimers.delete(mediaId)
      void saveCaption(mediaId)
    }, 600),
  )
}

async function flushPendingCaptionSaves() {
  for (const timer of saveTimers.values()) {
    clearTimeout(timer)
  }
  saveTimers.clear()
  await Promise.all(props.photos.map((photo) => saveCaption(photo.id, false)))
}

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

async function saveCaption(mediaId: string, showError = true) {
  const meta = captions[mediaId]
  if (!meta) return
  try {
    await updateAlbum(props.albumId, {
      pages: [{
        media_id: mediaId,
        title: meta.title.trim(),
        caption: meta.caption.trim(),
        memory_date: meta.memory_date || null,
      }],
    })
  } catch {
    if (showError) {
      error.value = 'Não foi possível salvar o texto da foto.'
    }
  }
}
</script>

<style scoped>
.layout-panel {
  padding: 16px 18px;
  margin-bottom: 20px;
  display: grid;
  gap: 10px;
}

.layout-panel__field {
  display: grid;
  gap: 6px;
  max-width: 280px;
}

.layout-panel__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
}

.layout-panel__hint {
  font-size: 0.86rem;
  line-height: 1.45;
}

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

.photo-tile__placeholder {
  display: grid;
  place-items: center;
  min-height: 120px;
  padding: 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--muted);
  background: var(--surface-3);
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

.photo-meta__date {
  display: grid;
  gap: 4px;
}

.photo-meta__date-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
}

.hidden {
  display: none;
}

.mt-4 {
  margin-top: 16px;
}
</style>
