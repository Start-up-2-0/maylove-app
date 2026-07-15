<template>
  <div class="photos-step">
    <WizardStepHeader
      title="Fototeca"
      :description="stepDescription"
    />

    <section class="layout-panel ml-card">
      <p class="layout-panel__hint text-muted">
        {{ photos.length }} foto(s) na galeria. Defina a capa, reordene e complete título, descrição, data e local.
      </p>
    </section>
    <div v-if="photos.length" :class="isTimeline ? 'timeline-photos' : 'photo-grid'">
      <figure
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="photo-tile"
        :class="{
          'photo-tile--timeline': isTimeline,
          'photo-tile--dragging': photoDragIndex === index,
          'photo-tile--over': photoDropIndex === index,
        }"
        draggable="true"
        @dragstart="onPhotoDragStart(index, $event)"
        @dragover.prevent="onPhotoDragOver(index)"
        @dragleave="onPhotoDragLeave(index)"
        @drop.prevent="onPhotoDrop(index)"
        @dragend="onPhotoDragEnd"
      >
        <img
          v-if="mediaPreviewUrl(photo)"
          class="photo-tile__img"
          :src="mediaPreviewUrl(photo)!"
          alt=""
          loading="lazy"
          draggable="false"
        />
        <div v-else class="photo-tile__placeholder">Prévia indisponível</div>
        <figcaption class="photo-tile__bar">
          <span class="photo-tile__index">
            #{{ index + 1 }} · ⠿
            <em v-if="isCover(photo.id)" class="photo-tile__cover-tag">Capa</em>
          </span>
          <div class="photo-tile__actions">
            <button
              class="ml-icon-btn"
              :class="{ 'ml-icon-btn--active': isCover(photo.id) }"
              title="Definir como capa"
              @click="setAsCover(photo.id)"
            >
              ★
            </button>
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
          <label class="photo-meta__date">
            <span class="photo-meta__date-label">
              Data<span v-if="isTimeline" class="photo-meta__req">*</span>
              <span v-else> (opcional)</span>
            </span>
            <input
              v-model="captions[photo.id].memory_date"
              class="ml-input ml-input--sm"
              :class="{ 'ml-input--invalid': isTimeline && showValidation && !captions[photo.id]?.memory_date }"
              type="date"
              :required="isTimeline"
              @change="queueCaptionSave(photo.id)"
            />
          </label>
          <input
            v-model="captions[photo.id].title"
            class="ml-input ml-input--sm"
            :class="{ 'ml-input--invalid': isTimeline && showValidation && !captions[photo.id]?.title?.trim() }"
            :placeholder="isTimeline ? 'Título' : 'Título (opcional)'"
            :required="isTimeline"
            @input="queueCaptionSave(photo.id)"
          />
          <input
            v-model="captions[photo.id].place_name"
            class="ml-input ml-input--sm"
            placeholder="Local (opcional)"
            maxlength="160"
            @input="queueCaptionSave(photo.id)"
          />
          <textarea
            v-model="captions[photo.id].caption"
            class="ml-input ml-input--sm"
            :class="{ 'ml-input--invalid': isTimeline && showValidation && !captions[photo.id]?.caption?.trim() }"
            rows="2"
            :placeholder="isTimeline ? 'Descrição' : 'Descrição (opcional)'"
            :required="isTimeline"
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
import { isTimelinePresentation } from '@/modules/album/book/presentations'
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
const uploading = ref(false)
const error = ref('')
const captions = reactive<
  Record<string, { title: string; caption: string; memory_date: string; place_name: string }>
>({})
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()
const showValidation = ref(false)
const photoDragIndex = ref<number | null>(null)
const photoDropIndex = ref<number | null>(null)

const isTimeline = computed(() => isTimelinePresentation(props.form.presentation))

const stepDescription = computed(
  () =>
    `Envie as fotos da fototeca. Título, descrição, data e local aparecem nas páginas. Arraste para reordenar. Até ${maxPhotos} fotos. ${photoUploadHint()}`,
)

watch(
  () => props.form.presentation,
  (presentation) => {
    if (isTimelinePresentation(presentation)) {
      props.form.photos_per_page = 1
    }
    showValidation.value = false
  },
)

watch(
  () => props.photos,
  (photos) => {
    for (const photo of photos) {
      captions[photo.id] = {
        title: photo.title ?? '',
        caption: photo.caption ?? '',
        memory_date: photo.memory_date ?? '',
        place_name: photo.place_name ?? '',
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

function isCover(mediaId: string) {
  return props.form.book_config.cover.media_id === mediaId
}

function setAsCover(mediaId: string) {
  props.form.book_config.cover.media_id = mediaId
  props.form.book_config.cover.mode = 'photo'
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

function isPhotoTimelineComplete(photoId: string): boolean {
  const meta = captions[photoId]
  if (!meta) return false
  return Boolean(meta.memory_date && meta.title.trim() && meta.caption.trim())
}

function validateTimelineFields(): boolean {
  if (!isTimeline.value) return true
  showValidation.value = true
  const valid = props.photos.every((photo) => isPhotoTimelineComplete(photo.id))
  if (!valid) {
    error.value = 'Preencha data, título e descrição em todas as fotos da linha do tempo.'
  }
  return valid
}

defineExpose({
  flushPendingCaptionSaves,
  validateTimelineFields,
})

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

function onPhotoDragStart(index: number, event: DragEvent) {
  photoDragIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onPhotoDragOver(index: number) {
  if (photoDragIndex.value === null || photoDragIndex.value === index) return
  photoDropIndex.value = index
}

function onPhotoDragLeave(index: number) {
  if (photoDropIndex.value === index) photoDropIndex.value = null
}

async function onPhotoDrop(index: number) {
  if (photoDragIndex.value === null || photoDragIndex.value === index) {
    onPhotoDragEnd()
    return
  }
  const order = props.photos.map((photo) => photo.id)
  const [id] = order.splice(photoDragIndex.value, 1)
  order.splice(index, 0, id)
  onPhotoDragEnd()
  try {
    await reorderAlbumMedia(props.albumId, order)
    emit('changed')
  } catch {
    error.value = 'Não foi possível reordenar as fotos.'
  }
}

function onPhotoDragEnd() {
  photoDragIndex.value = null
  photoDropIndex.value = null
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
        place_name: meta.place_name.trim() || null,
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

.timeline-photos {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.photo-tile--timeline {
  display: grid;
  grid-template-columns: minmax(96px, 140px) 1fr;
  gap: 12px;
  align-items: start;
}

.photo-tile__cover-tag {
  margin-left: 6px;
  font-style: normal;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent, #c45d7a);
}

.ml-icon-btn--active {
  color: var(--accent, #c45d7a);
}

.photo-tile--dragging {
  opacity: 0.55;
}

.photo-tile--over {
  outline: 2px solid color-mix(in srgb, var(--accent, #c45d7a) 55%, transparent);
  outline-offset: 2px;
}

.photo-tile--timeline .photo-tile__img {
  aspect-ratio: auto;
  max-height: 180px;
  object-fit: contain;
  background: var(--surface-3);
}

.photo-tile--timeline .photo-tile__placeholder {
  min-height: 96px;
  aspect-ratio: auto;
}

.photo-tile--timeline .photo-tile__bar {
  grid-column: 1 / -1;
}

.photo-tile--timeline .photo-meta {
  padding: 0 10px 10px 0;
}

.photo-meta__req {
  color: var(--error);
  margin-left: 2px;
}

.ml-input--invalid {
  border-color: var(--error);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--error) 20%, transparent);
}

@media (max-width: 560px) {
  .photo-tile--timeline {
    grid-template-columns: 1fr;
  }

  .photo-tile--timeline .photo-meta {
    padding: 0 10px 10px;
  }
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
  height: auto;
  max-height: 220px;
  object-fit: contain;
  object-position: center;
  display: block;
  background: var(--surface-3);
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
