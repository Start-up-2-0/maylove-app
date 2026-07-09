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
      </div>

      <div class="spotify-trim__main">
        <div class="spotify-trim__meta">
          <div class="spotify-trim__text">
            <strong class="spotify-trim__title">{{ title }}</strong>
            <span class="spotify-trim__artist">
              {{ artist }}
              <template v-if="sourceLabel"> · {{ sourceLabel }}</template>
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
          @pointerdown="onTrackPointerDown"
        >
          <div class="spotify-trim__wave" aria-hidden="true">
            <span v-for="bar in waveformBars" :key="bar" :style="{ height: `${bar}%` }" />
          </div>

          <div class="spotify-trim__track-base" />

          <div
            class="spotify-trim__selection"
            :style="{
              left: `${startPercent}%`,
              width: `${selectionPercent}%`,
            }"
          />

          <div
            v-if="previewing || playbackProgress > 0"
            class="spotify-trim__progress"
            :style="{ width: `${playbackProgress}%` }"
          />

          <button
            type="button"
            class="spotify-trim__handle spotify-trim__handle--start"
            :style="{ left: `${startPercent}%` }"
            aria-label="Ajustar início do trecho"
            @pointerdown.stop="startDrag('start', $event)"
          />

          <button
            type="button"
            class="spotify-trim__handle spotify-trim__handle--end"
            :style="{ left: `${endPercent}%` }"
            aria-label="Ajustar fim do trecho"
            @pointerdown.stop="startDrag('end', $event)"
          />
        </div>

        <div class="spotify-trim__times">
          <span>{{ formatTime(modelStart) }}</span>
          <span class="spotify-trim__times-center">
            <template v-if="previewing">{{ formatTime(displayCurrentTime) }}</template>
            <template v-else>Trecho {{ formatTime(modelEnd - modelStart) }}</template>
          </span>
          <span>{{ formatTime(modelEnd) }}</span>
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

const safeDuration = computed(() => Math.max(props.durationSeconds, 1))
const modelStart = computed(() => props.startSeconds)
const modelEnd = computed(() => props.endSeconds)
const startPercent = computed(() => (modelStart.value / safeDuration.value) * 100)
const endPercent = computed(() => (modelEnd.value / safeDuration.value) * 100)
const selectionPercent = computed(() => Math.max(endPercent.value - startPercent.value, 0))

const previewing = ref(false)
const currentTime = ref(0)
const trackRef = ref<HTMLElement | null>(null)

let audio: HTMLAudioElement | null = null
let dragMode: 'start' | 'end' | null = null

const waveformBars = [38, 62, 44, 78, 52, 88, 40, 70, 48, 82, 36, 66, 54, 90, 42, 74, 50, 84, 46, 68, 58, 76, 34, 64]

const displayCurrentTime = computed(() =>
  Math.max(modelStart.value, Math.min(currentTime.value, modelEnd.value)),
)

const playbackProgress = computed(() => {
  if (safeDuration.value <= 0) return 0
  return (displayCurrentTime.value / safeDuration.value) * 100
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

function applyDrag(clientX: number) {
  if (!dragMode) return
  const seconds = secondsFromClientX(clientX)

  if (dragMode === 'start') {
    const { start, end } = clampRange(seconds, modelEnd.value)
    emit('update:startSeconds', start)
    if (end !== modelEnd.value) emit('update:endSeconds', end)
    if (previewing.value && audio) audio.currentTime = start
    return
  }

  const { start, end } = clampRange(modelStart.value, seconds)
  if (start !== modelStart.value) emit('update:startSeconds', start)
  emit('update:endSeconds', end)
}

function onPointerMove(event: PointerEvent) {
  applyDrag(event.clientX)
}

function stopDrag() {
  dragMode = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopDrag)
}

function startDrag(mode: 'start' | 'end', event: PointerEvent) {
  dragMode = mode
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopDrag, { once: true })
  applyDrag(event.clientX)
}

function onTrackPointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.spotify-trim__handle')) return
  const seconds = secondsFromClientX(event.clientX)
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
  padding: 18px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
  background:
    radial-gradient(120% 140% at 100% 0%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 55%),
    linear-gradient(165deg, color-mix(in srgb, var(--surface-3) 92%, #000) 0%, var(--surface-2) 100%);
  box-shadow: 0 18px 40px -28px rgba(0, 0, 0, 0.45);
}

.spotify-trim__hint {
  margin: 0 0 14px;
  font-size: 0.84rem;
  color: var(--muted);
}

.spotify-trim__player {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
}

.spotify-trim__cover {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.55);
}

.spotify-trim__cover--fallback {
  display: grid;
  place-items: center;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--primary) 35%, #1a121f), #120d16);
  color: color-mix(in srgb, var(--primary) 70%, #fff);
}

.spotify-trim__main {
  min-width: 0;
}

.spotify-trim__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.spotify-trim__text {
  min-width: 0;
}

.spotify-trim__title {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-trim__artist {
  display: block;
  margin-top: 2px;
  font-size: 0.84rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-trim__play {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
  box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--primary) 70%, transparent);
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease;
}

.spotify-trim__play:hover {
  transform: scale(1.05);
  background: var(--primary-hover);
}

.spotify-trim__play--active {
  background: var(--primary-strong);
}

.spotify-trim__timeline {
  position: relative;
  height: 38px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.spotify-trim__wave {
  position: absolute;
  inset: 8px 0 10px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  opacity: 0.35;
  pointer-events: none;
}

.spotify-trim__wave span {
  flex: 1;
  min-width: 2px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ink) 55%, transparent);
}

.spotify-trim__track-base,
.spotify-trim__selection,
.spotify-trim__progress {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 5px;
  transform: translateY(-50%);
  border-radius: 999px;
  pointer-events: none;
}

.spotify-trim__track-base {
  background: color-mix(in srgb, var(--border) 85%, transparent);
}

.spotify-trim__selection {
  right: auto;
  background: color-mix(in srgb, var(--primary) 55%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 35%, transparent);
}

.spotify-trim__progress {
  right: auto;
  width: 0;
  background: var(--primary);
  transition: width 0.08s linear;
}

.spotify-trim__handle {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  transform: translateY(-50%);
  border: 2px solid #fff;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
  cursor: grab;
  padding: 0;
}

.spotify-trim__handle:active {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.08);
}

.spotify-trim__times {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.76rem;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.spotify-trim__times span:first-child {
  text-align: left;
}

.spotify-trim__times span:last-child {
  text-align: right;
}

.spotify-trim__times-center {
  color: var(--ink);
  font-weight: 600;
}

@media (max-width: 520px) {
  .spotify-trim__player {
    grid-template-columns: 1fr;
  }

  .spotify-trim__art {
    display: flex;
    justify-content: center;
  }
}
</style>
