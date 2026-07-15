<template>
  <div class="preview-step">
    <WizardStepHeader
      title="Prévia do álbum"
      description="A prévia é gerada aqui com o estado salvo — capa, galeria masonry e música."
    />

    <div class="review-summary">
      <div class="review-summary__item">
        <span class="review-summary__label">Formato</span>
        <span class="review-summary__value">{{ presentationLabel }}</span>
      </div>
      <div class="review-summary__item">
        <span class="review-summary__label">Fotos</span>
        <span class="review-summary__value">{{ photoCount }}</span>
      </div>
      <div class="review-summary__item">
        <span class="review-summary__label">Música</span>
        <span class="review-summary__value">{{ musicLabel }}</span>
      </div>
    </div>

    <div class="preview-toolbar">
      <button
        type="button"
        class="ml-btn ml-btn--secondary"
        :disabled="generating"
        @click="$emit('regenerate')"
      >
        {{ generating ? 'Gerando…' : 'Gerar prévia novamente' }}
      </button>
    </div>

    <section v-if="generating" class="preview-loading" aria-live="polite">
      <span class="ml-spinner" />
      <p>Gerando prévia do álbum…</p>
    </section>

    <section v-else-if="bookModel" class="review-preview">
      <h3 class="review-preview__title">
        <span class="review-preview__dot" />
        Prévia gerada
      </h3>
      <BookRenderer :key="refreshToken" :book="bookModel" mode="preview" />
    </section>

    <p v-else class="text-muted">Não foi possível montar a prévia. Tente gerar novamente.</p>

    <div class="review-actions">
      <button
        class="ml-btn ml-btn--primary ml-btn--lg"
        :disabled="generating || !bookModel"
        @click="$emit('go-publish')"
      >
        Tudo certo — ir para publicar
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import type { AlbumDetail } from '@/api/types'
import { getBookPresentation } from '@/modules/album/book/presentations'
import { buildMemoryBookModelFromDetail } from '@/modules/album/book/buildModel'
import BookRenderer from '@/modules/album/book/BookRenderer.vue'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  album: AlbumDetail | null
  form: ReturnType<typeof useAlbumWizard>['form']
  refreshToken: number
  generating?: boolean
}>()

defineEmits<{
  'go-publish': []
  regenerate: []
}>()

const localReadyToken = ref(-1)

watch(
  () => props.refreshToken,
  (token) => {
    if (!props.generating) localReadyToken.value = token
  },
  { immediate: true },
)

watch(
  () => props.generating,
  (generating) => {
    if (!generating) localReadyToken.value = props.refreshToken
  },
)

const generating = computed(() => Boolean(props.generating) || localReadyToken.value !== props.refreshToken)

const presentationLabel = computed(() => {
  const item = getBookPresentation(props.form.presentation)
  return item?.name ?? 'Memory Book'
})

const photoCount = computed(
  () => (props.album?.media ?? []).filter((m) => m.media_type === 'photo').length,
)

const musicLabel = computed(() => {
  const hasAudio = (props.album?.media ?? []).some((m) => m.media_type === 'audio')
  return hasAudio ? 'Com trilha' : 'Sem música'
})

const bookModel = computed(() => {
  if (generating.value || !props.album) return null
  return buildMemoryBookModelFromDetail({
    ...props.album,
    title: props.form.title || props.album.title,
    subtitle: props.form.subtitle || props.album.subtitle,
    closing_message: props.form.closing_message || props.album.closing_message,
    signature: props.form.signature || props.album.signature,
    color_primary: props.form.book_config.colors.accent || props.album.color_primary,
    presentation: props.form.presentation,
    photos_per_page: props.form.photos_per_page ?? props.album.photos_per_page,
    book_config: props.form.book_config,
    book_pages: props.form.book_pages,
  })
})
</script>

<style scoped>
.review-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.review-summary__item {
  flex: 1;
  min-width: 120px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.review-summary__label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.review-summary__value {
  display: block;
  margin-top: 4px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
}

.preview-toolbar {
  margin-bottom: 16px;
}

.preview-loading {
  display: grid;
  place-items: center;
  gap: 12px;
  min-height: 220px;
  margin-bottom: 24px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  color: var(--muted);
}

.preview-loading p {
  margin: 0;
  font-size: 0.95rem;
}

.review-preview {
  margin-bottom: 24px;
  overflow-x: clip;
  border-radius: var(--radius-md);
}
.review-preview__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 1rem;
  font-weight: 600;
}
.review-preview__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--primary);
}

.review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 640px) {
  .review-summary__item {
    min-width: calc(50% - 6px);
    flex: 1 1 calc(50% - 6px);
    padding: 12px;
  }

  .review-actions .ml-btn,
  .preview-toolbar .ml-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
