<template>
  <div
    class="pb-board"
    :class="[`pb-board--${mode}`, { 'pb-board--editable': editable }]"
    :style="boardRootStyle"
  >
    <!-- Canvas = quadro inteiro (sem caixa interna limitada) -->
    <div
      v-if="shots.length"
      ref="stageRef"
      class="pb-board__canvas"
      role="list"
      aria-label="Quadro de polaroids"
      @pointerdown.self="selectedId = null"
    >
      <figure
        v-for="shot in shots"
        :key="shot.id"
        :ref="(el) => setShotEl(shot.id, el)"
        class="pb-polaroid"
        :class="[
          `pb-polaroid--decor-${shot.decor}`,
          `pb-polaroid--size-${shot.size}`,
          {
            'pb-polaroid--draggable': editable,
            'pb-polaroid--dragging': dragMode === 'move' && draggingId === shot.id,
            'pb-polaroid--selected': editable && selectedId === shot.id,
          },
        ]"
        :style="shot.style"
        role="listitem"
        :tabindex="editable ? 0 : undefined"
        @pointerdown="editable ? onMovePointerDown(shot.id, $event) : undefined"
      >
        <span class="pb-polaroid__attach" aria-hidden="true" />
        <div class="pb-polaroid__frame">
          <img :src="shot.url" :alt="shot.title || 'Memória'" loading="lazy" draggable="false" />
        </div>
        <figcaption v-if="shot.caption" class="pb-polaroid__caption">{{ shot.caption }}</figcaption>

        <template v-if="editable && selectedId === shot.id">
          <div class="pb-polaroid__toolbar" @pointerdown.stop>
            <button type="button" class="pb-polaroid__rot-btn" title="Girar -15°" @click="nudgeRotation(shot.id, -15)">
              ↺
            </button>
            <span class="pb-polaroid__rot-label">{{ Math.round(shot.rotation) }}°</span>
            <button type="button" class="pb-polaroid__rot-btn" title="Girar +15°" @click="nudgeRotation(shot.id, 15)">
              ↻
            </button>
            <button type="button" class="pb-polaroid__rot-btn" title="Zerar rotação" @click="setRotation(shot.id, 0)">
              0°
            </button>
          </div>
          <button
            type="button"
            class="pb-polaroid__rotate-handle"
            title="Arraste para girar"
            aria-label="Girar polaroid"
            @pointerdown.stop="onRotatePointerDown(shot.id, $event)"
          />
        </template>
      </figure>
    </div>

    <header class="pb-board__header">
      <p v-if="eyebrow" class="pb-board__eyebrow">{{ eyebrow }}</p>
      <h1 class="pb-board__title">{{ book.title }}</h1>
      <p v-if="book.subtitle" class="pb-board__subtitle">{{ book.subtitle }}</p>
      <p v-if="editable && shots.length" class="pb-board__hint">
        Arraste por todo o quadro · clique e gire com a alça ou ↺ ↻.
        <button type="button" class="pb-board__reset" @click="resetLayout">Resetar posições</button>
      </p>
    </header>

    <p v-if="!shots.length" class="pb-board__empty">Adicione fotos na fototeca para colar no quadro.</p>

    <footer v-if="showFooter" class="pb-board__footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="pb-board__msg" />
      <p v-if="book.signature" class="pb-board__sign">{{ book.signature }}</p>
      <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="book.title" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import { getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import {
  defaultBoardItem,
  normalizeBookConfig,
  syncBoardItems,
  type BookBoardItem,
} from '../bookConfig'
import type { BookRenderMode, MemoryBookModel } from '../types'

type Decor = 'tape-amber' | 'tape-mint' | 'tape-rose' | 'pin-red' | 'pin-blue' | 'corners' | 'clip'
type DragMode = 'move' | 'rotate' | null

const props = withDefaults(
  defineProps<{
    book: MemoryBookModel
    mode: BookRenderMode
    shareUrl?: string
    editable?: boolean
  }>(),
  { editable: false },
)

const emit = defineEmits<{
  'update:board': [items: BookBoardItem[]]
}>()

const theme = computed(() => getBookTheme(normalizePresentationId(props.book.presentation)))
const bookConfig = computed(() => normalizeBookConfig(props.book.bookConfig))

const boardStyle = computed(() =>
  getThemeCssVars(theme.value, bookConfig.value.colors.accent || props.book.colorPrimary, {
    paper: bookConfig.value.colors.paper || theme.value.tokens.paper,
    ink: bookConfig.value.colors.ink,
    page: bookConfig.value.colors.page || bookConfig.value.colors.paper,
    fontDisplay: theme.value.fonts.display,
    fontBody: theme.value.fonts.body,
  }),
)

const boardRootStyle = computed(() => ({
  ...boardStyle.value,
  minHeight: stageMinHeight.value,
}))

const eyebrow = computed(
  () =>
    props.book.bookConfig?.cover.eyebrow?.trim() ||
    theme.value.cover.eyebrow ||
    'Coladas com carinho',
)

const DECORS: Decor[] = [
  'tape-amber',
  'pin-red',
  'tape-mint',
  'corners',
  'pin-blue',
  'tape-rose',
  'clip',
  'tape-amber',
]

const SIZES = ['md', 'sm', 'md', 'lg', 'sm', 'md'] as const

const stageRef = ref<HTMLElement | null>(null)
const shotEls = new Map<string, HTMLElement>()
const localItems = ref<BookBoardItem[]>([])
const selectedId = ref<string | null>(null)
const draggingId = ref<string | null>(null)
const dragMode = ref<DragMode>(null)

let dragOffsetX = 0
let dragOffsetY = 0
let rotateStartPointerAngle = 0
let rotateStartItemAngle = 0
let topZ = 10

const photoIds = computed(() =>
  props.book.contentPages.flatMap((page) => page.photos.map((photo) => photo.id)),
)

watch(
  () => [photoIds.value.join('|'), JSON.stringify(bookConfig.value.board?.items ?? [])] as const,
  () => {
    if (dragMode.value) return
    const previousIds = new Set(localItems.value.map((item) => item.media_id))
    const next = syncBoardItems(photoIds.value, bookConfig.value.board?.items)
    localItems.value = next
    topZ = Math.max(10, ...next.map((item) => item.z ?? 1), 10)
    if (!props.editable) return
    const idsChanged =
      previousIds.size !== next.length || next.some((item) => !previousIds.has(item.media_id))
    const missingSaved = next.some(
      (item) => !(bookConfig.value.board?.items ?? []).some((saved) => saved.media_id === item.media_id),
    )
    if (idsChanged || missingSaved) {
      emitBoard(next)
    }
  },
  { immediate: true },
)

const photosById = computed(() => {
  const map = new Map(
    props.book.contentPages.flatMap((page) => page.photos).map((photo) => [photo.id, photo]),
  )
  return map
})

const shots = computed(() => {
  const list: Array<{
    id: string
    url: string
    title?: string
    caption?: string
    rotation: number
    decor: Decor
    size: (typeof SIZES)[number]
    style: Record<string, string>
  }> = []

  localItems.value.forEach((item, index) => {
    const photo = photosById.value.get(item.media_id)
    if (!photo) return
    list.push({
      id: photo.id,
      url: photo.url,
      title: photo.title,
      caption: photo.title || photo.caption || photo.memoryDate,
      rotation: item.rotation ?? 0,
      decor: DECORS[index % DECORS.length],
      size: SIZES[index % SIZES.length],
      style: {
        left: `${item.x}%`,
        top: `${item.y}%`,
        '--pb-rot': `${item.rotation ?? 0}deg`,
        zIndex: String(item.z ?? index + 1),
      },
    })
  })

  return list
})

const stageMinHeight = computed(() => {
  const count = localItems.value.length
  if (count <= 0) return props.mode === 'preview' ? '360px' : '70svh'
  const maxY = Math.max(...localItems.value.map((item) => item.y), 0)
  // Quadro alto o suficiente para posicionar em qualquer região (inclui “embaixo” do título).
  const fromPositions = maxY * 7 + 320
  const base = props.mode === 'preview' ? 520 : 720
  return `${Math.max(base, fromPositions)}px`
})

const showFooter = computed(
  () =>
    Boolean(props.book.closingMessage?.trim()) ||
    Boolean(props.book.signature?.trim()) ||
    (props.mode === 'full' && Boolean(props.shareUrl?.trim())),
)

function setShotEl(id: string, el: Element | ComponentPublicInstance | null) {
  if (!el) {
    shotEls.delete(id)
    return
  }
  const node = (el as ComponentPublicInstance).$el
    ? ((el as ComponentPublicInstance).$el as HTMLElement)
    : (el as HTMLElement)
  if (node instanceof HTMLElement) shotEls.set(id, node)
}

function emitBoard(items: BookBoardItem[]) {
  emit(
    'update:board',
    items.map((item) => ({ ...item })),
  )
}

function bringToFront(id: string) {
  topZ += 1
  localItems.value = localItems.value.map((entry) =>
    entry.media_id === id ? { ...entry, z: topZ } : entry,
  )
}

function clampToCanvas(id: string, xPct: number, yPct: number): { x: number; y: number } {
  const stage = stageRef.value
  const el = shotEls.get(id)
  // Quase sem restrição: só evita perder a polaroid completamente fora do quadro.
  if (!stage || !el) {
    return {
      x: Math.min(96, Math.max(-20, xPct)),
      y: Math.min(96, Math.max(-20, yPct)),
    }
  }

  const stageBox = stage.getBoundingClientRect()
  const elW = el.offsetWidth
  const elH = el.offsetHeight
  if (stageBox.width <= 0 || stageBox.height <= 0) {
    return { x: xPct, y: yPct }
  }

  const minVisible = 0.2
  const minX = (-elW * (1 - minVisible) * 100) / stageBox.width
  const minY = (-elH * (1 - minVisible) * 100) / stageBox.height
  const maxX = ((stageBox.width - elW * minVisible) * 100) / stageBox.width
  const maxY = ((stageBox.height - elH * minVisible) * 100) / stageBox.height

  return {
    x: Math.min(maxX, Math.max(minX, xPct)),
    y: Math.min(maxY, Math.max(minY, yPct)),
  }
}

function pointerAngle(id: string, clientX: number, clientY: number): number {
  const el = shotEls.get(id)
  if (!el) return 0
  const box = el.getBoundingClientRect()
  const cx = box.left + box.width / 2
  const cy = box.top + box.height / 2
  return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI
}

function normalizeRotation(value: number): number {
  let rot = ((value + 180) % 360 + 360) % 360 - 180
  return Math.round(rot * 10) / 10
}

function onMovePointerDown(id: string, event: PointerEvent) {
  if (!props.editable || !stageRef.value) return
  if (event.button !== 0) return
  event.preventDefault()

  selectedId.value = id
  bringToFront(id)

  const stage = stageRef.value.getBoundingClientRect()
  const item = localItems.value.find((entry) => entry.media_id === id)
  if (!item) return

  const itemX = stage.left + (item.x / 100) * stage.width
  const itemY = stage.top + (item.y / 100) * stage.height
  dragOffsetX = event.clientX - itemX
  dragOffsetY = event.clientY - itemY

  draggingId.value = id
  dragMode.value = 'move'

  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  bindDragListeners()
}

function onRotatePointerDown(id: string, event: PointerEvent) {
  if (!props.editable) return
  if (event.button !== 0) return
  event.preventDefault()

  selectedId.value = id
  bringToFront(id)

  const item = localItems.value.find((entry) => entry.media_id === id)
  if (!item) return

  rotateStartPointerAngle = pointerAngle(id, event.clientX, event.clientY)
  rotateStartItemAngle = item.rotation ?? 0
  draggingId.value = id
  dragMode.value = 'rotate'

  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  bindDragListeners()
}

function onPointerMove(event: PointerEvent) {
  if (!draggingId.value || !stageRef.value || !dragMode.value) return

  if (dragMode.value === 'move') {
    const stage = stageRef.value.getBoundingClientRect()
    if (stage.width <= 0 || stage.height <= 0) return
    const rawX = ((event.clientX - dragOffsetX - stage.left) / stage.width) * 100
    const rawY = ((event.clientY - dragOffsetY - stage.top) / stage.height) * 100
    const clamped = clampToCanvas(draggingId.value, rawX, rawY)

    localItems.value = localItems.value.map((entry) =>
      entry.media_id === draggingId.value ? { ...entry, x: clamped.x, y: clamped.y } : entry,
    )
    return
  }

  if (dragMode.value === 'rotate') {
    const current = pointerAngle(draggingId.value, event.clientX, event.clientY)
    const delta = current - rotateStartPointerAngle
    const next = normalizeRotation(rotateStartItemAngle + delta)
    localItems.value = localItems.value.map((entry) =>
      entry.media_id === draggingId.value ? { ...entry, rotation: next } : entry,
    )
  }
}

function onPointerUp() {
  if (!draggingId.value) return
  draggingId.value = null
  dragMode.value = null
  unbindDragListeners()
  emitBoard(localItems.value)
}

function bindDragListeners() {
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function unbindDragListeners() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

function nudgeRotation(id: string, delta: number) {
  localItems.value = localItems.value.map((entry) =>
    entry.media_id === id
      ? { ...entry, rotation: normalizeRotation((entry.rotation ?? 0) + delta) }
      : entry,
  )
  emitBoard(localItems.value)
}

function setRotation(id: string, value: number) {
  localItems.value = localItems.value.map((entry) =>
    entry.media_id === id ? { ...entry, rotation: normalizeRotation(value) } : entry,
  )
  emitBoard(localItems.value)
}

function resetLayout() {
  localItems.value = photoIds.value.map((id, index) => defaultBoardItem(id, index))
  selectedId.value = null
  emitBoard(localItems.value)
}

onBeforeUnmount(() => {
  unbindDragListeners()
})
</script>

<style scoped>
.pb-board {
  --pb-cork: var(--book-paper);
  --pb-cork-dark: var(--book-paper-alt);
  position: relative;
  width: 100%;
  min-height: var(--exp-stage, 70svh);
  padding: clamp(20px, 4vw, 36px) clamp(14px, 3vw, 28px) clamp(36px, 6vw, 56px);
  color: var(--book-ink);
  overflow: visible;
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.18), transparent 42%),
    radial-gradient(circle at 82% 70%, rgba(0, 0, 0, 0.12), transparent 48%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 11px,
      rgba(0, 0, 0, 0.03) 11px,
      rgba(0, 0, 0, 0.03) 12px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 11px,
      rgba(0, 0, 0, 0.025) 11px,
      rgba(0, 0, 0, 0.025) 12px
    ),
    linear-gradient(145deg, var(--pb-cork) 0%, var(--pb-cork-dark) 100%);
  box-shadow: inset 0 0 0 10px rgba(62, 44, 28, 0.18), inset 0 0 0 14px rgba(255, 245, 220, 0.12);
}

.pb-board--preview {
  min-height: auto;
}

.pb-board__canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  touch-action: none;
  overflow: visible;
}

.pb-board__header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: clamp(18px, 4vw, 28px);
  pointer-events: none;
}

.pb-board__hint,
.pb-board__reset {
  pointer-events: auto;
}

.pb-board__eyebrow {
  margin: 0 0 6px;
  font-family: var(--book-font-body);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--book-muted);
}

.pb-board__title {
  margin: 0;
  font-family: var(--book-font-display);
  font-size: clamp(2.2rem, 7vw, 3.4rem);
  font-weight: 700;
  line-height: 1;
  color: #2a2118;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
}

.pb-board__subtitle {
  margin: 8px 0 0;
  font-family: var(--book-font-display);
  font-size: clamp(1.05rem, 2.8vw, 1.35rem);
  color: var(--book-muted);
}

.pb-board__hint {
  margin: 12px 0 0;
  font-size: 0.9rem;
  color: #4a3f34;
  font-family: var(--book-font-display);
}

.pb-board__reset {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: #7a3b2e;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.pb-board__empty {
  position: relative;
  z-index: 2;
  text-align: center;
  color: var(--book-muted);
  font-family: var(--book-font-display);
  font-size: 1.2rem;
  padding: 48px 16px;
}

.pb-polaroid {
  position: absolute;
  width: min(42vw, 168px);
  margin: 0;
  padding: 10px 10px 28px;
  background: #f7f4ee;
  border-radius: 2px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 14px 28px -12px rgba(0, 0, 0, 0.45),
    0 4px 10px -4px rgba(0, 0, 0, 0.25);
  transform: rotate(var(--pb-rot, 0deg));
  transform-origin: center center;
  transition: box-shadow 180ms ease;
  user-select: none;
  z-index: 3;
}

.pb-polaroid--draggable {
  cursor: grab;
}

.pb-polaroid--dragging {
  cursor: grabbing;
  transition: none;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 28px 42px -16px rgba(0, 0, 0, 0.55);
}

.pb-polaroid--selected {
  outline: 2px dashed rgba(122, 59, 46, 0.55);
  outline-offset: 4px;
}

.pb-board:not(.pb-board--editable) .pb-polaroid:hover {
  transform: rotate(0deg) translateY(-4px) scale(1.03);
  z-index: 40 !important;
}

.pb-polaroid--size-sm {
  width: min(36vw, 132px);
  padding-bottom: 22px;
}

.pb-polaroid--size-lg {
  width: min(48vw, 196px);
  padding-bottom: 34px;
}

.pb-polaroid__frame {
  overflow: hidden;
  background: #1a1a1a;
  line-height: 0;
  pointer-events: none;
}

.pb-polaroid__frame img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(56vw, 240px);
  object-fit: contain;
  object-position: center;
  pointer-events: none;
}

.pb-polaroid__caption {
  margin-top: 8px;
  min-height: 1.1em;
  font-family: var(--book-font-display);
  font-size: 0.95rem;
  line-height: 1.15;
  text-align: center;
  color: #3a342c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.pb-polaroid__toolbar {
  position: absolute;
  left: 50%;
  top: -38px;
  transform: translateX(-50%) rotate(calc(var(--pb-rot, 0deg) * -1));
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 999px;
  background: rgba(255, 250, 240, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
  z-index: 5;
}

.pb-polaroid__rot-btn {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: #3b3228;
  color: #fff8ec;
  font-size: 0.85rem;
  line-height: 1;
  cursor: pointer;
}

.pb-polaroid__rot-label {
  min-width: 42px;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #3b3228;
}

.pb-polaroid__rotate-handle {
  position: absolute;
  right: -10px;
  bottom: -10px;
  width: 22px;
  height: 22px;
  border: 2px solid #fff8ec;
  border-radius: 50%;
  background: #7a3b2e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  cursor: grab;
  z-index: 6;
  transform: rotate(calc(var(--pb-rot, 0deg) * -1));
}

.pb-polaroid__rotate-handle:active {
  cursor: grabbing;
}

.pb-polaroid__attach {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}

.pb-polaroid--decor-tape-amber .pb-polaroid__attach,
.pb-polaroid--decor-tape-mint .pb-polaroid__attach,
.pb-polaroid--decor-tape-rose .pb-polaroid__attach {
  top: -10px;
  left: 50%;
  width: 54%;
  height: 18px;
  transform: translateX(-50%) rotate(-2deg);
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  opacity: 0.92;
}

.pb-polaroid--decor-tape-amber .pb-polaroid__attach {
  background: repeating-linear-gradient(90deg, #e8b84a 0 8px, #f0c85c 8px 16px);
}

.pb-polaroid--decor-tape-mint .pb-polaroid__attach {
  background: repeating-linear-gradient(90deg, #7ec8a4 0 7px, #95d4b4 7px 14px);
  transform: translateX(-50%) rotate(3deg);
}

.pb-polaroid--decor-tape-rose .pb-polaroid__attach {
  background: repeating-linear-gradient(90deg, #e89aaa 0 6px, #f0b0bc 6px 12px);
  left: 18%;
  transform: rotate(-8deg);
}

.pb-polaroid--decor-pin-red .pb-polaroid__attach,
.pb-polaroid--decor-pin-blue .pb-polaroid__attach {
  top: -6px;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.pb-polaroid--decor-pin-red .pb-polaroid__attach {
  background: radial-gradient(circle at 35% 30%, #ff7a7a, #c62828);
}

.pb-polaroid--decor-pin-blue .pb-polaroid__attach {
  background: radial-gradient(circle at 35% 30%, #7eb6ff, #1565c0);
  left: 22%;
}

.pb-polaroid--decor-corners .pb-polaroid__attach {
  inset: 6px;
  background:
    linear-gradient(135deg, #d4b896 50%, transparent 50%) 0 0 / 16px 16px no-repeat,
    linear-gradient(-135deg, #d4b896 50%, transparent 50%) 100% 0 / 16px 16px no-repeat,
    linear-gradient(45deg, #d4b896 50%, transparent 50%) 0 100% / 16px 16px no-repeat,
    linear-gradient(-45deg, #d4b896 50%, transparent 50%) 100% 100% / 16px 16px no-repeat;
  opacity: 0.9;
}

.pb-polaroid--decor-clip .pb-polaroid__attach {
  top: -14px;
  left: 50%;
  width: 22px;
  height: 28px;
  transform: translateX(-50%);
  border: 2.5px solid #2b2b2b;
  border-bottom: 0;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(#555, #2b2b2b);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.pb-polaroid--decor-clip .pb-polaroid__attach::after {
  content: '';
  position: absolute;
  left: 3px;
  right: 3px;
  bottom: -8px;
  height: 10px;
  border: 2px solid #2b2b2b;
  border-top: 0;
  border-radius: 0 0 3px 3px;
  background: #3a3a3a;
}

.pb-board__footer {
  position: relative;
  z-index: 2;
  max-width: 520px;
  margin: clamp(28px, 5vw, 44px) auto 0;
  text-align: center;
  padding: 18px;
  background: color-mix(in srgb, #fff8ec 75%, transparent);
  border-radius: 4px;
  box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.35);
}

.pb-board__msg {
  font-family: var(--book-font-display);
  font-size: 1.15rem;
  margin: 0;
}

.pb-board__sign {
  margin: 10px 0 0;
  font-family: var(--book-font-display);
  font-size: 1.3rem;
  color: var(--book-muted);
}

@media (max-width: 640px) {
  .pb-polaroid {
    width: min(44vw, 148px);
  }
}
</style>
