<template>
  <div class="pres-step">
    <WizardStepHeader
      title="Estilo do livro digital"
      description="Escolha como suas memórias serão apresentadas. Você pode trocar o estilo a qualquer momento antes de publicar."
    />

    <div class="pres-grid">
      <button
        v-for="item in presentations"
        :key="item.id"
        type="button"
        class="pres-card"
        :class="{ 'pres-card--active': form.presentation === item.id }"
        @click="select(item.id)"
      >
        <span class="pres-card__emoji" aria-hidden="true">{{ item.emoji }}</span>
        <strong class="pres-card__label">{{ item.name }}</strong>
        <span class="pres-card__desc">{{ item.description }}</span>
        <span class="pres-card__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>
    </div>

    <section v-if="previewBook" class="presentation-preview">
      <h3 class="presentation-preview__title">
        <span class="presentation-preview__dot" />
        Prévia do estilo selecionado
      </h3>
      <BookRenderer :book="previewBook" mode="preview" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import type { AlbumDetail } from '@/api/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import { BOOK_PRESENTATIONS } from '../book/presentations'
import { buildMemoryBookModelFromDetail } from '../book/buildModel'
import BookRenderer from '../book/BookRenderer.vue'
import type { BookPresentationId } from '../book/types'

const props = defineProps<{
  form: ReturnType<typeof useAlbumWizard>['form']
  album: AlbumDetail | null
}>()

const presentations = BOOK_PRESENTATIONS

const previewBook = computed(() => {
  if (!props.album) return null
  return buildMemoryBookModelFromDetail({
    ...props.album,
    content_json: { ...(props.album.content_json ?? {}), presentation: props.form.presentation },
  })
})

function select(id: BookPresentationId) {
  props.form.presentation = id
}
</script>

<style scoped>
.pres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.pres-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 18px 16px;
  text-align: left;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.pres-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.pres-card--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.pres-card__emoji {
  font-size: 1.9rem;
  line-height: 1;
}
.pres-card__label {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink);
}
.pres-card__desc {
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--muted);
}
.pres-card__check {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}
.pres-card--active .pres-card__check {
  opacity: 1;
  transform: scale(1);
}

.presentation-preview {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-3);
}

.presentation-preview :deep(.book--preview) {
  background: transparent;
}
.presentation-preview__title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}
.presentation-preview__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--primary);
}
</style>
