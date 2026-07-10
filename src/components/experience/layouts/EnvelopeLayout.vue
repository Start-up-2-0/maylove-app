<template>
  <div class="env" :class="{ 'env--preview': mode === 'preview', [`env--${phase}`]: true }">
    <!-- Cena do envelope: aba → carta subindo → expansão -->
    <div v-if="phase !== 'read'" class="env-scene">
      <p v-if="phase === 'closed' && content.subtitle" class="env-scene__eyebrow exp-eyebrow">
        {{ content.subtitle }}
      </p>

      <div class="env-envelope-wrap">
        <div
          class="env-envelope"
          :class="envelopeClass"
          role="button"
          tabindex="0"
          :aria-disabled="phase !== 'closed'"
          aria-label="Abrir carta"
          @click="open"
          @keydown.enter.prevent="open"
          @keydown.space.prevent="open"
        >
          <div class="env-envelope__inner">
            <span class="env-envelope__back" />
            <span class="env-envelope__folds" aria-hidden="true" />
            <span class="env-envelope__letter" aria-hidden="true" />
            <span class="env-envelope__pocket" aria-hidden="true" />
            <span class="env-envelope__flap" aria-hidden="true">
              <span class="env-envelope__flap-face" />
            </span>
            <span class="env-envelope__seal">{{ initial }}</span>
          </div>
        </div>
      </div>

      <template v-if="phase === 'closed'">
        <p class="env-scene__hint">Para {{ content.honoreeName || 'você' }}</p>
        <button class="env-open-btn" @click="open">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 7l8 6 8-6M4 7h16v11H4z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Abrir carta
        </button>
      </template>
    </div>

    <!-- Carta em leitura -->
    <transition name="letter-reveal" @after-enter="onLetterEntered">
      <article v-if="phase === 'read'" class="letter">
        <header class="letter__head">
          <p class="letter__place">Uma carta para você</p>
          <h1 class="letter__title">{{ content.title }}</h1>
        </header>

        <div class="letter__body">
          <RichText v-if="introHtml" :text="content.message" class="letter__para letter__intro" />

          <template v-for="(beat, i) in beats" :key="i">
            <p v-if="beat.text && i <= activeIndex" class="letter__para">
              {{ i < activeIndex ? beat.text : typedText
              }}<span v-if="i === activeIndex && !doneTyping" class="letter__caret" />
            </p>
            <figure v-if="beat.photo && beatVisible(i)" class="letter__photo">
              <img :src="beat.photo.url" :alt="`Recordação ${i + 1}`" loading="lazy" />
            </figure>
          </template>
        </div>

        <footer v-if="doneTyping" class="letter__foot">
          <RichText v-if="content.closingMessage" :text="content.closingMessage" class="letter__closing" />
          <p class="letter__sign">{{ content.signature || content.senderName }}</p>
          <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="content.title" />
        </footer>
      </article>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { ExperienceMediaItem, ExperienceTimelineItem, LayoutComponentProps } from '@/templates/types'
import { useExperienceAudio } from '@/composables/experienceAudio'
import { containsHtml } from '@/utils/richText'
import { plainTimelineText, resolveTimelinePhoto } from '@/utils/timeline'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

interface LetterBeat {
  text: string
  photo?: ExperienceMediaItem
}

type OpenPhase = 'closed' | 'flap' | 'rise' | 'expand' | 'read'

const FLAP_MS = 900
const RISE_MS = 1400
const EXPAND_MS = 900

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const phase = ref<OpenPhase>('closed')
const activeIndex = ref(0)
const typedText = ref('')
const doneTyping = ref(false)
const readingStarted = ref(false)
let timer: number | undefined

const initial = computed(() => (props.content.senderName || props.content.honoreeName || 'M').charAt(0).toUpperCase())
const introHtml = computed(() => (containsHtml(props.content.message) ? props.content.message : null))
const envelopeClass = computed(() => ({
  'env-envelope--flap': phase.value === 'flap',
  'env-envelope--rise': phase.value === 'rise',
  'env-envelope--expand': phase.value === 'expand',
}))

const beats = computed<LetterBeat[]>(() => {
  const timeline = props.content.timeline
  if (timeline.length) {
    const items: LetterBeat[] = []
    const intro = introHtml.value ? '' : plainTimelineText(props.content.message)
    if (intro) items.push({ text: intro })
    for (const item of timeline) {
      items.push(beatFromTimelineItem(item))
    }
    return items.filter((beat) => beat.text || beat.photo)
  }

  const base = (props.content.message || '')
    .split('\n')
    .map((line) => plainTimelineText(line))
    .filter(Boolean)
  const extra = props.content.messages.map((line) => plainTimelineText(line)).filter(Boolean)
  const all = [...base, ...extra]
  if (all.length) {
    return all.map((text, i) => ({ text, photo: props.content.photos[i] }))
  }
  if (props.content.photos.length) {
    return props.content.photos.map((photo) => ({ text: '', photo }))
  }
  return []
})

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function beatFromTimelineItem(item: ExperienceTimelineItem): LetterBeat {
  const text = plainTimelineText(item.description || item.title || '')
  const photo = resolveTimelinePhoto(props.content.photos, item)
  return { text, photo }
}

function beatVisible(index: number): boolean {
  const beat = beats.value[index]
  if (!beat?.photo) return false
  if (beat.text) return index < activeIndex.value
  return index <= activeIndex.value
}

function open() {
  if (phase.value !== 'closed') return
  if (audio?.hasAudio) audio.play()

  if (reduced) {
    phase.value = 'read'
    readingStarted.value = true
    beginReading()
    return
  }

  phase.value = 'flap'
  window.setTimeout(() => {
    phase.value = 'rise'
  }, FLAP_MS)
  window.setTimeout(() => {
    phase.value = 'expand'
  }, FLAP_MS + RISE_MS)
  window.setTimeout(() => {
    phase.value = 'read'
  }, FLAP_MS + RISE_MS + EXPAND_MS)
}

function onLetterEntered() {
  if (readingStarted.value) return
  readingStarted.value = true
  beginReading()
}

function beginReading() {
  if (!beats.value.some((beat) => beat.text)) {
    activeIndex.value = beats.value.length
    doneTyping.value = true
    return
  }
  window.setTimeout(startTyping, 320)
}

function startTyping() {
  const beat = beats.value[activeIndex.value]
  const para = beat?.text ?? ''
  if (!para) {
    timer = window.setTimeout(nextBeat, 380)
    return
  }

  const speed = Math.max(12, 24 * props.theme.speedMultiplier)
  let pos = 0
  const step = () => {
    pos += 1
    typedText.value = para.slice(0, pos)
    if (pos < para.length) {
      timer = window.setTimeout(step, speed)
    } else {
      timer = window.setTimeout(nextBeat, 520)
    }
  }
  step()
}

function nextBeat() {
  if (activeIndex.value >= beats.value.length - 1) {
    activeIndex.value = beats.value.length
    doneTyping.value = true
    return
  }
  activeIndex.value += 1
  typedText.value = ''
  startTyping()
}

onBeforeUnmount(() => {
  window.clearTimeout(timer)
})
</script>

<style scoped>
.env {
  position: relative;
  display: grid;
  place-items: center;
  min-height: var(--exp-stage, 100svh);
  padding: clamp(24px, 6vw, 64px) clamp(16px, 5vw, 40px);
}
.env--preview {
  min-height: var(--exp-stage, 620px);
}

/* ---------- Cena do envelope ---------- */
.env-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  width: 100%;
  overflow: visible;
}
.env-scene__eyebrow {
  font-style: normal;
  animation: env-soft-in 0.6s var(--exp-ease) both;
}
.env-envelope-wrap {
  perspective: 1400px;
  perspective-origin: 50% 35%;
  width: clamp(220px, 42vw, 320px);
  height: clamp(168px, 30vw, 236px);
  overflow: visible;
  margin-bottom: clamp(40px, 10vw, 90px);
}
.env-envelope {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  outline: none;
  filter: drop-shadow(0 26px 48px color-mix(in srgb, var(--exp-primary) 40%, transparent));
  transition: filter 0.6s ease;
}
.env-envelope[aria-disabled='true'] {
  cursor: default;
  pointer-events: none;
}
.env--closed .env-envelope:hover:not([aria-disabled='true']) {
  filter: drop-shadow(0 30px 52px color-mix(in srgb, var(--exp-primary) 48%, transparent));
}
.env-envelope:focus-visible .env-envelope__inner {
  outline: 2px solid color-mix(in srgb, var(--exp-accent) 70%, #fff);
  outline-offset: 4px;
  border-radius: 14px;
}
.env-envelope__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.55s ease;
}
.env--closed .env-envelope:hover:not([aria-disabled='true']) .env-envelope__inner {
  transform: translateY(-6px) rotate(-1deg);
}

/* Fundo do envelope */
.env-envelope__back {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--exp-primary) 88%, #fff) 0%,
    var(--exp-primary) 100%
  );
  box-shadow: inset 0 -8px 24px color-mix(in srgb, #000 10%, transparent);
  transform: translateZ(0);
}
.env-envelope__folds {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(45deg, transparent 49.2%, color-mix(in srgb, #000 14%, transparent) 50%, transparent 50.8%),
    linear-gradient(-45deg, transparent 49.2%, color-mix(in srgb, #000 14%, transparent) 50%, transparent 50.8%);
  opacity: 0.55;
}

/* Carta dentro do envelope — sobe por cima do bolso frontal */
.env-envelope__letter {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 10%;
  height: 78%;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #fffef9 0%, #f6f1e6 100%);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
  z-index: 2;
  transform: translateY(62%);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 1.15s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s ease;
}

/* Bolso frontal — só a parte de baixo, deixa a carta aparecer no topo */
.env-envelope__pocket {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--exp-primary) 78%, #000 8%) 38%,
    var(--exp-primary) 100%
  );
  clip-path: polygon(0 46%, 50% 68%, 100% 46%, 100% 100%, 0 100%);
  box-shadow: inset 0 6px 18px color-mix(in srgb, #000 12%, transparent);
  transition: opacity 0.55s ease;
}

/* Aba superior — abre em 3D */
.env-envelope__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56%;
  z-index: 5;
  transform-style: preserve-3d;
  transform-origin: 50% 0;
  transition: transform 0.85s cubic-bezier(0.33, 1, 0.68, 1);
  animation: env-flap-idle 3.6s ease-in-out infinite;
}
.env-envelope__flap-face {
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--exp-primary) 72%, #fff) 0%,
    color-mix(in srgb, var(--exp-primary) 86%, #000 6%) 100%
  );
  box-shadow: 0 10px 20px color-mix(in srgb, #000 18%, transparent);
  backface-visibility: hidden;
  transform: translateZ(2px);
}
.env-envelope__seal {
  position: absolute;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 6;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  font-family: var(--exp-font-display);
  font-size: 1.3rem;
  color: #fff;
  background: color-mix(in srgb, var(--exp-accent) 88%, #000);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
  transition:
    opacity 0.45s ease,
    transform 0.55s cubic-bezier(0.33, 1, 0.68, 1);
}

/* Fase 1: aba abre — carta começa a aparecer no vão */
.env-envelope--flap .env-envelope__letter {
  opacity: 0.45;
  transform: translateY(42%);
}
.env-envelope--flap .env-envelope__flap,
.env-envelope--rise .env-envelope__flap,
.env-envelope--expand .env-envelope__flap {
  animation: none;
  transform: rotateX(-175deg);
}
.env-envelope--flap .env-envelope__seal,
.env-envelope--rise .env-envelope__seal,
.env-envelope--expand .env-envelope__seal {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}

/* Fase 2: carta sobe e fica visível acima do bolso */
.env-envelope--rise .env-envelope__letter {
  opacity: 1;
  transform: translateY(-18%);
  z-index: 8;
}
.env-envelope--rise .env-envelope__pocket {
  opacity: 1;
}

/* Fase 3: envelope recua, carta continua subindo */
.env-envelope--expand .env-envelope__letter {
  opacity: 1;
  transform: translateY(-72%) scale(1.04);
  z-index: 10;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}
.env-envelope--expand .env-envelope__back,
.env-envelope--expand .env-envelope__folds,
.env-envelope--expand .env-envelope__pocket,
.env-envelope--expand .env-envelope__flap,
.env-envelope--expand .env-envelope__seal {
  opacity: 0;
  transition: opacity 0.65s ease;
}

@keyframes env-flap-idle {
  0%,
  100% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(16deg);
  }
}

.env-scene__hint {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--exp-muted);
  animation: env-soft-in 0.7s var(--exp-ease) 0.1s both;
}
.env-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #fff;
  background: var(--exp-primary);
  cursor: pointer;
  box-shadow: 0 14px 30px -10px color-mix(in srgb, var(--exp-primary) 70%, transparent);
  transition: transform 0.25s var(--exp-ease);
  animation: env-soft-in 0.8s var(--exp-ease) 0.15s both;
}
.env-open-btn:hover {
  transform: translateY(-2px);
}

/* ---------- Carta ---------- */
.letter {
  width: min(680px, 100%);
  padding: clamp(28px, 5vw, 56px) clamp(22px, 5vw, 52px);
  border-radius: 6px;
  background: var(--exp-surface, #fff);
  border: 1px solid var(--exp-border);
  box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.4);
  background-image: repeating-linear-gradient(
    transparent,
    transparent 33px,
    color-mix(in srgb, var(--exp-primary) 10%, transparent) 34px
  );
}
.letter__head {
  text-align: center;
  margin-bottom: 28px;
}
.letter__place {
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--exp-primary);
  margin-bottom: 10px;
}
.letter__title {
  font-size: clamp(1.8rem, 5vw, 2.8rem);
}
.letter__body {
  min-height: 3rem;
}
.letter__intro {
  margin-bottom: 1.4rem;
}
.letter__para {
  font-family: var(--exp-font-display);
  font-size: clamp(1.05rem, 2.6vw, 1.35rem);
  line-height: 1.9;
  color: var(--exp-text);
  margin: 0 0 1.1rem;
}
.letter__caret {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: var(--exp-primary);
  animation: env-caret 0.9s step-end infinite;
}
@keyframes env-caret {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
.letter__photo {
  margin: 8px auto 22px;
  width: min(320px, 80%);
  padding: 10px 10px 30px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 14px 30px -14px rgba(0, 0, 0, 0.5);
  transform: rotate(-2deg);
  animation: env-photo-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.letter__photo:nth-of-type(even) {
  transform: rotate(2deg);
}
.letter__photo img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 2px;
}
.letter__foot {
  margin-top: 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: env-soft-in 0.8s var(--exp-ease);
}
.letter__closing {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--exp-ink);
}
.letter__sign {
  font-family: 'Caveat', cursive;
  font-size: 2rem;
  color: var(--exp-primary);
}

.letter-reveal-enter-active {
  transition:
    opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.letter-reveal-enter-from {
  opacity: 0;
  transform: translateY(-24px) scale(0.94);
}

@keyframes env-soft-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes env-photo-in {
  from {
    opacity: 0;
    transform: translateY(16px) rotate(-4deg) scale(0.96);
  }
  to {
    opacity: 1;
    transform: rotate(-2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .env-envelope__flap {
    animation: none;
  }
  .env-envelope__inner,
  .env-envelope__letter,
  .env-envelope__seal,
  .env-envelope__flap,
  .env-envelope__pocket,
  .letter-reveal-enter-active,
  .letter__photo {
    transition: none !important;
    animation: none !important;
  }
}
</style>
