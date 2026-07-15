<template>
  <div class="pages-step">
    <WizardStepHeader
      title="Diagramação das páginas"
      description="Arraste as páginas para reordenar · troque o layout · nas Polaroids mova, gire e redimensione."
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
      Nenhuma página ainda. Gere a partir da fototeca ou adicione layouts (spread, mosaico, Polaroid…).
    </p>

    <div class="pages-list">
      <article
        v-for="(page, index) in form.book_pages"
        :key="page.id"
        class="page-card"
        :class="{ 'page-card--dragging': dragIndex === index, 'page-card--over': dropIndex === index }"
        draggable="true"
        @dragstart="onPageDragStart(index, $event)"
        @dragover.prevent="onPageDragOver(index)"
        @dragleave="onPageDragLeave(index)"
        @drop.prevent="onPageDrop(index)"
        @dragend="onPageDragEnd"
      >
        <header class="page-card__head">
          <div class="page-card__identity">
            <span class="page-card__handle" title="Arraste para reordenar" aria-hidden="true">⠿</span>
            <div>
              <strong>Página {{ index + 1 }}</strong>
              <p class="page-card__hint">{{ layoutHint(page.layout) }}</p>
            </div>
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

        <div class="layout-chips" role="listbox" aria-label="Layout da página">
          <button
            v-for="layout in BOOK_PAGE_LAYOUTS"
            :key="layout.id"
            type="button"
            class="layout-chip"
            :class="{ 'layout-chip--active': page.layout === layout.id }"
            :title="layout.hint"
            @click="onLayoutChange(page, layout.id)"
          >
            {{ layout.label }}
          </button>
        </div>

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

        <div v-if="isPolaroidPageLayout(page.layout)" class="scrap-editor">
          <p class="scrap-editor__label">Composição Polaroid</p>
          <PolaroidScrapStage
            :photos="scrapPhotosFor(page)"
            :frame-style="form.book_config.frame_style"
            editable
            @change="(shots) => onScrapChange(page, shots)"
          />
        </div>
      </article>
    </div>

    <p class="text-muted pages-estimate">
      {{ form.book_pages.length || '0' }} página(s) de conteúdo
      (+ capa{{ form.closing_message || form.signature ? ' e contracapa' : '' }}).
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AlbumMedia } from '@/api/types'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import PolaroidScrapStage, { type ScrapShot } from '../book/shared/PolaroidScrapStage.vue'
import { resolveMediaUrl } from '../book/mediaUrl'
import {
  BOOK_PAGE_LAYOUTS,
  clampPolaroidScale,
  createBookPage,
  emptySlots,
  ensurePolaroidPlacements,
  isPolaroidPageLayout,
  slotCountForLayout,
  type BookPage,
  type BookPageLayout,
} from '../book/bookConfig'
import type { MemoryBookPhoto } from '../book/types'

const props = defineProps<{
  form: ReturnType<typeof useAlbumWizard>['form']
  photos: AlbumMedia[]
  album?: ReturnType<typeof useAlbumWizard>['album']['value']
}>()

const newLayout = ref<BookPageLayout>('one')
const dragIndex = ref<number | null>(null)
const dropIndex = ref<number | null>(null)

function layoutHint(layout: BookPageLayout) {
  return BOOK_PAGE_LAYOUTS.find((item) => item.id === layout)?.hint ?? ''
}

function scrapPhotosFor(page: BookPage): MemoryBookPhoto[] {
  const ensured = ensurePolaroidPlacements(page)
  const result: MemoryBookPhoto[] = []
  for (const slot of ensured.slots) {
    if (!slot.media_id) continue
    const media = props.photos.find((photo) => photo.id === slot.media_id)
    if (!media) continue
    result.push({
      id: media.id,
      url: resolveMediaUrl(media.url, media.url_thumbnail) ?? '',
      title: slot.show_title ? media.title ?? undefined : undefined,
      caption: slot.show_caption ? media.caption ?? undefined : undefined,
      memoryDate: slot.show_date ? media.memory_date ?? undefined : undefined,
      placeName: media.place_name ?? undefined,
      x: slot.x ?? undefined,
      y: slot.y ?? undefined,
      rotation: slot.rotation ?? undefined,
      scale: slot.scale ?? undefined,
    })
  }
  return result
}

function onScrapChange(page: BookPage, shots: ScrapShot[]) {
  const byId = new Map(shots.map((shot) => [shot.id, shot]))
  page.slots = page.slots.map((slot) => {
    if (!slot.media_id) return slot
    const shot = byId.get(slot.media_id)
    if (!shot) return slot
    return {
      ...slot,
      x: shot.x,
      y: shot.y,
      rotation: shot.rotation,
      scale: clampPolaroidScale(shot.scale),
    }
  })
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

function onPageDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onPageDragOver(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  dropIndex.value = index
}

function onPageDragLeave(index: number) {
  if (dropIndex.value === index) dropIndex.value = null
}

function onPageDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) {
    onPageDragEnd()
    return
  }
  const [item] = props.form.book_pages.splice(dragIndex.value, 1)
  props.form.book_pages.splice(index, 0, item)
  reindex()
  onPageDragEnd()
}

function onPageDragEnd() {
  dragIndex.value = null
  dropIndex.value = null
}

function onLayoutChange(page: BookPage, layoutId: string) {
  const layout = layoutId as BookPageLayout
  const count = slotCountForLayout(layout)
  page.layout = layout
  const previous = page.slots
  page.slots = emptySlots(count, layout).map((slot, index) => ({
    ...slot,
    media_id: previous[index]?.media_id ?? null,
    show_title: previous[index]?.show_title ?? slot.show_title,
    show_caption: previous[index]?.show_caption ?? slot.show_caption,
    show_date: previous[index]?.show_date ?? slot.show_date,
    x: previous[index]?.x ?? slot.x,
    y: previous[index]?.y ?? slot.y,
    rotation: previous[index]?.rotation ?? slot.rotation,
    scale: previous[index]?.scale ?? slot.scale,
  }))
  if (isPolaroidPageLayout(layout)) {
    page.slots = ensurePolaroidPlacements(page).slots
  }
}

/** Ritmo editorial + ocasional Polaroid scrap. */
function autoFillFromPhotos() {
  const sorted = [...props.photos].sort((a, b) => a.sort_order - b.sort_order)
  const pages: BookPage[] = []
  let i = 0

  while (i < sorted.length) {
    const remaining = sorted.length - i

    if (i === 0) {
      const page = createBookPage('spread', pages.length)
      page.slots = [
        {
          media_id: sorted[i].id,
          show_title: true,
          show_caption: false,
          show_date: true,
        },
      ]
      pages.push(page)
      i += 1
      continue
    }

    if (remaining >= 4 && i % 8 === 0) {
      const chunk = sorted.slice(i, i + 4)
      const page = createBookPage('four', pages.length)
      page.slots = chunk.map((photo) => ({
        media_id: photo.id,
        show_title: false,
        show_caption: false,
        show_date: false,
      }))
      pages.push(page)
      i += 4
      continue
    }

    if (remaining >= 3 && i % 7 === 0) {
      const chunk = sorted.slice(i, i + 3)
      const page = createBookPage('polaroid_3', pages.length)
      page.slots = page.slots.map((slot, idx) => ({
        ...slot,
        media_id: chunk[idx]?.id ?? null,
      }))
      pages.push(ensurePolaroidPlacements(page))
      i += 3
      continue
    }

    if (remaining >= 2 && i % 5 === 0) {
      const chunk = sorted.slice(i, i + 2)
      const page = createBookPage('polaroid_2', pages.length)
      page.slots = page.slots.map((slot, idx) => ({
        ...slot,
        media_id: chunk[idx]?.id ?? null,
      }))
      pages.push(ensurePolaroidPlacements(page))
      i += 2
      continue
    }

    if (remaining >= 3 && i % 4 === 0) {
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
  cursor: grab;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    opacity 140ms ease;
}

.page-card--dragging {
  opacity: 0.55;
}

.page-card--over {
  border-color: color-mix(in srgb, var(--accent, #c45d7a) 55%, var(--border));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent, #c45d7a) 18%, transparent);
}

.page-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.page-card__identity {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.page-card__handle {
  margin-top: 2px;
  color: var(--muted);
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  user-select: none;
}

.layout-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.layout-chip {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 10px;
  background: var(--surface-2, var(--surface));
  color: var(--ink, inherit);
  font-size: 0.75rem;
  cursor: pointer;
}

.layout-chip--active {
  border-color: color-mix(in srgb, var(--accent, #c45d7a) 60%, var(--border));
  background: color-mix(in srgb, var(--accent, #c45d7a) 12%, transparent);
  font-weight: 600;
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

.scrap-editor {
  display: grid;
  gap: 8px;
}

.scrap-editor__label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.pages-estimate {
  margin-top: 16px;
  font-size: 0.86rem;
}
</style>
