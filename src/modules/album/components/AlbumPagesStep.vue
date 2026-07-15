<template>
  <div class="pages-step">
    <WizardStepHeader
      title="Diagramação das páginas"
      description="Monte a narrativa: escolha o layout, as fotos e o ritmo entre imagens e texto — como em um photobook de estúdio."
    />

    <div class="pages-toolbar">
      <label class="ml-field pages-toolbar__add">
        <span>Adicionar página</span>
        <select v-model="newLayout" class="ml-input ml-input--sm">
          <option v-for="layout in BOOK_PAGE_LAYOUTS" :key="layout.id" :value="layout.id">
            {{ layout.label }}
          </option>
        </select>
      </label>
      <button type="button" class="ml-btn ml-btn--primary" @click="addPage">Adicionar</button>
      <button
        type="button"
        class="ml-btn ml-btn--secondary"
        :disabled="!photos.length"
        @click="autoFillFromPhotos"
      >
        Gerar a partir da fototeca
      </button>
    </div>

    <p v-if="!form.book_pages.length" class="text-muted pages-empty">
      Nenhuma página ainda. Gere a partir da fototeca ou adicione layouts (foto inteira, legenda, texto…).
    </p>

    <div class="pages-list">
      <article v-for="(page, index) in form.book_pages" :key="page.id" class="page-card">
        <header class="page-card__head">
          <div>
            <strong>Página {{ index + 1 }}</strong>
            <p class="page-card__hint">{{ layoutHint(page.layout) }}</p>
          </div>
          <div class="page-card__actions">
            <button type="button" class="ml-icon-btn" :disabled="index === 0" @click="movePage(index, -1)">
              ↑
            </button>
            <button
              type="button"
              class="ml-icon-btn"
              :disabled="index === form.book_pages.length - 1"
              @click="movePage(index, 1)"
            >
              ↓
            </button>
            <button type="button" class="ml-icon-btn" title="Duplicar" @click="duplicatePage(index)">
              ⧉
            </button>
            <button
              type="button"
              class="ml-icon-btn ml-icon-btn--danger"
              title="Remover"
              @click="removePage(index)"
            >
              ×
            </button>
          </div>
        </header>

        <label class="ml-field">
          <span>Layout</span>
          <select
            class="ml-input ml-input--sm"
            :value="page.layout"
            @change="onLayoutChange(page, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="layout in BOOK_PAGE_LAYOUTS" :key="layout.id" :value="layout.id">
              {{ layout.label }}
            </option>
          </select>
        </label>

        <div class="page-meta">
          <input
            v-model="page.title"
            class="ml-input ml-input--sm"
            placeholder="Título da página (opcional)"
          />
          <textarea
            v-if="page.layout === 'text' || page.layout === 'text_photo'"
            v-model="page.place_name"
            class="ml-input ml-input--sm"
            rows="3"
            placeholder="Texto narrativo desta página…"
          />
        </div>

        <div v-if="page.slots.length" class="slots">
          <div v-for="(slot, slotIndex) in page.slots" :key="`${page.id}-${slotIndex}`" class="slot">
            <p class="slot__label">Foto {{ slotIndex + 1 }}</p>
            <select v-model="slot.media_id" class="ml-input ml-input--sm">
              <option :value="null">Selecionar foto…</option>
              <option v-for="photo in photos" :key="photo.id" :value="photo.id">
                {{ photo.title || photo.original_filename || `Foto ${photo.sort_order + 1}` }}
              </option>
            </select>
            <div class="slot__toggles">
              <label><input v-model="slot.show_date" type="checkbox" /> Data</label>
              <label><input v-model="slot.show_title" type="checkbox" /> Título</label>
              <label><input v-model="slot.show_caption" type="checkbox" /> Descrição</label>
            </div>
          </div>
        </div>
      </article>
    </div>

    <p class="text-muted pages-estimate">
      {{ form.book_pages.length || '0' }} página(s) de conteúdo
      (+ capa{{ form.closing_message || form.signature ? ' e contracapa' : '' }}).
    </p>
    <section v-if="previewBook" class="pages-preview">
      <h3 class="pages-preview__title">Prévia do livro</h3>
      <BookRenderer :book="previewBook" mode="preview" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AlbumMedia } from '@/api/types'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import BookRenderer from '../book/BookRenderer.vue'
import { buildMemoryBookModelFromDetail } from '../book/buildModel'
import {
  BOOK_PAGE_LAYOUTS,
  createBookPage,
  emptySlots,
  slotCountForLayout,
  type BookPage,
  type BookPageLayout,
} from '../book/bookConfig'

const props = defineProps<{
  form: ReturnType<typeof useAlbumWizard>['form']
  photos: AlbumMedia[]
  album?: ReturnType<typeof useAlbumWizard>['album']['value']
}>()

const newLayout = ref<BookPageLayout>('one')

const previewBook = computed(() => {
  if (!props.album) return null
  return buildMemoryBookModelFromDetail({
    ...props.album,
    title: props.form.title,
    subtitle: props.form.subtitle,
    closing_message: props.form.closing_message,
    signature: props.form.signature,
    color_primary: props.form.book_config.colors.accent,
    presentation: props.form.presentation,
    photos_per_page: props.form.photos_per_page,
    book_config: props.form.book_config,
    book_pages: props.form.book_pages,
  })
})

function layoutHint(layout: BookPageLayout) {
  return BOOK_PAGE_LAYOUTS.find((item) => item.id === layout)?.hint ?? ''
}

function reindex() {
  props.form.book_pages.forEach((page, index) => {
    page.sort_order = index
  })
}

function addPage() {
  props.form.book_pages.push(createBookPage(newLayout.value, props.form.book_pages.length))
}

function removePage(index: number) {
  props.form.book_pages.splice(index, 1)
  reindex()
}

function duplicatePage(index: number) {
  const source = props.form.book_pages[index]
  const clone: BookPage = {
    ...structuredClone(source),
    id: crypto.randomUUID(),
    sort_order: index + 1,
  }
  props.form.book_pages.splice(index + 1, 0, clone)
  reindex()
}

function movePage(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= props.form.book_pages.length) return
  const [item] = props.form.book_pages.splice(index, 1)
  props.form.book_pages.splice(target, 0, item)
  reindex()
}

function onLayoutChange(page: BookPage, layoutId: string) {
  const layout = layoutId as BookPageLayout
  const count = slotCountForLayout(layout)
  page.layout = layout
  const previous = page.slots
  page.slots = emptySlots(count).map((slot, index) => ({
    ...slot,
    media_id: previous[index]?.media_id ?? null,
    show_title: previous[index]?.show_title ?? true,
    show_caption: previous[index]?.show_caption ?? true,
    show_date: previous[index]?.show_date ?? true,
  }))
}

/** Ritmo editorial: 1ª foto em bleed, depois foto+legenda; pares viram duo. */
function autoFillFromPhotos() {
  const sorted = [...props.photos].sort((a, b) => a.sort_order - b.sort_order)
  const pages: BookPage[] = []
  let i = 0

  while (i < sorted.length) {
    const remaining = sorted.length - i

    if (i === 0) {
      const page = createBookPage('bleed', pages.length)
      page.slots = [
        {
          media_id: sorted[i].id,
          show_title: false,
          show_caption: false,
          show_date: false,
        },
      ]
      pages.push(page)
      i += 1
      continue
    }

    if (remaining >= 3 && i % 5 === 0) {
      const chunk = sorted.slice(i, i + 3)
      const page = createBookPage('three', pages.length)
      page.slots = chunk.map((photo) => ({
        media_id: photo.id,
        show_title: true,
        show_caption: false,
        show_date: true,
      }))
      pages.push(page)
      i += 3
      continue
    }

    if (remaining >= 2 && i % 4 === 0) {
      const chunk = sorted.slice(i, i + 2)
      const page = createBookPage('two', pages.length)
      page.slots = chunk.map((photo) => ({
        media_id: photo.id,
        show_title: true,
        show_caption: false,
        show_date: true,
      }))
      pages.push(page)
      i += 2
      continue
    }

    const page = createBookPage('one', pages.length)
    page.slots = [
      {
        media_id: sorted[i].id,
        show_title: true,
        show_caption: true,
        show_date: true,
      },
    ]
    pages.push(page)
    i += 1
  }

  props.form.book_pages = pages
}
</script>

<style scoped>
.pages-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}

.pages-toolbar__add {
  min-width: 200px;
}

.pages-empty {
  margin-bottom: 16px;
}

.pages-list {
  display: grid;
  gap: 14px;
}

.page-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  background: var(--surface);
  display: grid;
  gap: 12px;
}

.page-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.page-card__hint {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--muted);
}

.page-card__actions {
  display: flex;
  gap: 4px;
}

.page-meta,
.slots {
  display: grid;
  gap: 10px;
}

.slot {
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 10px;
  display: grid;
  gap: 8px;
}

.slot__label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.slot__toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.86rem;
}

.pages-estimate {
  margin-top: 16px;
  font-size: 0.86rem;
}

.pages-preview {
  margin-top: 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-3);
}

.pages-preview__title {
  margin: 0;
  padding: 12px 16px;
  font-size: 0.95rem;
  border-bottom: 1px solid var(--border);
}
</style>
