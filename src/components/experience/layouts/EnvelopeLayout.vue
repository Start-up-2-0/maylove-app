<template>
  <div class="env" :class="{ 'env--preview': mode === 'preview', 'env--active': opening }">
    <p
      v-if="content.subtitle"
      class="env-scene__eyebrow exp-eyebrow"
      :class="{ 'env-scene__eyebrow--hide': opening }"
    >
      {{ content.subtitle }}
    </p>

    <div class="env-stage">
      <div
        class="env-pack"
        :class="{
          'env-pack--animating': animating,
          'env-pack--fading': morphing,
        }"
        role="button"
        tabindex="0"
        :aria-disabled="opening"
        :aria-hidden="reading"
        aria-label="Abrir carta"
        @click="open"
        @keydown.enter.prevent="open"
        @keydown.space.prevent="open"
      >
        <div class="env-pack__box">
          <span class="env-pack__body" />
          <span class="env-pack__paper" aria-hidden="true" />
          <span class="env-pack__pocket" aria-hidden="true" />
          <span class="env-pack__flap" aria-hidden="true" />
          <span class="env-pack__seal">{{ initial }}</span>
        </div>
      </div>

      <article
        class="letter"
        :class="{
          'letter--morph': morphing,
          'letter--open': reading,
        }"
        :aria-hidden="!morphing && !reading"
      >
        <div class="letter__surface" :class="{ 'letter__surface--ready': reading }">
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

        <footer v-if="showLetterFooter" class="letter__foot">
          <RichText
            v-if="content.includeClosingMessage && content.closingMessage"
            :text="content.closingMessage"
            class="letter__closing"
          />
          <p v-if="signatureLabel" class="letter__sign">{{ signatureLabel }}</p>
          <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="content.title" />
        </footer>
        </div>
      </article>
    </div>

    <template v-if="!opening">
      <p class="env-scene__hint">Para {{ content.honoreeName || 'você' }}</p>
      <button class="env-open-btn" type="button" @click="open">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 7l8 6 8-6M4 7h16v11H4z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Abrir carta
      </button>
    </template>
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

const MORPH_START_MS = 1900
const READING_START_MS = 2900

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const animating = ref(false)
const morphing = ref(false)
const reading = ref(false)
const opening = computed(() => animating.value || morphing.value)
const activeIndex = ref(0)
const typedText = ref('')
const doneTyping = ref(false)
const readingStarted = ref(false)
let timer: number | undefined
let morphTimer: number | undefined
let readingTimer: number | undefined

const initial = computed(() => (props.content.senderName || props.content.honoreeName || 'M').charAt(0).toUpperCase())
const signatureLabel = computed(() => props.content.signature || props.content.senderName || '')
const showLetterFooter = computed(
  () =>
    doneTyping.value &&
    ((props.content.includeClosingMessage && props.content.closingMessage) ||
      Boolean(signatureLabel.value) ||
      (props.mode === 'full' && props.shareUrl)),
)
const introHtml = computed(() =>
  props.content.includeOpeningMessage && containsHtml(props.content.message)
    ? props.content.message
    : null,
)

const beats = computed<LetterBeat[]>(() => {
  const timeline = props.content.timeline
  if (timeline.length) {
    const items: LetterBeat[] = []
    const intro = introHtml.value
      ? ''
      : props.content.includeOpeningMessage
        ? plainTimelineText(props.content.message)
        : ''
    if (intro) items.push({ text: intro })
    for (const item of timeline) {
      items.push(beatFromTimelineItem(item))
    }
    return items.filter((beat) => beat.text || beat.photo)
  }

  const base = props.content.includeOpeningMessage
    ? (props.content.message || '')
        .split('\n')
        .map((line) => plainTimelineText(line))
        .filter(Boolean)
    : []
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
  if (opening.value || reading.value) return
  if (audio?.hasAudio) audio.play()

  if (reduced) {
    reading.value = true
    readingStarted.value = true
    beginReading()
    return
  }

  animating.value = true
  morphTimer = window.setTimeout(() => {
    morphing.value = true
  }, MORPH_START_MS)
  readingTimer = window.setTimeout(() => {
    animating.value = false
    morphing.value = false
    reading.value = true
    onLetterReady()
  }, READING_START_MS)
}

function onLetterReady() {
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
  window.clearTimeout(morphTimer)
  window.clearTimeout(readingTimer)
})
</script>

<style scoped>
.env {
  --pack-w: clamp(252px, 46vw, 320px);
  --pack-h: clamp(178px, 32vw, 220px);

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-height: var(--exp-stage, 100svh);
  padding: clamp(24px, 6vw, 64px) clamp(16px, 5vw, 40px);
  text-align: center;
}
.env--preview {
  min-height: var(--exp-stage, 620px);
}

.env-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: calc(var(--pack-h) + 48px);
}

.env-scene__eyebrow {
  font-style: normal;
  animation: env-soft-in 0.6s var(--exp-ease) both;
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.env-scene__eyebrow--hide {
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
}
.env-scene__hint {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--exp-muted);
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
}
.env-open-btn:hover {
  transform: translateY(-2px);
}

/* ===== Envelope (2D coeso) ===== */
.env-pack {
  --pack-ease: cubic-bezier(0.25, 0.9, 0.35, 1);
  --pack-ink: color-mix(in srgb, var(--exp-primary) 82%, #000 10%);
  --pack-flap: color-mix(in srgb, var(--exp-primary) 70%, #000 12%);

  grid-area: 1 / 1;
  width: var(--pack-w);
  padding-top: 12px;
  cursor: pointer;
  outline: none;
  filter: drop-shadow(0 22px 40px color-mix(in srgb, var(--exp-primary) 36%, transparent));
  transition:
    filter 0.35s ease,
    transform 0.4s var(--pack-ease),
    opacity 0.65s ease;
}
.env-pack--fading {
  opacity: 0;
  pointer-events: none;
}
.env-pack:not(.env-pack--animating):hover {
  transform: translateY(-4px);
  filter: drop-shadow(0 26px 46px color-mix(in srgb, var(--exp-primary) 44%, transparent));
}
.env-pack[aria-disabled='true'] {
  cursor: default;
  pointer-events: none;
}
.env-pack:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--exp-accent) 70%, #fff);
  outline-offset: 8px;
  border-radius: 16px;
}

.env-pack__box {
  position: relative;
  width: var(--pack-w);
  height: var(--pack-h);
  overflow: hidden;
  border-radius: 14px;
}

/* Corpo — retângulo único que ancora todo o envelope */
.env-pack__body {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(
    175deg,
    color-mix(in srgb, var(--exp-primary) 92%, #fff) 0%,
    var(--exp-primary) 48%,
    var(--pack-ink) 100%
  );
  box-shadow: inset 0 -12px 28px color-mix(in srgb, #000 14%, transparent);
}
.env-pack__body::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  opacity: 0.45;
  background:
    linear-gradient(45deg, transparent 49%, color-mix(in srgb, #000 16%, transparent) 50%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, color-mix(in srgb, #000 16%, transparent) 50%, transparent 51%);
}

/* Carta — escondida no bolso, sobe depois da aba */
.env-pack__paper {
  position: absolute;
  left: 11%;
  right: 11%;
  bottom: 0;
  height: 88%;
  z-index: 1;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(180deg, #fffef9 0%, #f3ecdf 100%);
  box-shadow: 0 -3px 14px rgba(0, 0, 0, 0.1);
  transform: translateY(72%);
}

/* Bolso frontal — cobre a parte de baixo da carta */
.env-pack__pocket {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--pack-flap) 88%, #000 6%) 44%,
    var(--pack-ink) 100%
  );
  clip-path: polygon(0 50%, 50% 72%, 100% 50%, 100% 100%, 0 100%);
}

/* Aba — triângulo colado no topo do corpo */
.env-pack__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 52%;
  z-index: 3;
  background: var(--pack-flap);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: 50% 0;
  box-shadow: 0 8px 18px color-mix(in srgb, #000 16%, transparent);
}

.env-pack__seal {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 999px;
  font-family: var(--exp-font-display);
  font-size: 1.35rem;
  color: #fff;
  background: color-mix(in srgb, var(--exp-accent) 92%, #000);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
  transform: translate(-50%, -50%);
}

/* Idle: leve respiração da aba */
.env-pack:not(.env-pack--animating) .env-pack__flap {
  animation: pack-flap-idle 3.5s ease-in-out infinite;
}

/* ===== Sequência de abertura (2D, sem desmontar peças) ===== */
.env-pack--animating .env-pack__box {
  overflow: visible;
}
.env-pack--animating .env-pack__seal {
  animation: pack-seal 0.45s var(--pack-ease) forwards;
}
.env-pack--animating .env-pack__flap {
  animation: pack-flap-open 0.95s var(--pack-ease) 0.15s forwards;
}
.env-pack--animating .env-pack__paper {
  z-index: 5;
  animation: pack-paper-rise 2.2s var(--pack-ease) 0.65s forwards;
}
.env-pack--animating .env-pack__pocket {
  animation: pack-pocket-hide 0.8s ease 1.85s forwards;
}
.env-pack--animating .env-pack__body {
  animation: pack-body-hide 0.75s ease 2.15s forwards;
}

@keyframes pack-flap-idle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-2.5deg);
  }
}

/* Aba recolhe para cima (2D — permanece colada ao envelope) */
@keyframes pack-flap-open {
  0% {
    transform: scaleY(1);
    opacity: 1;
  }
  70% {
    transform: scaleY(0.08);
    opacity: 0.6;
  }
  100% {
    transform: scaleY(0);
    opacity: 0;
  }
}

@keyframes pack-seal {
  to {
    opacity: 0;
    transform: translate(-50%, -58%) scale(0.35);
  }
}

@keyframes pack-paper-rise {
  0% {
    transform: translateY(72%);
  }
  40% {
    transform: translateY(28%);
  }
  75% {
    transform: translateY(-18%);
  }
  100% {
    transform: translateY(-52%);
  }
}

@keyframes pack-pocket-hide {
  to {
    opacity: 0;
  }
}

@keyframes pack-body-hide {
  to {
    opacity: 0;
  }
}

/* ---------- Carta de leitura ---------- */
.letter {
  grid-area: 1 / 1;
  width: min(680px, 100%);
  opacity: 0;
  pointer-events: none;
  transform: translateY(12%) scale(0.34);
  transform-origin: center 72%;
  will-change: transform, opacity, width;
}
.letter--morph {
  opacity: 1;
  width: calc(var(--pack-w) * 0.78);
  transform: translateY(-8%) scale(0.42);
  transition: none;
}
.letter--open {
  opacity: 1;
  pointer-events: auto;
  width: min(680px, 100%);
  transform: none;
  transition:
    width 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.45s ease;
}
.letter--morph .letter__head,
.letter--morph .letter__body,
.letter--morph .letter__foot {
  visibility: hidden;
}
.letter__surface {
  width: 100%;
  min-height: calc(var(--pack-h) * 0.88);
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
.letter__surface--ready .letter__head,
.letter__surface--ready .letter__body,
.letter__surface--ready .letter__foot {
  animation: env-soft-in 0.55s var(--exp-ease) both;
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
  .env-pack__flap {
    animation: none !important;
  }
  .env-pack--animating .env-pack__flap,
  .env-pack--animating .env-pack__paper,
  .env-pack--animating .env-pack__seal,
  .env-pack--animating .env-pack__pocket,
  .env-pack--animating .env-pack__body,
  .env-pack--fading,
  .letter--morph,
  .letter--open,
  .letter__photo {
    animation: none !important;
    transition: none !important;
  }
}
</style>
