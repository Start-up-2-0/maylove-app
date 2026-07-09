<template>
  <div class="music-trim">
    <p class="music-trim__hint">Escolha o trecho que será tocado na homenagem.</p>

    <div class="music-trim__labels">
      <span>Início: {{ formatTime(modelStart) }}</span>
      <span>Fim: {{ formatTime(modelEnd) }}</span>
      <span>Trecho: {{ formatTime(modelEnd - modelStart) }}</span>
    </div>

    <div class="music-trim__track">
      <div
        class="music-trim__selection"
        :style="{
          left: `${(modelStart / safeDuration) * 100}%`,
          width: `${((modelEnd - modelStart) / safeDuration) * 100}%`,
        }"
      />
    </div>

    <div class="music-trim__sliders">
      <label class="music-trim__slider-label">
        <span>Início</span>
        <input
          type="range"
          :min="0"
          :max="safeDuration"
          step="0.5"
          :value="modelStart"
          @input="onStartInput"
        />
      </label>
      <label class="music-trim__slider-label">
        <span>Fim</span>
        <input
          type="range"
          :min="0"
          :max="safeDuration"
          step="0.5"
          :value="modelEnd"
          @input="onEndInput"
        />
      </label>
    </div>

    <button type="button" class="ml-btn ml-btn--secondary music-trim__preview" @click="togglePreview">
      {{ previewing ? 'Pausar prévia' : 'Ouvir trecho' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  audioUrl: string
  durationSeconds: number
  startSeconds: number
  endSeconds: number
}>()

const emit = defineEmits<{
  'update:startSeconds': [value: number]
  'update:endSeconds': [value: number]
}>()

const safeDuration = computed(() => Math.max(props.durationSeconds, 1))
const modelStart = computed(() => props.startSeconds)
const modelEnd = computed(() => props.endSeconds)

const previewing = ref(false)
let audio: HTMLAudioElement | null = null

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

function onStartInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  const { start, end } = clampRange(value, modelEnd.value)
  emit('update:startSeconds', start)
  if (end !== modelEnd.value) emit('update:endSeconds', end)
}

function onEndInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  const { start, end } = clampRange(modelStart.value, value)
  if (start !== modelStart.value) emit('update:startSeconds', start)
  emit('update:endSeconds', end)
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
  if (audio.currentTime >= modelEnd.value) {
    audio.pause()
    previewing.value = false
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
    audio = null
  },
)

onUnmounted(() => {
  audio?.pause()
  audio = null
})
</script>

<style scoped>
.music-trim {
  margin-top: 18px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-3);
}
.music-trim__hint {
  margin: 0 0 12px;
  font-size: 0.88rem;
  color: var(--muted);
}
.music-trim__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  margin-bottom: 12px;
  font-size: 0.84rem;
  color: var(--ink);
  font-weight: 600;
}
.music-trim__track {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--border);
  margin-bottom: 14px;
  overflow: hidden;
}
.music-trim__selection {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--primary);
  border-radius: 999px;
}
.music-trim__sliders {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.music-trim__slider-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--muted);
}
.music-trim__slider-label input {
  width: 100%;
  accent-color: var(--primary);
}
.music-trim__preview {
  width: 100%;
}
</style>
