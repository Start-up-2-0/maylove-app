<template>
  <div class="cin" :class="{ 'cin--preview': mode === 'preview', 'cin--dramatic': config?.dramatic }">
    <div class="cin__stage">
      <transition-group name="cin-slide" tag="div" class="cin__slides">
        <div
          v-for="(slide, i) in slides"
          v-show="i === index"
          :key="i"
          class="cin__slide"
        >
          <div
            v-if="slide.photo"
            class="cin__bg"
            :class="i % 2 === 0 ? 'cin__bg--in' : 'cin__bg--out'"
            :style="bgStyle(slide.photo.url)"
          />
          <div v-else class="cin__bg cin__bg--grad" />
          <div class="cin__scrim" />
          <div class="cin__caption">
            <p v-if="i === 0 && content.senderName" class="cin__eyebrow">{{ content.senderName }}</p>
            <h1 v-if="slide.title" class="cin__title">{{ slide.title }}</h1>
            <p v-if="slide.subtitle" class="cin__subtitle">{{ slide.subtitle }}</p>
            <RichText v-if="slide.caption" :text="slide.caption" class="cin__text" />
          </div>
        </div>
      </transition-group>
    </div>

    <div class="cin__timeline">
      <span
        v-for="(_, i) in slides"
        :key="i"
        class="cin__seg"
        :class="{ 'is-done': i < index, 'is-active': i === index }"
      >
        <span
          class="cin__seg-fill"
          :style="i === index ? { animationDuration: `${slideMs}ms`, animationPlayState: paused ? 'paused' : 'running' } : {}"
        />
      </span>
    </div>

    <div class="cin__controls">
      <button class="cin__ctrl" aria-label="Anterior" @click="go(-1)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button class="cin__ctrl cin__ctrl--play" :aria-label="paused ? 'Reproduzir' : 'Pausar'" @click="togglePlay">
        <svg v-if="paused" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
        </svg>
      </button>
      <button class="cin__ctrl" aria-label="Próximo" @click="go(1)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <ShareBar
      v-if="mode === 'full' && shareUrl && index === slides.length - 1"
      class="cin__share"
      :url="shareUrl"
      :text="content.title"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { CSSProperties } from 'vue'
import type { ExperienceMediaItem, LayoutComponentProps } from '@/templates/types'
import { useExperienceAudio } from '@/composables/experienceAudio'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

interface Slide {
  photo?: ExperienceMediaItem
  title?: string
  subtitle?: string
  caption?: string
}

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const index = ref(0)
const paused = ref(false)
let timer: number | undefined

const slideMs = computed(() => Math.round(6000 * props.theme.speedMultiplier))

function bgStyle(url: string): CSSProperties {
  return { backgroundImage: `url("${url}")`, animationPlayState: paused.value ? 'paused' : 'running' }
}

const slides = computed<Slide[]>(() => {
  const photos = props.content.photos
  if (!photos.length) {
    return [
      {
        title: props.content.title,
        subtitle: props.content.subtitle,
        caption: props.content.includeOpeningMessage ? props.content.message : '',
      },
    ]
  }
  return photos.map((photo, i) => ({
    photo,
    title: i === 0 ? props.content.title : undefined,
    subtitle: i === 0 ? props.content.subtitle : undefined,
    caption:
      props.content.messages[i] ||
      props.content.timeline[i]?.description ||
      props.content.timeline[i]?.title ||
      (i === 0 && props.content.includeOpeningMessage ? props.content.message : '') ||
      (i === props.content.photos.length - 1 && props.content.includeClosingMessage
        ? props.content.closingMessage
        : ''),
  }))
})

function schedule() {
  window.clearTimeout(timer)
  if (paused.value) return
  timer = window.setTimeout(() => go(1), slideMs.value)
}

function go(delta: number) {
  const len = slides.value.length
  index.value = (index.value + delta + len) % len
  schedule()
}

function togglePlay() {
  paused.value = !paused.value
  if (paused.value) {
    window.clearTimeout(timer)
    audio?.pause()
  } else {
    if (audio?.hasAudio) audio.play()
    schedule()
  }
}

onMounted(() => {
  if (props.mode === 'full' && audio?.hasAudio) audio.play()
  schedule()
})
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<style scoped>
.cin {
  position: relative;
  height: var(--exp-stage, 100svh);
  overflow: hidden;
  background: #000;
}
.cin--preview {
  height: var(--exp-stage, 620px);
}
.cin__stage,
.cin__slides,
.cin__slide {
  position: absolute;
  inset: 0;
}
.cin__bg {
  position: absolute;
  inset: -5%;
  background-size: cover;
  background-position: center;
  z-index: 0;
}
.cin__bg--in {
  animation: cin-kb-in 8s ease-out forwards;
}
.cin__bg--out {
  animation: cin-kb-out 8s ease-out forwards;
}
.cin__bg--grad {
  inset: 0;
  background:
    radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--exp-primary) 60%, transparent), transparent 60%),
    var(--exp-bg);
}
.cin__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.15) 45%, rgba(0, 0, 0, 0.35) 100%);
}
/* Clima dramático: vinheta reforçada em volta da cena. */
.cin--dramatic .cin__scrim {
  background:
    radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.55) 100%),
    linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%);
}
.cin--dramatic .cin__title {
  font-size: clamp(2.6rem, 8vw, 6rem);
  letter-spacing: -0.01em;
}
.cin__caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(70px, 12vh, 130px);
  z-index: 2;
  padding: 0 clamp(24px, 8vw, 96px);
  color: #fff;
  max-width: 900px;
}
.cin__eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--exp-accent) 60%, #fff);
  margin-bottom: 12px;
}
.cin__title {
  color: #fff;
  font-size: clamp(2.2rem, 7vw, 5rem);
  text-shadow: 0 6px 34px rgba(0, 0, 0, 0.5);
}
.cin__subtitle {
  margin-top: 12px;
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: clamp(1.1rem, 3vw, 1.8rem);
  color: rgba(255, 255, 255, 0.92);
}
.cin__text {
  margin-top: 14px;
  font-family: var(--exp-font-display);
  font-size: clamp(1.05rem, 2.6vw, 1.5rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.94);
  max-width: 60ch;
}
.cin__timeline {
  position: absolute;
  top: clamp(14px, 3vw, 22px);
  left: clamp(16px, 4vw, 40px);
  right: clamp(16px, 4vw, 40px);
  z-index: 4;
  display: flex;
  gap: 6px;
}
.cin__seg {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.28);
}
.cin__seg.is-done {
  background: var(--exp-primary);
}
.cin__seg-fill {
  display: block;
  height: 100%;
  width: 0;
  background: var(--exp-primary);
}
.cin__seg.is-active .cin__seg-fill {
  animation: cin-progress linear forwards;
}
.cin__controls {
  position: absolute;
  bottom: clamp(18px, 4vw, 32px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 14px;
}
.cin__ctrl {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: transform 0.2s var(--exp-ease), background 0.2s var(--exp-ease);
}
.cin__ctrl:hover {
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.24);
}
.cin__ctrl--play {
  width: 56px;
  height: 56px;
  background: var(--exp-primary);
  border-color: transparent;
}
.cin__share {
  position: absolute;
  bottom: clamp(84px, 14vh, 110px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
}

.cin-slide-enter-active,
.cin-slide-leave-active {
  transition: opacity 1s var(--exp-ease);
}
.cin-slide-enter-from,
.cin-slide-leave-to {
  opacity: 0;
}

@keyframes cin-kb-in {
  from { transform: scale(1); }
  to { transform: scale(1.14); }
}
@keyframes cin-kb-out {
  from { transform: scale(1.14); }
  to { transform: scale(1); }
}
@keyframes cin-progress {
  from { width: 0; }
  to { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .cin__bg--in,
  .cin__bg--out { animation: none; }
}
</style>
