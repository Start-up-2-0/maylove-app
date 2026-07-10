<template>
  <div class="env" :class="{ 'env--preview': mode === 'preview' }">
    <!-- Cena do envelope -->
    <div v-if="!reading" class="env-scene">
      <p v-if="!animating && content.subtitle" class="env-scene__eyebrow exp-eyebrow">
        {{ content.subtitle }}
      </p>

      <div class="env-mail" :class="{ 'env-mail--animating': animating }">
        <div
          class="env-mail__hit"
          role="button"
          tabindex="0"
          :aria-disabled="animating"
          aria-label="Abrir carta"
          @click="open"
          @keydown.enter.prevent="open"
          @keydown.space.prevent="open"
        >
          <!-- Fundo do envelope -->
          <span class="env-mail__back" />
          <span class="env-mail__folds" aria-hidden="true" />

          <!-- Ranhura: carta só aparece aqui dentro -->
          <span class="env-mail__slot" aria-hidden="true">
            <span class="env-mail__paper" />
          </span>

          <!-- Bolso frontal -->
          <span class="env-mail__pocket" aria-hidden="true" />

          <!-- Aba com frente e verso -->
          <span class="env-mail__flap" aria-hidden="true">
            <span class="env-mail__flap-face env-mail__flap-face--front" />
            <span class="env-mail__flap-face env-mail__flap-face--back" />
          </span>

          <span class="env-mail__seal">{{ initial }}</span>
        </div>
      </div>

      <template v-if="!animating">
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
      <article v-if="reading" class="letter">
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

/** Duração total da animação do envelope (ms) — deve bater com o CSS */
const OPEN_ANIMATION_MS = 3400

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const animating = ref(false)
const reading = ref(false)
const activeIndex = ref(0)
const typedText = ref('')
const doneTyping = ref(false)
const readingStarted = ref(false)
let timer: number | undefined
let openTimer: number | undefined

const initial = computed(() => (props.content.senderName || props.content.honoreeName || 'M').charAt(0).toUpperCase())
const introHtml = computed(() => (containsHtml(props.content.message) ? props.content.message : null))

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
  if (animating.value || reading.value) return
  if (audio?.hasAudio) audio.play()

  if (reduced) {
    reading.value = true
    readingStarted.value = true
    beginReading()
    return
  }

  animating.value = true
  openTimer = window.setTimeout(() => {
    reading.value = true
  }, OPEN_ANIMATION_MS)
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
  window.setTimeout(startTyping, 400)
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
  window.clearTimeout(openTimer)
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

/* ---------- Cena ---------- */
.env-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  width: 100%;
}
.env-scene__eyebrow {
  font-style: normal;
  animation: env-soft-in 0.6s var(--exp-ease) both;
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

/* ---------- Envelope ---------- */
.env-mail {
  --mail-w: clamp(240px, 44vw, 340px);
  --mail-h: clamp(168px, 30vw, 228px);
  --mail-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --mail-ease-out: cubic-bezier(0.33, 1, 0.68, 1);

  width: var(--mail-w);
  height: calc(var(--mail-h) + 80px);
  perspective: 1600px;
  perspective-origin: 50% 30%;
}
.env-mail__hit {
  position: relative;
  width: var(--mail-w);
  height: var(--mail-h);
  margin: 0 auto;
  cursor: pointer;
  outline: none;
  filter: drop-shadow(0 24px 44px color-mix(in srgb, var(--exp-primary) 38%, transparent));
  transition: filter 0.4s ease, transform 0.45s var(--mail-ease);
}
.env-mail:not(.env-mail--animating) .env-mail__hit:hover {
  transform: translateY(-5px) rotate(-0.8deg);
  filter: drop-shadow(0 28px 50px color-mix(in srgb, var(--exp-primary) 46%, transparent));
}
.env-mail__hit[aria-disabled='true'] {
  cursor: default;
  pointer-events: none;
}
.env-mail__hit:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--exp-accent) 70%, #fff);
  outline-offset: 6px;
  border-radius: 14px;
}

.env-mail__back {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(
    168deg,
    color-mix(in srgb, var(--exp-primary) 90%, #fff) 0%,
    var(--exp-primary) 55%,
    color-mix(in srgb, var(--exp-primary) 82%, #000 8%) 100%
  );
  box-shadow: inset 0 -10px 28px color-mix(in srgb, #000 12%, transparent);
}
.env-mail__folds {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
  background:
    linear-gradient(45deg, transparent 49%, color-mix(in srgb, #000 16%, transparent) 50%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, color-mix(in srgb, #000 16%, transparent) 50%, transparent 51%);
}

/* Ranhura — carta contida até a abertura */
.env-mail__slot {
  position: absolute;
  left: 9%;
  right: 9%;
  top: 38%;
  bottom: 8%;
  overflow: hidden;
  z-index: 2;
  border-radius: 0 0 6px 6px;
  transition: overflow 0s linear 0.5s;
}
.env-mail--animating .env-mail__slot {
  overflow: visible;
  z-index: 6;
  transition: overflow 0s;
}
.env-mail__paper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 108%;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(180deg, #fffef9 0%, #f5efe3 100%);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(68%);
  will-change: transform;
}

/* Bolso frontal */
.env-mail__pocket {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 14px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--exp-primary) 70%, #000 10%) 42%,
    color-mix(in srgb, var(--exp-primary) 88%, #000 6%) 100%
  );
  clip-path: polygon(0 48%, 50% 70%, 100% 48%, 100% 100%, 0 100%);
  box-shadow: inset 0 8px 20px color-mix(in srgb, #000 14%, transparent);
  will-change: opacity, transform;
}

/* Aba triangular com frente e verso */
.env-mail__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 54%;
  z-index: 5;
  transform-style: preserve-3d;
  transform-origin: 50% 0;
  will-change: transform;
}
.env-mail__flap-face {
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  backface-visibility: hidden;
}
.env-mail__flap-face--front {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--exp-primary) 65%, #fff) 0%,
    color-mix(in srgb, var(--exp-primary) 82%, #000 8%) 100%
  );
  box-shadow: 0 12px 24px color-mix(in srgb, #000 20%, transparent);
  transform: translateZ(1px);
}
.env-mail__flap-face--back {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--exp-primary) 55%, #000) 0%,
    color-mix(in srgb, var(--exp-primary) 72%, #000 14%) 100%
  );
  transform: rotateX(180deg) translateZ(1px);
}

.env-mail__seal {
  position: absolute;
  top: 47%;
  left: 50%;
  z-index: 6;
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 999px;
  font-family: var(--exp-font-display);
  font-size: 1.35rem;
  color: #fff;
  background: color-mix(in srgb, var(--exp-accent) 90%, #000);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
}

/* Idle: leve balanço da aba */
.env-mail:not(.env-mail--animating) .env-mail__flap {
  animation: env-flap-breathe 3.8s ease-in-out infinite;
}

/* ===== Animação contínua de abertura ===== */
.env-mail--animating .env-mail__flap {
  animation: env-flap-open 1s var(--mail-ease-out) forwards;
}
.env-mail--animating .env-mail__seal {
  animation: env-seal-break 0.55s var(--mail-ease-out) forwards;
}
.env-mail--animating .env-mail__paper {
  animation: env-paper-rise 2.6s var(--mail-ease) 0.55s forwards;
  z-index: 7;
}
.env-mail--animating .env-mail__pocket {
  animation: env-pocket-recede 1s ease 1.9s forwards;
}
.env-mail--animating .env-mail__back,
.env-mail--animating .env-mail__folds {
  animation: env-shell-fade 0.9s ease 2.4s forwards;
}
.env-mail--animating .env-mail__hit {
  animation: env-hit-settle 3.4s var(--mail-ease) forwards;
}

@keyframes env-flap-breathe {
  0%,
  100% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(12deg);
  }
}
@keyframes env-flap-open {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-178deg);
  }
}
@keyframes env-seal-break {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.4);
  }
}
@keyframes env-paper-rise {
  0% {
    transform: translateY(68%);
  }
  35% {
    transform: translateY(18%);
  }
  70% {
    transform: translateY(-42%);
  }
  100% {
    transform: translateY(-108%);
  }
}
@keyframes env-pocket-recede {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(8px);
  }
}
@keyframes env-shell-fade {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes env-hit-settle {
  0%,
  55% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(6px);
    opacity: 0;
  }
}

/* ---------- Carta de leitura ---------- */
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
    opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
    transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}
.letter-reveal-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.97);
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
  .env-mail__flap {
    animation: none !important;
  }
  .env-mail--animating .env-mail__flap,
  .env-mail--animating .env-mail__paper,
  .env-mail--animating .env-mail__seal,
  .env-mail--animating .env-mail__pocket,
  .env-mail--animating .env-mail__back,
  .env-mail--animating .env-mail__folds,
  .env-mail--animating .env-mail__hit,
  .letter-reveal-enter-active,
  .letter__photo {
    animation: none !important;
    transition: none !important;
  }
}
</style>
