<template>
  <div class="spotify-trim">
    <p class="spotify-trim__hint">Escolha o trecho que será tocado na homenagem.</p>

    <div class="spotify-trim__player">
      <div class="spotify-trim__art" aria-hidden="true">
        <img v-if="coverUrl" :src="coverUrl" alt="" class="spotify-trim__cover" />
        <div v-else class="spotify-trim__cover spotify-trim__cover--fallback">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M9 18V5l10-2v13" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="16" cy="16" r="3" />
          </svg>
        </div>
        <span v-if="previewing" class="spotify-trim__eq" aria-hidden="true">
          <span /><span /><span />
        </span>
      </div>

      <div class="spotify-trim__main">
        <div class="spotify-trim__meta">
          <div class="spotify-trim__text">
            <div class="spotify-trim__title-row">
              <strong class="spotify-trim__title">{{ title }}</strong>
              <span class="spotify-trim__chip">{{ formatTime(modelEnd - modelStart) }}</span>
            </div>
            <span class="spotify-trim__artist">
              {{ artist }}
              <template v-if="sourceLabel"> · {{ sourceLabel }}</template>
              <span class="spotify-trim__duration-total"> · {{ formatTime(safeDuration) }} total</span>
            </span>
          </div>

          <button
            type="button"
            class="spotify-trim__play"
            :class="{ 'spotify-trim__play--active': previewing }"
            :aria-label="previewing ? 'Pausar prévia' : 'Ouvir trecho'"
            @click="togglePreview"
          >
            <svg v-if="!previewing" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.04-7.36a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
            </svg>
          </button>
        </div>

        <div
          ref="trackRef"
          class="spotify-trim__timeline"
          :class="{ 'spotify-trim__timeline--dragging': !!dragMode }"
          @pointerdown="onTrackPointerDown"
        >
          <div class="spotify-trim__wave" aria-hidden="true">
            <span
              v-for="(bar, index) in waveformBars"
              :key="index"
              class="spotify-trim__bar"
              :class="{
                'spotify-trim__bar--selected': bar.inSelection,
                'spotify-trim__bar--played': bar.played,
              }"
              :style="{ height: `${bar.height}%` }"
            />
          </div>

          <div class="spotify-trim__rail" />

          <div
            class="spotify-trim__selection"
            :style="{
              left: `${startPercent}%`,
              width: `${selectionPercent}%`,
            }"
          />

          <div
            class="spotify-trim__shade spotify-trim__shade--left"
            :style="{ width: `${startPercent}%` }"
          />
          <div
            class="spotify-trim__shade spotify-trim__shade--right"
            :style="{ width: `${100 - endPercent}%` }"
          />

          <div
            v-if="previewing"
            class="spotify-trim__playhead"
            :style="{ left: `${playheadPercent}%` }"
          />

          <button
            type="button"
            class="spotify-trim__handle spotify-trim__handle--start"
            :class="{ 'spotify-trim__handle--active': dragMode === 'start' }"
            :style="{ left: `${startPercent}%` }"
            aria-label="Ajustar início do trecho"
            @pointerdown.stop="startDrag('start', $event)"
          >
            <span class="spotify-trim__handle-tip">Início</span>
          </button>

          <button
            type="button"
            class="spotify-trim__handle spotify-trim__handle--end"
            :class="{ 'spotify-trim__handle--active': dragMode === 'end' }"
            :style="{ left: `${endPercent}%` }"
            aria-label="Ajustar fim do trecho"
            @pointerdown.stop="startDrag('end', $event)"
          >
            <span class="spotify-trim__handle-tip">Fim</span>
          </button>
        </div>

        <div class="spotify-trim__times">
          <span class="spotify-trim__time-label">
            <small>Início</small>
            {{ formatTime(modelStart) }}
          </span>
          <span class="spotify-trim__times-center">
            <template v-if="previewing">
              <small>Ouvindo</small>
              {{ formatTime(displayCurrentTime) }}
            </template>
            <template v-else>
              <small>Trecho</small>
              {{ formatTime(modelEnd - modelStart) }}
            </template>
          </span>
          <span class="spotify-trim__time-label spotify-trim__time-label--end">
            <small>Fim</small>
            {{ formatTime(modelEnd) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    audioUrl: string
    durationSeconds: number
    startSeconds: number
    endSeconds: number
    title?: string
    artist?: string
    sourceLabel?: string | null
    coverUrl?: string | null
  }>(),
  {
    title: 'Sua trilha',
    artist: 'MayLove',
    sourceLabel: null,
    coverUrl: null,
  },
)

const emit = defineEmits<{
  'update:startSeconds': [value: number]
  'update:endSeconds': [value: number]
}>()

const BAR_HEIGHTS = [
  38, 62, 44, 78, 52, 88, 40, 70, 48, 82, 36, 66, 54, 90, 42, 74, 50, 84, 46, 68, 58, 76, 34, 64,
  72, 46, 80, 38, 60, 86, 44, 68, 52, 92, 36, 58, 74, 48, 82, 40, 66, 54, 88, 42, 70, 50, 78, 36,
]

const safeDuration = computed(() => Math.max(props.durationSeconds, 1))
const modelStart = computed(() => props.startSeconds)
const modelEnd = computed(() => props.endSeconds)
const startPercent = computed(() => (modelStart.value / safeDuration.value) * 100)
const endPercent = computed(() => (modelEnd.value / safeDuration.value) * 100)
const selectionPercent = computed(() => Math.max(endPercent.value - startPercent.value, 0))

const previewing = ref(false)
const currentTime = ref(0)
const trackRef = ref<HTMLElement | null>(null)
const dragMode = ref<'start' | 'end' | null>(null)

let audio: HTMLAudioElement | null = null

const displayCurrentTime = computed(() =>
  Math.max(modelStart.value, Math.min(currentTime.value, modelEnd.value)),
)

const clipProgress = computed(() => {
  const clipLength = modelEnd.value - modelStart.value
  if (clipLength <= 0) return 0
  return (displayCurrentTime.value - modelStart.value) / clipLength
})

const playheadPercent = computed(() => startPercent.value + clipProgress.value * selectionPercent.value)

const waveformBars = computed(() => {
  const count = BAR_HEIGHTS.length
  const playedRatio = clipProgress.value

  return BAR_HEIGHTS.map((height, index) => {
    const center = ((index + 0.5) / count) * 100
    const inSelection = center >= startPercent.value && center <= endPercent.value
    const selectionStart = startPercent.value
    const selectionWidth = Math.max(selectionPercent.value, 0.001)
    const relative = (center - selectionStart) / selectionWidth
    const played = previewing.value && inSelection && relative <= playedRatio

    return { height, inSelection, played }
  })
})

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function clampRange(start: number, end: number): { start: number; end: number } {
  const duration = safeDuration.value
  let nextStart = Math.max(0, Math.min(start, duration - 0.5))
  let nextEnd = Math.max(nextStart + 0.5, Math.min(end, duration))
  if (nextEnd - nextStart < 0.5) {
    nextEnd = Math.min(duration, nextStart + 0.5)
  }
  return { start: nextStart, end: nextEnd }
}

function secondsFromClientX(clientX: number): number {
  const track = trackRef.value
  if (!track) return 0
  const rect = track.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  return ratio * safeDuration.value
}

function seekPreview(seconds: number) {
  const clamped = Math.max(modelStart.value, Math.min(seconds, modelEnd.value))
  currentTime.value = clamped
  if (audio) audio.currentTime = clamped
}

function applyDrag(clientX: number) {
  if (!dragMode.value) return
  const seconds = secondsFromClientX(clientX)

  if (dragMode.value === 'start') {
    const { start, end } = clampRange(seconds, modelEnd.value)
    emit('update:startSeconds', start)
    if (end !== modelEnd.value) emit('update:endSeconds', end)
    if (previewing.value) seekPreview(start)
    return
  }

  const { start, end } = clampRange(modelStart.value, seconds)
  if (start !== modelStart.value) emit('update:startSeconds', start)
  emit('update:endSeconds', end)
  if (previewing.value && seconds < modelEnd.value) seekPreview(seconds)
}

function onPointerMove(event: PointerEvent) {
  applyDrag(event.clientX)
}

function stopDrag() {
  dragMode.value = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopDrag)
}

function startDrag(mode: 'start' | 'end', event: PointerEvent) {
  dragMode.value = mode
  ;(event.target as HTMLElement).setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopDrag, { once: true })
  applyDrag(event.clientX)
}

function onTrackPointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.spotify-trim__handle')) return

  const seconds = secondsFromClientX(event.clientX)

  if (previewing.value && seconds >= modelStart.value && seconds <= modelEnd.value) {
    seekPreview(seconds)
    return
  }

  const distanceToStart = Math.abs(seconds - modelStart.value)
  const distanceToEnd = Math.abs(seconds - modelEnd.value)
  startDrag(distanceToStart <= distanceToEnd ? 'start' : 'end', event)
}

function ensureAudio(): HTMLAudioElement | null {
  if (!props.audioUrl) return null
  if (!audio) {
    audio = new Audio(props.audioUrl)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', () => {
      previewing.value = false
    })
  } else if (audio.src !== props.audioUrl) {
    audio.src = props.audioUrl
  }
  return audio
}

function onTimeUpdate() {
  if (!audio || !previewing.value) return
  currentTime.value = audio.currentTime
  if (audio.currentTime >= modelEnd.value) {
    audio.pause()
    previewing.value = false
    currentTime.value = modelStart.value
  }
}

function togglePreview() {
  const element = ensureAudio()
  if (!element) return

  if (previewing.value) {
    element.pause()
    previewing.value = false
    return
  }

  element.currentTime = modelStart.value
  currentTime.value = modelStart.value
  previewing.value = true
  void element.play().catch(() => {
    previewing.value = false
  })
}

watch(
  () => props.audioUrl,
  () => {
    audio?.pause()
    previewing.value = false
    currentTime.value = 0
    audio = null
  },
)

onUnmounted(() => {
  stopDrag()
  audio?.pause()
  audio = null
})
</script>

<style scoped>
.spotify-trim {
  margin-top: 18px;
  padding: 16px 18px 14px;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--primary) 18%, var(--border));
  background:
    radial-gradient(90% 120% at 0% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 50%),
    linear-gradient(180deg, color-mix(in srgb, var(--surface-3) 88%, #000) 0%, var(--surface-2) 100%);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, #fff 6%, transparent),
    0 16px 36px -26px rgba(0, 0, 0, 0.55);
}

.spotify-trim__hint {
  margin: 0 0 12px;
  font-size: 0.82rem;
  color: var(--muted);
  letter-spacing: 0.01em;
}

.spotify-trim__player {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: start;
}

.spotify-trim__art {
  position: relative;
}

.spotify-trim__cover {
  width: 76px;
  height: 76px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 12px 28px -14px rgba(0, 0, 0, 0.65);
}

.spotify-trim__cover--fallback {
  display: grid;
  place-items: center;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--primary) 42%, #1a121f), #100a12);
  color: color-mix(in srgb, var(--primary) 75%, #fff);
}

.spotify-trim__eq {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
  padding: 4px 5px;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--primary) 80%, transparent);
}

.spotify-trim__eq span {
  width: 2px;
  height: 100%;
  border-radius: 2px;
  background: #fff;
  animation: spotify-eq 0.85s ease-in-out infinite;
}

.spotify-trim__eq span:nth-child(2) {
  animation-delay: 0.15s;
}

.spotify-trim__eq span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes spotify-eq {
  0%,
  100% {
    transform: scaleY(0.35);
  }
  50% {
    transform: scaleY(1);
  }
}

.spotify-trim__main {
  min-width: 0;
}

.spotify-trim__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.spotify-trim__text {
  min-width: 0;
  padding-top: 2px;
}

.spotify-trim__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.spotify-trim__title {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-trim__chip {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--primary-strong);
  background: color-mix(in srgb, var(--primary) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
}

.spotify-trim__artist {
  display: block;
  margin-top: 4px;
  font-size: 0.82rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-trim__duration-total {
  opacity: 0.75;
}

.spotify-trim__play {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  color: #0f0a0d;
  background: var(--primary);
  box-shadow: 0 10px 24px -12px color-mix(in srgb, var(--primary) 75%, transparent);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.spotify-trim__play:hover {
  transform: scale(1.06);
  background: var(--primary-hover);
}

.spotify-trim__play--active {
  color: #fff;
  background: var(--primary-strong);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 22%, transparent);
}

.spotify-trim__timeline {
  position: relative;
  height: 44px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.spotify-trim__timeline--dragging {
  cursor: grabbing;
}

.spotify-trim__wave {
  position: absolute;
  inset: 6px 0 12px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  pointer-events: none;
}

.spotify-trim__bar {
  flex: 1;
  min-width: 2px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ink) 18%, transparent);
  opacity: 0.45;
  transition:
    background 0.15s ease,
    opacity 0.15s ease,
    transform 0.15s ease;
}

.spotify-trim__bar--selected {
  opacity: 0.9;
  background: color-mix(in srgb, var(--primary) 45%, var(--ink));
}

.spotify-trim__bar--played {
  opacity: 1;
  background: var(--primary);
  transform: scaleY(1.04);
}

.spotify-trim__rail {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--border) 70%, transparent);
  pointer-events: none;
}

.spotify-trim__selection {
  position: absolute;
  top: 50%;
  height: 3px;
  transform: translateY(-50%);
  border-radius: 999px;
  pointer-events: none;
  background: color-mix(in srgb, var(--primary) 35%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--primary) 25%, transparent);
}

.spotify-trim__shade {
  position: absolute;
  top: 4px;
  bottom: 8px;
  pointer-events: none;
  background: color-mix(in srgb, var(--surface-2) 72%, transparent);
  backdrop-filter: blur(0.5px);
}

.spotify-trim__shade--left {
  left: 0;
  border-radius: 8px 0 0 8px;
}

.spotify-trim__shade--right {
  right: 0;
  border-radius: 0 8px 8px 0;
}

.spotify-trim__playhead {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 22px;
  margin-left: -1px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 60%, transparent);
  pointer-events: none;
}

.spotify-trim__handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  transform: translateY(-50%);
  border: 2px solid #fff;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  cursor: grab;
  padding: 0;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.spotify-trim__handle:hover,
.spotify-trim__handle--active {
  transform: translateY(-50%) scale(1.12);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 24%, transparent);
}

.spotify-trim__handle:active {
  cursor: grabbing;
}

.spotify-trim__handle-tip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%) scale(0.94);
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(0, 0, 0, 0.72);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
}

.spotify-trim__handle:hover .spotify-trim__handle-tip,
.spotify-trim__handle--active .spotify-trim__handle-tip {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.spotify-trim__times {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  margin-top: 2px;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.spotify-trim__time-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.spotify-trim__time-label small,
.spotify-trim__times-center small {
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.spotify-trim__time-label--end {
  text-align: right;
  align-items: flex-end;
}

.spotify-trim__times-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  font-weight: 700;
  color: var(--primary-strong);
}

@media (max-width: 520px) {
  .spotify-trim__player {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .spotify-trim__art {
    display: flex;
    justify-content: center;
  }

  .spotify-trim__meta {
    align-items: center;
  }
}
</style>
