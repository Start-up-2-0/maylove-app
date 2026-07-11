<template>
  <div class="env" :class="{ 'env--preview': mode === 'preview', 'env--active': opening }">
    <p
      v-if="content.subtitle"
      class="env-scene__eyebrow exp-eyebrow"
      :class="{ 'env-scene__eyebrow--hide': opening }"
    >
      {{ content.subtitle }}
    </p>

    <div
      class="env-stage"
      :class="{
        'env-stage--reading': reading,
        'env-stage--animating': animating,
      }"
    >
      <div
        class="env-mail"
        :class="{
          'env-mail--animating': animating,
          'env-mail--release': releasing,
          'env-mail--shell-hidden': shellHidden || reading,
        }"
      >
        <div
          class="env-mail__hit"
          role="button"
          tabindex="0"
          :aria-disabled="opening"
          :aria-hidden="reading"
          aria-label="Abrir carta"
          @click="open"
          @keydown.enter.prevent="open"
          @keydown.space.prevent="open"
        >
          <div class="env-mail__box">
            <!-- z:0 fundo / interior rosa -->
            <span class="env-mail__back" aria-hidden="true" />

            <!-- z:1 carta — atrás do bolso -->
            <div
              class="env-mail__slot"
              :class="{ 'env-mail__slot--free': releasing || unfolding || reading }"
            >
              <article
                class="letter"
                :class="{
                  'letter--rising': animating && !unfolding,
                  'letter--unfolding': unfolding && !reading,
                  'letter--reading': reading,
                }"
                :aria-hidden="!reading"
              >
                <div
                  class="letter__surface"
                  :class="{
                    'letter__surface--peek': animating && !unfolding,
                    'letter__surface--unfolding': unfolding && !reading,
                    'letter__surface--ready': reading,
                  }"
                >
                  <span v-if="animating && !unfolding && !reading" class="letter__peek-mark" aria-hidden="true">
                    {{ initial }}
                  </span>

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

            <!-- z:2 bolso frontal opaco -->
            <span class="env-mail__corner env-mail__corner--l" aria-hidden="true" />
            <span class="env-mail__corner env-mail__corner--r" aria-hidden="true" />
            <span class="env-mail__pocket" aria-hidden="true" />

            <!-- z:3 aba -->
            <span class="env-mail__flap" aria-hidden="true" />

            <!-- z:4 selo -->
            <span class="env-mail__seal">{{ initial }}</span>
          </div>
        </div>
      </div>
    </div>

    <template v-if="sealed">
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

/* Timeline: selo → aba (~1.3s) → carta sobe suave (~2.75s) → pausa → expande */
const RELEASE_MS = 3000
const SHELL_MS = 3600
const UNFOLD_START_MS = 2900
const OPEN_DURATION_MS = 7400

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const animating = ref(false)
const unfolding = ref(false)
const reading = ref(false)
const releasing = ref(false)
const shellHidden = ref(false)
const opening = computed(() => animating.value || reading.value)
const sealed = computed(() => !animating.value && !reading.value)
const activeIndex = ref(0)
const typedText = ref('')
const doneTyping = ref(false)
const readingStarted = ref(false)
let timer: number | undefined
let unfoldTimer: number | undefined
let releaseTimer: number | undefined
let shellTimer: number | undefined
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
  unfoldTimer = window.setTimeout(() => {
    unfolding.value = true
  }, UNFOLD_START_MS)
  releaseTimer = window.setTimeout(() => {
    releasing.value = true
  }, RELEASE_MS)
  shellTimer = window.setTimeout(() => {
    shellHidden.value = true
  }, SHELL_MS)
  readingTimer = window.setTimeout(() => {
    animating.value = false
    unfolding.value = false
    reading.value = true
    onLetterReady()
  }, OPEN_DURATION_MS)
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
  window.setTimeout(startTyping, 650)
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
  window.clearTimeout(unfoldTimer)
  window.clearTimeout(releaseTimer)
  window.clearTimeout(shellTimer)
  window.clearTimeout(readingTimer)
})
</script>

<style scoped>
.env {
  --pack-w: clamp(252px, 46vw, 320px);
  --pack-h: clamp(178px, 32vw, 220px);
  --mail-ease: cubic-bezier(0.22, 0.68, 0.36, 1);
  --mail-ease-flap: cubic-bezier(0.33, 0, 0.15, 1);
  --mail-ease-lift: cubic-bezier(0.22, 0.61, 0.36, 1);
  --mail-ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
  --mail-rise-delay: 0.75s;
  --mail-rise-dur: 2s;
  --mail-flap-delay: 0.2s;
  --mail-flap-dur: 1.1s;
  --mail-ink: color-mix(in srgb, var(--exp-primary) 82%, #000 10%);
  --mail-face: color-mix(in srgb, var(--exp-primary) 78%, #000 8%);
  --mail-flap: color-mix(in srgb, var(--exp-primary) 70%, #000 12%);
  --mail-lining: color-mix(in srgb, var(--exp-accent) 72%, var(--exp-primary) 28%);

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
  min-height: calc(var(--pack-h) + 80px);
  overflow: visible;
  transition: min-height 1s var(--mail-ease-soft);
}
.env-stage--animating {
  min-height: calc(var(--pack-h) + clamp(200px, 38vw, 320px));
}
.env-stage--reading {
  min-height: auto;
}

.env-mail {
  width: var(--pack-w);
  padding-top: 12px;
  filter: drop-shadow(0 22px 40px color-mix(in srgb, var(--exp-primary) 36%, transparent));
  transition: filter 0.35s ease;
}
.env-mail__hit {
  display: block;
  cursor: pointer;
  outline: none;
  border: none;
  background: none;
  padding: 0;
  width: 100%;
}
.env-mail__hit[aria-disabled='true'] {
  cursor: default;
  pointer-events: none;
}
.env-mail__hit:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--exp-accent) 70%, #fff);
  outline-offset: 8px;
  border-radius: 16px;
}
.env-mail:not(.env-mail--animating):hover {
  transform: translateY(-4px);
  filter: drop-shadow(0 26px 46px color-mix(in srgb, var(--exp-primary) 44%, transparent));
  transition: transform 0.25s var(--mail-ease), filter 0.35s ease;
}
.env-mail--animating:hover {
  transform: none;
}

/* ── Envelope box ───────────────────────────────────────── */
.env-mail__box {
  position: relative;
  width: var(--pack-w);
  height: var(--pack-h);
  overflow: hidden;
  border-radius: 14px;
  perspective: 900px;
}
.env-mail--release .env-mail__box,
.env-stage--reading .env-mail__box {
  overflow: visible;
  height: auto;
  min-height: var(--pack-h);
}

/* z:0 — fundo com forro rosa (visível quando aba abre) */
.env-mail__back {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 14px;
  background: linear-gradient(
    180deg,
    var(--mail-lining) 0%,
    color-mix(in srgb, var(--mail-lining) 88%, #000 8%) 42%,
    var(--exp-primary) 100%
  );
  box-shadow: inset 0 -10px 24px color-mix(in srgb, #000 12%, transparent);
}

/* z:1 — trilho da carta */
.env-mail__slot {
  position: absolute;
  left: 15%;
  right: 15%;
  top: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}
.env-mail__slot--free {
  overflow: visible;
  left: 0;
  right: 0;
  z-index: 5;
}

/* z:2 — bolso + quinas 100% opacos (sem raio-x, envelope limpo fechado) */
.env-mail__pocket {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--mail-face) 96%, #fff 4%) 36%,
    var(--mail-ink) 100%
  );
  clip-path: polygon(0 50%, 50% 72%, 100% 50%, 100% 100%, 0 100%);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 14%, transparent);
}
.env-mail__corner {
  position: absolute;
  top: 0;
  z-index: 2;
  width: 50%;
  height: 54%;
  pointer-events: none;
  background: var(--mail-face);
}
.env-mail__corner--l {
  left: 0;
  clip-path: polygon(0 0, 0 50%, 50% 72%, 50% 0);
}
.env-mail__corner--r {
  right: 0;
  clip-path: polygon(100% 0, 100% 50%, 50% 72%, 50% 0);
}

/* z:3 — aba triangular */
.env-mail__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 52%;
  z-index: 3;
  background: var(--mail-flap);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform-origin: 50% 0;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  box-shadow: 0 6px 14px color-mix(in srgb, #000 14%, transparent);
  pointer-events: none;
}
.env-mail__flap::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--mail-lining);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform: rotateX(180deg);
  backface-visibility: hidden;
}
.env-mail:not(.env-mail--animating) .env-mail__flap {
  animation: mail-flap-idle 4.5s ease-in-out infinite;
}

/* z:4 — selo */
.env-mail__seal {
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
  pointer-events: none;
}

/* ── Carta ──────────────────────────────────────────────── */
.letter {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6%;
  opacity: 1;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(0);
  transform-origin: center bottom;
  will-change: transform;
}
.letter--rising {
  animation:
    letter-reveal 0s linear var(--mail-rise-delay) forwards,
    letter-lift var(--mail-rise-dur) var(--mail-ease-lift) var(--mail-rise-delay) forwards;
}
.letter--unfolding {
  opacity: 1;
  visibility: visible;
  position: absolute;
  z-index: 6;
  animation: letter-continue 1.1s var(--mail-ease-soft) forwards;
}
.letter--reading {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
  z-index: 6;
  width: min(680px, calc(100vw - 48px));
  margin: 0 auto;
  opacity: 1;
  pointer-events: auto;
  transform: none;
  animation: none;
}

.letter--rising .letter__head,
.letter--rising .letter__body,
.letter--rising .letter__foot,
.letter--unfolding .letter__body,
.letter--unfolding .letter__foot {
  display: none;
}
.letter--unfolding .letter__head {
  display: block;
  opacity: 0;
  animation: env-soft-in 0.7s var(--exp-ease) 0.45s forwards;
}

/* Cartão fixo durante subida — altura só muda na fase de leitura */
.letter__surface--peek {
  display: grid;
  place-items: center;
  height: calc(var(--pack-h) * 0.52);
  min-height: calc(var(--pack-h) * 0.52);
  padding: 0;
  border-radius: 5px 5px 3px 3px;
  background: #fffefb;
  border: 1px solid color-mix(in srgb, var(--exp-border) 20%, transparent);
  box-shadow: none;
  background-image: none;
  overflow: hidden;
}
.letter__peek-mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  font-family: var(--exp-font-display);
  font-size: 1.1rem;
  color: #fff;
  background: color-mix(in srgb, var(--exp-accent) 88%, var(--exp-primary));
}

.letter__surface--unfolding {
  transform-origin: center top;
  overflow: hidden;
  animation: surface-unfold 2.4s var(--mail-ease-soft) forwards;
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

/* ── Sequência de animação (fiel ao gif) ───────────────── */
.env-mail--animating .env-mail__seal {
  animation: mail-seal-break 0.4s var(--mail-ease) 0.08s forwards;
}
.env-mail--animating .env-mail__flap {
  animation: mail-flap-open var(--mail-flap-dur) var(--mail-ease-flap) var(--mail-flap-delay) forwards;
}
.env-mail--animating .env-mail__pocket,
.env-mail--animating .env-mail__corner,
.env-mail--animating .env-mail__back {
  animation: mail-fade 0.6s ease 3.15s forwards;
}

.env-mail--shell-hidden .env-mail__back,
.env-mail--shell-hidden .env-mail__pocket,
.env-mail--shell-hidden .env-mail__corner,
.env-mail--shell-hidden .env-mail__flap,
.env-mail--shell-hidden .env-mail__seal {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.7s ease, visibility 0.7s ease;
}
.env-mail--shell-hidden {
  filter: none;
}

.env-stage--reading .env-mail__back,
.env-stage--reading .env-mail__pocket,
.env-stage--reading .env-mail__corner,
.env-stage--reading .env-mail__flap,
.env-stage--reading .env-mail__seal {
  display: none;
}
.env-stage--reading .env-mail {
  width: min(680px, 100%);
  padding-top: 0;
  filter: none;
}
.env-stage--reading .env-mail__box {
  width: 100%;
  min-height: auto;
  display: flex;
  justify-content: center;
}

/* Fase 1 — aba desdobra naturalmente (rotateX 180°) */
@keyframes mail-flap-open {
  0% {
    transform: rotateX(0deg);
    opacity: 1;
  }
  30% {
    transform: rotateX(52deg);
    opacity: 1;
  }
  62% {
    transform: rotateX(118deg);
    opacity: 1;
  }
  88% {
    transform: rotateX(168deg);
    opacity: 0.85;
  }
  100% {
    transform: rotateX(180deg);
    opacity: 0;
  }
}

@keyframes mail-seal-break {
  to {
    opacity: 0;
    transform: translate(-50%, -58%) scale(0.88);
  }
}

@keyframes mail-fade {
  to {
    opacity: 0;
  }
}

@keyframes mail-flap-idle {
  0%,
  100% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(-2deg);
  }
}

/* Fase 2 — carta sobe contínua, ease-out, ~60% visível (como no gif) */
@keyframes letter-reveal {
  to {
    visibility: visible;
  }
}

@keyframes letter-lift {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(calc(-1 * var(--pack-h) * 0.33));
  }
}

/* Fase 3 — após pausa, carta continua e centraliza */
@keyframes letter-continue {
  0% {
    left: 15%;
    right: 15%;
    width: auto;
    transform: translateY(calc(-1 * var(--pack-h) * 0.33));
  }
  100% {
    left: 50%;
    right: auto;
    width: min(680px, calc(100vw - 48px));
    transform: translateX(-50%) translateY(calc(var(--pack-h) * -0.5));
  }
}

/* Fase 4 — abrir carta de leitura */
@keyframes surface-unfold {
  0% {
    height: calc(var(--pack-h) * 0.52);
    min-height: calc(var(--pack-h) * 0.52);
    padding: clamp(14px, 2.5vw, 24px);
    background: #fffefb;
    background-image: none;
    box-shadow: 0 10px 28px -16px rgba(0, 0, 0, 0.18);
    transform: rotateX(6deg);
  }
  100% {
    height: auto;
    min-height: calc(var(--pack-h) * 0.88);
    padding: clamp(28px, 5vw, 56px) clamp(22px, 5vw, 52px);
    background: var(--exp-surface, #fff);
    border: 1px solid var(--exp-border);
    box-shadow: 0 28px 64px -32px rgba(0, 0, 0, 0.32);
    background-image: repeating-linear-gradient(
      transparent,
      transparent 33px,
      color-mix(in srgb, var(--exp-primary) 10%, transparent) 34px
    );
    transform: rotateX(0deg);
  }
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

.env-scene__eyebrow {
  font-style: normal;
  animation: env-soft-in 0.6s var(--exp-ease) both;
  transition: opacity 0.35s ease, transform 0.35s ease;
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

@keyframes env-soft-in {
  from {
    opacity: 0;
    transform: translateY(6px);
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
  .env-mail--animating .env-mail__seal,
  .env-mail--animating .env-mail__pocket,
  .env-mail--animating .env-mail__corner,
  .env-mail--animating .env-mail__back,
  .letter--rising,
  .letter--unfolding,
  .letter__surface--unfolding,
  .letter__photo {
    animation: none !important;
    transition: none !important;
  }
}
</style>
