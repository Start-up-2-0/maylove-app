<template>
  <div class="memories-step">
    <WizardStepHeader title="Memórias" :description="stepDescription" />

    <section class="layout-panel ml-card">
      <p class="layout-panel__hint text-muted">
        Organize o álbum em capítulos e memórias. Cada memória reúne fotos da fototeca, texto, data e
        local. O livro é gerado automaticamente a partir daqui.
      </p>

      <div v-if="loading" class="text-muted">Carregando memórias…</div>

      <div v-else class="chapters">
        <div v-for="(chapter, chapterIndex) in chapters" :key="chapter.id" class="chapter-card ml-card">
          <header class="chapter-card__head">
            <input
              v-model="chapter.title"
              class="ml-input chapter-card__title"
              placeholder="Título do capítulo"
              @blur="updateChapter(chapter)"
            />
            <button class="ml-icon-btn" :disabled="reordering || chapterIndex === 0" title="Mover capítulo para cima" @click="moveChapter(chapterIndex, -1)">↑</button>
            <button class="ml-icon-btn" :disabled="reordering || chapterIndex === chapters.length - 1" title="Mover capítulo para baixo" @click="moveChapter(chapterIndex, 1)">↓</button>
            <button
              class="ml-icon-btn ml-icon-btn--danger"
              title="Remover capítulo"
              @click="removeChapter(chapter.id)"
            >
              ×
            </button>
          </header>

          <ul class="memory-list">
            <li v-for="(memory, memoryIndex) in chapter.memories" :key="memory.id" class="memory-item">
              <div class="memory-item__thumbs">
                <span
                  v-for="media in mediaOf(memory).slice(0, 4)"
                  :key="media.id"
                  class="memory-item__thumb"
                >
                  <img :src="media.url" alt="" loading="lazy" />
                </span>
                <span v-if="!mediaOf(memory).length" class="memory-item__empty">sem fotos</span>
              </div>
              <div class="memory-item__body">
                <input
                  v-model="memory.title"
                  class="ml-input ml-input--sm"
                  placeholder="Título da memória"
                  @blur="updateMemory(chapter.id, memory)"
                />
                <textarea
                  v-model="memory.description"
                  class="ml-input ml-input--sm"
                  rows="2"
                  placeholder="Descrição"
                  @blur="updateMemory(chapter.id, memory)"
                />
                <div class="memory-item__meta">
                  <input
                    v-model="memory.date"
                    type="date"
                    class="ml-input ml-input--sm"
                    @blur="updateMemory(chapter.id, memory)"
                  />
                  <button
                    class="ml-btn ml-btn--ghost ml-btn--sm"
                    @click="openPicker(chapter.id, memory)"
                  >
                    Anexar da fototeca
                  </button>
                  <button class="ml-icon-btn" :disabled="reordering || memoryIndex === 0" title="Mover memória para cima" @click="moveMemory(chapter, memoryIndex, -1)">↑</button>
                  <button class="ml-icon-btn" :disabled="reordering || memoryIndex === chapter.memories.length - 1" title="Mover memória para baixo" @click="moveMemory(chapter, memoryIndex, 1)">↓</button>
                  <button
                    class="ml-icon-btn ml-icon-btn--danger"
                    title="Remover memória"
                    @click="removeMemory(chapter.id, memory.id)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <button
            class="ml-btn ml-btn--ghost ml-btn--sm"
            @click="addMemory(chapter.id, chapter.memories.length)"
          >
            + Memória
          </button>
        </div>

        <p v-if="!chapters.length" class="text-muted">Nenhum capítulo ainda.</p>
      </div>

      <button class="ml-btn ml-btn--primary" @click="addChapter(chapters.length)">
        + Capítulo
      </button>
    </section>

    <div v-if="pickerOpen" class="ml-modal" @click.self="closePicker">
      <div class="ml-modal__panel ml-card">
        <header class="ml-modal__head">
          <h3>Anexar fotos à memória</h3>
          <button class="ml-icon-btn" type="button" aria-label="Fechar" @click="closePicker">×</button>
        </header>
        <p v-if="!gallery.length" class="text-muted picker-empty">
          Envie fotos na etapa Fototeca primeiro.
        </p>
        <div v-else class="picker-grid">
          <label v-for="media in gallery" :key="media.id" class="picker-tile">
            <input
              type="checkbox"
              :checked="selectedIds.includes(media.id)"
              @change="toggle(media.id)"
            />
            <img :src="media.url" alt="" loading="lazy" />
          </label>
        </div>
        <footer class="ml-modal__foot">
          <button class="ml-btn ml-btn--ghost" type="button" @click="closePicker">Cancelar</button>
          <button class="ml-btn ml-btn--primary" type="button" :disabled="saving" @click="saveSelection">
            Salvar ({{ selectedIds.length }})
          </button>
        </footer>
      </div>
    </div>

    <p v-if="error" class="ml-alert ml-alert--error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAlbumStore } from '@/stores/album'
import type { AlbumChapter, AlbumMedia, AlbumMemory } from '@/api/types'
import { resolveMediaUrl } from '@/modules/album/book/mediaUrl'
import { isAlbumVisualMedia } from '@/modules/album/mediaTypes'
import { useModalLifecycle } from '@/composables/useModalLifecycle'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  album: { id: string } | null
  photos?: AlbumMedia[]
  form?: Record<string, unknown>
}>()

const store = useAlbumStore()
const loading = ref(false)
const error = ref('')
const chapters = computed<AlbumChapter[]>(() => store.chapters)

const gallery = computed<Array<{ id: string; url: string }>>(() => {
  const media = (props.photos?.length ? props.photos : store.current?.media ?? []) as AlbumMedia[]
  return media
    .filter((m) => isAlbumVisualMedia(m.media_type))
    .map((m) => ({ id: m.id, url: resolveMediaUrl(m.url, m.url_thumbnail) ?? '' }))
    .filter((m) => m.url)
})

const stepDescription = computed(() => {
  const isMemorial =
    props.form?.presentation === 'memorial-luz' || props.form?.category === 'memorial'
  if (isMemorial) {
    return `Capítulos: ${chapters.value.length}. Monte a biografia, linha do tempo e recordações com fotos e datas.`
  }
  return `Capítulos: ${chapters.value.length}. Anexe fotos da fototeca a cada memória.`
})

function mediaOf(memory: AlbumMemory): Array<{ id: string; url: string }> {
  const ids = memory.media_ids ?? []
  if (!ids.length) return []
  return gallery.value.filter((g) => ids.includes(g.id))
}

const pickerOpen = ref(false)
const pickerChapterId = ref('')
const pickerMemoryId = ref('')
const selectedIds = ref<string[]>([])
const saving = ref(false)
const reordering = ref(false)

function openPicker(chapterId: string, memory: AlbumMemory) {
  pickerChapterId.value = chapterId
  pickerMemoryId.value = memory.id
  selectedIds.value = [...(memory.media_ids ?? [])]
  pickerOpen.value = true
}

function closePicker() {
  pickerOpen.value = false
  pickerChapterId.value = ''
  pickerMemoryId.value = ''
  selectedIds.value = []
}

useModalLifecycle(pickerOpen, closePicker, { lockScroll: true })

function toggle(id: string) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(index, 1)
}

async function saveSelection() {
  if (!pickerChapterId.value || !pickerMemoryId.value) return
  saving.value = true
  error.value = ''
  try {
    await store.updateMemory(pickerChapterId.value, pickerMemoryId.value, {
      media_ids: [...selectedIds.value],
    })
    closePicker()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao anexar fotos.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!props.album) return
  loading.value = true
  error.value = ''
  try {
    if (!store.current || store.current.id !== props.album.id) {
      await store.loadAlbum(props.album.id)
    }
    await store.loadChapters(props.album.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao carregar capítulos.'
  } finally {
    loading.value = false
  }
})

async function addChapter(sortOrder: number) {
  error.value = ''
  try {
    await store.createChapter({ title: `Capítulo ${sortOrder + 1}`, sort_order: sortOrder })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao criar capítulo.'
  }
}

async function updateChapter(chapter: AlbumChapter) {
  try {
    await store.updateChapter(chapter.id, { title: chapter.title })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao atualizar capítulo.'
  }
}

async function removeChapter(chapterId: string) {
  const chapter = chapters.value.find((item) => item.id === chapterId)
  const count = chapter?.memories.length ?? 0
  if (!window.confirm(`Remover este capítulo${count ? ` e suas ${count} memória(s)` : ''}? Esta ação não pode ser desfeita.`)) return
  try {
    await store.removeChapter(chapterId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao remover capítulo.'
  }
}

async function addMemory(chapterId: string, sortOrder: number) {
  error.value = ''
  try {
    await store.createMemory(chapterId, {
      sort_order: sortOrder,
      title: '',
      description: '',
      date: '',
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao criar memória.'
  }
}

async function updateMemory(chapterId: string, memory: AlbumMemory) {
  try {
    await store.updateMemory(chapterId, memory.id, {
      title: memory.title,
      description: memory.description,
      date: memory.date,
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao atualizar memória.'
  }
}

async function removeMemory(chapterId: string, memoryId: string) {
  if (!window.confirm('Remover esta memória? As fotos continuarão disponíveis na fototeca.')) return
  try {
    await store.removeMemory(chapterId, memoryId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao remover memória.'
  }
}

async function moveChapter(index: number, direction: -1 | 1) {
  const target = index + direction
  if (reordering.value || target < 0 || target >= chapters.value.length) return
  const ordered = [...chapters.value]
  ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
  reordering.value = true
  error.value = ''
  try {
    await Promise.all(ordered.map((chapter, sortOrder) => store.updateChapter(chapter.id, { sort_order: sortOrder })))
    if (props.album) await store.loadChapters(props.album.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao reordenar capítulos.'
  } finally {
    reordering.value = false
  }
}

async function moveMemory(chapter: AlbumChapter, index: number, direction: -1 | 1) {
  const target = index + direction
  if (reordering.value || target < 0 || target >= chapter.memories.length) return
  const ordered = [...chapter.memories]
  ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
  reordering.value = true
  error.value = ''
  try {
    await Promise.all(ordered.map((memory, sortOrder) => store.updateMemory(chapter.id, memory.id, { sort_order: sortOrder })))
    if (props.album) await store.loadChapters(props.album.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Falha ao reordenar memórias.'
  } finally {
    reordering.value = false
  }
}
</script>

<style scoped>
.layout-panel__hint {
  margin: 0 0 20px;
  font-size: 0.94rem;
  line-height: 1.55;
}

.chapters {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.chapter-card {
  padding: 16px;
  background: var(--surface-2);
}

.chapter-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.chapter-card__title {
  flex: 1;
  font-weight: 600;
}

.memory-list {
  display: grid;
  gap: 12px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}

.memory-item {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
}

.memory-item__thumbs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  align-content: start;
}

.memory-item__thumb {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  background: var(--surface-3);
}

.memory-item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.memory-item__empty {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  min-height: 72px;
  font-size: 0.75rem;
  color: var(--muted);
  border: 1px dashed var(--border);
  border-radius: 8px;
}

.memory-item__body {
  display: grid;
  gap: 8px;
}

.memory-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.ml-modal {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--overlay);
  backdrop-filter: blur(2px);
}

.ml-modal__panel {
  width: min(720px, 100%);
  max-height: min(85vh, 760px);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.ml-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.ml-modal__head h3 {
  margin: 0;
  font-size: 1.05rem;
}

.picker-empty {
  padding: 24px 18px;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
  padding: 16px 18px;
  overflow-y: auto;
}

.picker-tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
}

.picker-tile:has(input:checked) {
  border-color: var(--primary);
}

.picker-tile input {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 1;
}

.picker-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ml-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid var(--border);
}

@media (max-width: 640px) {
  .memory-item {
    grid-template-columns: 1fr;
  }

  .memory-item__thumbs {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
