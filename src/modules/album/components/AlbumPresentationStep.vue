<template>
  <div class="presentation-step">
    <WizardStepHeader
      title="Estilo do livro digital"
      description="Escolha como suas memórias serão apresentadas. Você pode trocar o estilo a qualquer momento antes de publicar."
    />

    <div class="presentation-grid">
      <button
        v-for="item in presentations"
        :key="item.id"
        type="button"
        class="presentation-card"
        :class="{ 'presentation-card--active': selected === item.id }"
        @click="select(item.id)"
      >
        <span class="presentation-card__emoji" aria-hidden="true">{{ item.emoji }}</span>
        <span class="presentation-card__name">{{ item.name }}</span>
        <span class="presentation-card__desc">{{ item.description }}</span>
      </button>
    </div>

    <div v-if="previewBook" class="presentation-preview">
      <p class="presentation-preview__label">Prévia do estilo</p>
      <BookRenderer :book="previewBook" mode="preview" />
    </div>

    <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>
    <button class="ml-btn ml-btn--primary" :disabled="saving" @click="save">
      {{ saving ? 'Salvando...' : 'Confirmar estilo' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { updateAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import { BOOK_PRESENTATIONS, DEFAULT_BOOK_PRESENTATION } from '../book/presentations'
import { buildMemoryBookModelFromDetail } from '../book/buildModel'
import BookRenderer from '../book/BookRenderer.vue'
import type { BookPresentationId } from '../book/types'

const props = defineProps<{ album: AlbumDetail }>()
const emit = defineEmits<{ saved: [AlbumDetail] }>()

const presentations = BOOK_PRESENTATIONS
const selected = ref<BookPresentationId>(DEFAULT_BOOK_PRESENTATION)
const saving = ref(false)
const error = ref('')

watch(
  () => props.album,
  (album) => {
    selected.value = (album.presentation as BookPresentationId) || DEFAULT_BOOK_PRESENTATION
  },
  { immediate: true },
)

const previewBook = computed(() =>
  buildMemoryBookModelFromDetail({
    ...props.album,
    presentation: selected.value,
  }),
)

function select(id: BookPresentationId) {
  selected.value = id
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    const updated = await updateAlbum(props.album.id, { presentation: selected.value })
    emit('saved', updated)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível salvar o estilo.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.presentation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.presentation-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.presentation-card--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent);
}

.presentation-card__emoji {
  font-size: 1.6rem;
}

.presentation-card__name {
  font-weight: 600;
}

.presentation-card__desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.presentation-preview {
  margin-bottom: 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-3);
}

.presentation-preview__label {
  padding: 10px 14px;
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
</style>
