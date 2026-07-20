<template>
  <div class="photos-step">
    <WizardStepHeader
      v-if="!compact"
      title="Fotos da homenagem"
      :description="`Envie pelo menos uma foto. Máximo de ${maxPhotos} neste template.`"
    />

    <div v-if="variant !== 'cover'" class="ph-context" :class="{ 'ph-context--warn': needsMore }">
      <span class="ph-context__emoji" aria-hidden="true">{{ presentationEmoji }}</span>
      <span class="ph-context__text">{{ photoGuidance }}</span>
    </div>

    <p v-else class="ph-cover-tip">
      Comece com <strong>1 foto de capa</strong>. Você pode enviar mais imagens depois — elas entram na galeria da página.
    </p>

    <div v-if="photos.length" class="photo-grid">
      <figure v-for="(photo, index) in photos" :key="photo.id" class="photo-tile">
        <img class="photo-tile__img" :src="photo.url || photo.url_thumbnail || ''" alt="" loading="lazy" />
        <figcaption class="photo-tile__bar">
          <span class="photo-tile__index">#{{ index + 1 }}</span>
          <div class="photo-tile__actions">
            <button class="ml-icon-btn" :disabled="index === 0" title="Mover para cima" @click="move(index, -1)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M6 11l6-6 6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button class="ml-icon-btn" :disabled="index === photos.length - 1" title="Mover para baixo" @click="move(index, 1)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button class="ml-icon-btn ml-icon-btn--danger" title="Remover" @click="remove(photo.id)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </figcaption>
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
      <span v-else class="ml-dropzone__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 16V4M8 8l4-4 4 4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke-linecap="round" />
        </svg>
      </span>
      <span v-if="uploading">Enviando {{ uploadLabel }}...</span>
      <template v-else>
        <span class="ml-dropzone__title">
          {{ variant === 'cover' && !photos.length ? 'Adicionar foto de capa' : 'Clique para adicionar fotos' }}
        </span>
        <span class="ml-dropzone__hint">
          JPEG, PNG ou WebP · até {{ maxPhotos }} foto{{ maxPhotos === 1 ? '' : 's' }}
        </span>
      </template>
    </label>

    <p v-if="error" class="ml-alert ml-alert--danger mt-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { confirmMedia, deleteMedia, presignMedia, reorderMedia } from '@/api/tributes'
import type { TributeMedia } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import { uploadFile } from '@/storage/upload'
import { inferImageMimeType } from '@/storage/mime'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { resolvePresentationSchema } from '@/templates/presentationSchema'
import type { TemplateDefinition } from '@/templates/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = withDefaults(
  defineProps<{
    tributeId: string
    photos: TributeMedia[]
    maxPhotos: number
    form: ReturnType<typeof useTributeWizard>['form']
    definition?: TemplateDefinition | null
    compact?: boolean
    /** cover = passo Romance (foto de capa); default = galeria completa */
    variant?: 'default' | 'cover'
  }>(),
  { compact: false, definition: null, variant: 'default' },
)

// O schema da apresentação define como as fotos são usadas e o mínimo recomendado.
const schema = computed(() =>
  resolvePresentationSchema(props.form.presentation, props.definition ?? undefined),
)
const presentationEmoji = computed(() => schema.value.presentationEmoji)

const needsMore = computed(
  () => schema.value.photos.minPhotos > 0 && props.photos.length < schema.value.photos.minPhotos,
)

const photoGuidance = computed(() => {
  const base = schema.value.photos.guidance
  if (needsMore.value) {
    return `${base} Recomendado: pelo menos ${schema.value.photos.minPhotos} foto(s) para esta experiência.`
  }
  return base
})

const emit = defineEmits<{ changed: [] }>()

const uploading = ref(false)
const uploadLabel = ref('')
const error = ref('')

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return

  uploading.value = true
  error.value = ''

  try {
    for (const file of files) {
      if (props.photos.length >= props.maxPhotos) break
      const mimeType = inferImageMimeType(file)
      if (!mimeType) {
        throw new Error('Formato não suportado. Use JPEG, PNG ou WebP.')
      }

      uploadLabel.value = file.name
      const presign = await presignMedia(props.tributeId, {
        media_type: 'photo',
        filename: file.name,
        mime_type: mimeType,
        size_bytes: file.size,
      })
      await uploadFile(file, presign)
      await confirmMedia(props.tributeId, presign.media_id)
      emit('changed')
    }
  } catch (err) {
    error.value = resolveApiError(
      err,
      'Falha no upload. Verifique tamanho (máx. 50 MB) e formato (JPEG, PNG ou WebP).',
    )
  } finally {
    uploading.value = false
    uploadLabel.value = ''
  }
}

async function remove(mediaId: string) {
  try {
    await deleteMedia(props.tributeId, mediaId)
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
    await reorderMedia(props.tributeId, order)
    emit('changed')
  } catch {
    error.value = 'Não foi possível reordenar as fotos.'
  }
}
</script>

<style scoped>
.ph-context {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 20px;
  border-radius: var(--radius-md);
  background: var(--surface-3);
  border: 1px solid var(--border);
}
.ph-context__emoji {
  font-size: 1.2rem;
  line-height: 1;
}
.ph-context__text {
  font-size: 0.9rem;
  color: var(--text);
}
.ph-context--warn {
  background: var(--warning-soft, color-mix(in srgb, #f59e0b 14%, transparent));
  border-color: color-mix(in srgb, #f59e0b 45%, var(--border));
}
.ph-cover-tip {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--rom-muted, #9f1239);
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 18%, var(--border));
}
.ph-cover-tip strong {
  font-weight: 700;
  color: var(--ink);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.photo-tile {
  margin: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.photo-tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.photo-tile__img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
.photo-tile__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
}
.photo-tile__index {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--subtle);
}
.photo-tile__actions {
  display: flex;
  gap: 5px;
}
.mt-4 {
  margin-top: 16px;
}
.ml-dropzone__title {
  font-weight: 600;
  color: inherit;
}
.ml-dropzone__hint {
  font-size: 0.82rem;
  color: var(--subtle);
}
.hidden {
  display: none;
}
</style>
