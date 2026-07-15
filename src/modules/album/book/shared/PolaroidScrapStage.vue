<template>
  <div
    class="scrap"
    :class="[
      `scrap--${Math.min(Math.max(shots.length, 1), 4)}`,
      { 'scrap--editable': editable },
    ]"
    @pointerdown.self="selectedId = null"
  >
    <p v-if="editable && shots.length" class="scrap__hint">
      Arraste para mover · use ↺ ↻ e +/− na Polaroid selecionada
    </p>

    <div
      v-for="shot in shots"
      :key="shot.id"
      class="scrap__item"
      :class="{
        'scrap__item--selected': editable && selectedId === shot.id,
        'scrap__item--dragging': draggingId === shot.id,
      }"
      :style="itemStyle(shot)"
      role="listitem"
      :tabindex="editable ? 0 : undefined"
      @pointerdown="editable ? onMoveDown(shot.id, $event) : undefined"
    >
      <PolaroidFrame
        :url="shot.url"
        :title="shot.title"
        :caption="shot.caption"
        :memory-date="shot.memoryDate"
        :frame-style="frameStyle"
        :rotation="0"
        handwritten
        compact
      />

      <div v-if="editable && selectedId === shot.id" class="scrap__toolbar" @pointerdown.stop>
        <button type="button" title="Girar -8°" @click="nudgeRotation(shot.id, -8)">↺</button>
        <button type="button" title="Girar +8°" @click="nudgeRotation(shot.id, 8)">↻</button>
        <button type="button" title="Menor" @click="nudgeScale(shot.id, -0.08)">−</button>
        <button type="button" title="Maior" @click="nudgeScale(shot.id, 0.08)">+</button>
      </div>
    </div>

    <p v-if="!shots.length" class="scrap__empty">Escolha as fotos nos slots acima.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import PolaroidFrame from './PolaroidFrame.vue'
import {
  clampPolaroidScale,
  defaultPolaroidPlacement,
  type BookFrameStyle,
} from '../bookConfig'
import type { MemoryBookPhoto } from '../types'

export interface ScrapShot extends MemoryBookPhoto {
  x: number
  y: number
  rotation: number
  scale: number
}

const props = withDefaults(
  defineProps<{
    photos: MemoryBookPhoto[]
    frameStyle?: BookFrameStyle | string | null
    editable?: boolean
  }>(),
  {
    frameStyle: 'classic',
    editable: false,
  },
)

const emit = defineEmits<{
  change: [shots: ScrapShot[]]
}>()

const selectedId = ref<string | null>(null)
const draggingId = ref<string | null>(null)
const local = ref<ScrapShot[]>([])

let dragOffsetX = 0
let dragOffsetY = 0
let stageEl: HTMLElement | null = null

const shots = computed(() => {
  if (props.editable && local.value.length) return local.value
  return props.photos.map((photo, index) => hydrate(photo, index, props.photos.length))
})

function hydrate(photo: MemoryBookPhoto, index: number, total: number): ScrapShot {
  const place = defaultPolaroidPlacement(index, Math.max(total, 1))
  return {
    ...photo,
    x: typeof photo.x === 'number' ? photo.x : place.x,
    y: typeof photo.y === 'number' ? photo.y : place.y,
    rotation: typeof photo.rotation === 'number' ? photo.rotation : place.rotation,
    scale: clampPolaroidScale(photo.scale ?? place.scale),
  }
}

function syncFromProps() {
  local.value = props.photos.map((photo, index) => hydrate(photo, index, props.photos.length))
}

syncFromProps()

watch(
  () => props.photos,
  () => {
    if (!draggingId.value) syncFromProps()
  },
  { deep: true },
)

function itemStyle(shot: ScrapShot) {
  return {
    left: `${shot.x}%`,
    top: `${shot.y}%`,
    width: `${Math.round(42 * shot.scale)}%`,
    zIndex: selectedId.value === shot.id ? 20 : 5 + Math.round(shot.x / 10),
    transform: `translate(-50%, -50%) rotate(${shot.rotation}deg)`,
  }
}

function commit(next: ScrapShot[]) {
  local.value = next
  emit('change', next)
}

function onMoveDown(id: string, event: PointerEvent) {
  if (!props.editable) return
  const target = event.currentTarget as HTMLElement
  stageEl = target.parentElement
  if (!stageEl) return

  selectedId.value = id
  draggingId.value = id
  const rect = stageEl.getBoundingClientRect()
  const shot = local.value.find((item) => item.id === id)
  if (!shot) return

  dragOffsetX = ((event.clientX - rect.left) / rect.width) * 100 - shot.x
  dragOffsetY = ((event.clientY - rect.top) / rect.height) * 100 - shot.y

  target.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onMoveMove)
  window.addEventListener('pointerup', onMoveUp)
}

function onMoveMove(event: PointerEvent) {
  if (!draggingId.value || !stageEl) return
  const rect = stageEl.getBoundingClientRect()
  const x = Math.min(88, Math.max(12, ((event.clientX - rect.left) / rect.width) * 100 - dragOffsetX))
  const y = Math.min(88, Math.max(14, ((event.clientY - rect.top) / rect.height) * 100 - dragOffsetY))
  commit(
    local.value.map((item) =>
      item.id === draggingId.value ? { ...item, x, y } : item,
    ),
  )
}

function onMoveUp() {
  draggingId.value = null
  window.removeEventListener('pointermove', onMoveMove)
  window.removeEventListener('pointerup', onMoveUp)
}

function nudgeRotation(id: string, delta: number) {
  commit(
    local.value.map((item) =>
      item.id === id ? { ...item, rotation: Math.round((item.rotation + delta) * 10) / 10 } : item,
    ),
  )
}

function nudgeScale(id: string, delta: number) {
  commit(
    local.value.map((item) =>
      item.id === id ? { ...item, scale: clampPolaroidScale(item.scale + delta) } : item,
    ),
  )
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMoveMove)
  window.removeEventListener('pointerup', onMoveUp)
})
</script>

<style scoped>
.scrap {
  position: relative;
  width: 100%;
  min-height: clamp(360px, 56vh, 640px);
  background:
    radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.55), transparent 50%),
    linear-gradient(165deg, color-mix(in srgb, var(--book-paper, #fbfaf7) 92%, #e8e2d8), var(--book-paper, #fbfaf7));
  overflow: hidden;
}

.scrap--editable {
  outline: 1px dashed color-mix(in srgb, var(--book-ink, #222) 18%, transparent);
  outline-offset: -8px;
  border-radius: 4px;
}

.scrap__hint {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  margin: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--book-paper, #fff) 88%, transparent);
  font-size: 0.72rem;
  color: var(--book-muted, #666);
  pointer-events: none;
  white-space: nowrap;
}

.scrap__item {
  position: absolute;
  cursor: default;
  touch-action: none;
  filter: drop-shadow(0 16px 22px rgba(28, 24, 20, 0.22));
  transition: filter 160ms ease;
}

.scrap--editable .scrap__item {
  cursor: grab;
}

.scrap__item--dragging {
  cursor: grabbing;
  filter: drop-shadow(0 22px 28px rgba(28, 24, 20, 0.32));
  z-index: 40 !important;
}

.scrap__item--selected {
  outline: 2px solid color-mix(in srgb, var(--book-accent, #c45d7a) 70%, transparent);
  outline-offset: 6px;
}

.scrap__toolbar {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 8px;
}

.scrap__toolbar button {
  width: 32px;
  height: 28px;
  border: 1px solid color-mix(in srgb, var(--book-ink, #222) 16%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--book-paper, #fff) 92%, #fff);
  color: var(--book-ink, #222);
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
}

.scrap__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: var(--book-muted, #666);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .scrap {
    min-height: 320px;
  }

  .scrap__item {
    width: min(58%, 220px) !important;
  }
}
</style>
