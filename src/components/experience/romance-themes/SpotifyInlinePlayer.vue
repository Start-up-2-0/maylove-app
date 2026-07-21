<template>
  <section class="spotify-player" aria-label="Player de música">
    <div class="spotify-player__row">
      <div class="spotify-player__art" :style="coverStyle" aria-hidden="true" />
      <div class="spotify-player__meta">
        <strong>{{ title }}</strong>
        <span>{{ artist }}</span>
      </div>
      <button
        type="button"
        class="spotify-player__heart"
        :class="{ 'spotify-player__heart--active': liked }"
        aria-label="Curtir"
        @click="liked = !liked"
      >
        {{ liked ? '♥' : '♡' }}
      </button>
    </div>

    <div class="spotify-player__progress">
      <span class="spotify-player__time">{{ formatTime(elapsed) }}</span>
      <button
        type="button"
        class="spotify-player__progress-bar"
        aria-label="Posição da música"
        @click="onSeekClick"
      >
        <span class="spotify-player__progress-fill" :style="{ width: `${progressPercent}%` }" />
      </button>
      <span class="spotify-player__time">{{ formatTime(segmentDuration) }}</span>
    </div>

    <div class="spotify-player__controls">
      <button type="button" class="spotify-player__ctrl spotify-player__ctrl--ghost" aria-hidden="true" tabindex="-1">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
        </svg>
      </button>
      <button
        type="button"
        class="spotify-player__ctrl"
        aria-label="Voltar ao início do trecho"
        @click="restartSegment"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
        </svg>
      </button>
      <button
        type="button"
        class="spotify-player__play"
        :aria-label="playing ? 'Pausar música' : 'Tocar música'"
        @click="toggle"
      >
        <svg v-if="playing" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      </button>
      <button
        type="button"
        class="spotify-player__ctrl"
        aria-label="Pular para o fim do trecho"
        @click="skipToEnd"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M6 18h2V6H6v12zm3.5-6 8.5 6V6l-8.5 6z" />
        </svg>
      </button>
      <button type="button" class="spotify-player__ctrl spotify-player__ctrl--ghost" aria-hidden="true" tabindex="-1">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useExperienceAudio } from '@/composables/experienceAudio'
import { useTributeAudio } from '@/composables/useTributeAudio'

const props = withDefaults(
  defineProps<{
    url: string
    title: string
    artist: string
    coverStyle?: Record<string, string | undefined>
    startAt?: number
    endAt?: number | null
    loop?: boolean
    autoplay?: boolean
  }>(),
  {
    coverStyle: () => ({}),
    startAt: 0,
    endAt: null,
    loop: true,
    autoplay: true,
  },
)

const liked = ref(false)

const shared = useExperienceAudio()
const urlRef = toRef(props, 'url')
const fallback = shared
  ? null
  : useTributeAudio(() => urlRef.value, {
      loop: () => props.loop !== false,
      autoplay: () => props.autoplay !== false,
      startAt: () => props.startAt ?? 0,
      endAt: () => props.endAt ?? null,
    })

const playing = shared ? shared.playing : fallback!.playing
const currentTime = shared ? shared.currentTime : fallback!.currentTime
const duration = shared ? shared.duration : fallback!.duration
const toggle = shared ? shared.toggle : fallback!.toggle
const seek = shared ? shared.seek : fallback!.seek
const pause = shared ? shared.pause : fallback!.pause

const segmentStart = computed(() => Math.max(0, props.startAt ?? 0))

const segmentEnd = computed(() => {
  const end = props.endAt
  if (end !== null && end !== undefined && end > segmentStart.value) {
    return end
  }
  const total = duration.value
  return total > segmentStart.value ? total : segmentStart.value
})

const segmentDuration = computed(() => Math.max(0, segmentEnd.value - segmentStart.value))

const elapsed = computed(() =>
  Math.max(0, Math.min(segmentDuration.value, currentTime.value - segmentStart.value)),
)

const progressPercent = computed(() => {
  if (segmentDuration.value <= 0) return 0
  return Math.min(100, (elapsed.value / segmentDuration.value) * 100)
})

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60)
  const remainder = safe % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

function onSeekClick(event: MouseEvent) {
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  if (rect.width <= 0 || segmentDuration.value <= 0) return
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  void seek(segmentStart.value + ratio * segmentDuration.value)
}

function restartSegment() {
  void seek(segmentStart.value)
  if (playing.value) return
  toggle()
}

function skipToEnd() {
  pause()
  void seek(Math.max(segmentStart.value, segmentEnd.value - 0.05))
}
</script>

<style scoped>
.spotify-player {
  margin-bottom: 22px;
  padding: 14px 12px 12px;
  border-radius: 16px;
  background: #181818;
}
.spotify-player__row {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 10px;
  align-items: center;
}
.spotify-player__art {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  background-color: #282828;
}
.spotify-player__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.spotify-player__meta strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.spotify-player__meta span {
  font-size: 0.76rem;
  color: rgb(255 255 255 / 55%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.spotify-player__heart {
  border: none;
  background: none;
  padding: 4px;
  font-size: 1.1rem;
  line-height: 1;
  color: rgb(255 255 255 / 70%);
  cursor: pointer;
}
.spotify-player__heart--active {
  color: #1db954;
}
.spotify-player__progress {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}
.spotify-player__time {
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 45%);
  min-width: 2rem;
}
.spotify-player__time:last-child {
  text-align: right;
}
.spotify-player__progress-bar {
  position: relative;
  height: 4px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 18%);
  cursor: pointer;
  overflow: hidden;
}
.spotify-player__progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #fff;
  transition: width 0.15s linear;
}
.spotify-player__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 12px;
}
.spotify-player__ctrl {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: none;
  color: rgb(255 255 255 / 72%);
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
}
.spotify-player__ctrl:hover {
  color: #fff;
  transform: scale(1.05);
}
.spotify-player__ctrl--ghost {
  opacity: 0.45;
  pointer-events: none;
}
.spotify-player__play {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: #1db954;
  color: #121212;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(29 185 84 / 35%);
  transition: transform 0.15s ease, background 0.15s ease;
}
.spotify-player__play:hover {
  transform: scale(1.06);
  background: #1ed760;
}
.spotify-player__play:active {
  transform: scale(0.98);
}
</style>
