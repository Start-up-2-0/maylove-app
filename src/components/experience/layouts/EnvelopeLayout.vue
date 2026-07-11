<template>
  <div class="env" :class="{ 'env--preview': mode === 'preview', 'env--active': opening }">
    <p
      v-if="content.subtitle"
      class="env-scene__eyebrow exp-eyebrow"
      :class="{ 'env-scene__eyebrow--hide': opening }"
    >
      {{ content.subtitle }}
    </p>

    <div class="env-stage" :class="{ 'env-stage--reading': reading }">
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
            <span class="env-mail__body" />

            <article
              class="letter"
              :class="{
                'letter--pulling': animating,
                'letter--reading': reading,
              }"
              :aria-hidden="!reading"
            >
              <div
                class="letter__surface"
                :class="{
                  'letter__surface--paper': animating,
                  'letter__surface--ready': reading,
                }"
              >
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

            <span class="env-mail__pocket" aria-hidden="true" />
            <span class="env-mail__flap" aria-hidden="true" />
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

const OPEN_DURATION_MS = 3400

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const animating = ref(false)
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
  releaseTimer = window.setTimeout(() => {
    releasing.value = true
  }, 2100)
  shellTimer = window.setTimeout(() => {
    shellHidden.value = true
  }, 2650)
  readingTimer = window.setTimeout(() => {
    animating.value = false
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
  window.clearTimeout(releaseTimer)
  window.clearTimeout(shellTimer)
  window.clearTimeout(readingTimer)
})
</script>

<style scoped>
.env {
  --pack-w: clamp(252px, 46vw, 320px);
  --pack-h: clamp(178px, 32vw, 220px);
  --mail-ease: cubic-bezier(0.33, 1, 0.45, 1);
  --mail-ink: color-mix(in srgb, var(--exp-primary) 82%, #000 10%);
  --mail-flap: color-mix(in srgb, var(--exp-primary) 70%, #000 12%);

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

.env-mail__box {
  position: relative;
  width: var(--pack-w);
  min-height: var(--pack-h);
  overflow: hidden;
  border-radius: 14px;
  isolation: isolate;
}
.env-mail--animating .env-mail__box {
  overflow: hidden;
}
.env-mail--release .env-mail__box,
.env-stage--reading .env-mail__box {
  overflow: visible;
}

/* Camadas do envelope */
.env-mail__body {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 14px;
  background: linear-gradient(
    175deg,
    color-mix(in srgb, var(--exp-primary) 92%, #fff) 0%,
    var(--exp-primary) 48%,
    var(--mail-ink) 100%
  );
  box-shadow: inset 0 -12px 28px color-mix(in srgb, #000 14%, transparent);
}
.env-mail__body::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  opacity: 0.45;
  background:
    linear-gradient(45deg, transparent 49%, color-mix(in srgb, #000 16%, transparent) 50%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, color-mix(in srgb, #000 16%, transparent) 50%, transparent 51%);
}

.env-mail__pocket {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--mail-flap) 88%, #000 6%) 44%,
    var(--mail-ink) 100%
  );
  clip-path: polygon(0 50%, 50% 72%, 100% 50%, 100% 100%, 0 100%);
  pointer-events: none;
}

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
  box-shadow: 0 8px 18px color-mix(in srgb, #000 16%, transparent);
  pointer-events: none;
}
.env-mail:not(.env-mail--animating) .env-mail__flap {
  animation: mail-flap-idle 3.5s ease-in-out infinite;
}

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

/* Carta — entre o corpo e o bolso, sobe e expande no mesmo elemento */
.letter {
  position: absolute;
  left: 11%;
  right: 11%;
  bottom: 0;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  transform: translateY(70%);
  transform-origin: center bottom;
}
.env-stage--reading .env-mail__body,
.env-stage--reading .env-mail__pocket,
.env-stage--reading .env-mail__flap,
.env-stage--reading .env-mail__seal {
  display: none;
}

.letter--pulling {
  opacity: 1;
  clip-path: polygon(12% 44%, 88% 44%, 88% 100%, 12% 100%);
  animation:
    letter-pull 3.4s var(--mail-ease) forwards,
    letter-slot-open 3.4s var(--mail-ease) forwards;
}
.letter--reading {
  position: absolute;
  left: 50%;
  right: auto;
  bottom: auto;
  top: 0;
  z-index: 5;
  width: min(680px, calc(100vw - 48px));
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
  clip-path: none;
}

.env-mail--shell-hidden .env-mail__body,
.env-mail--shell-hidden .env-mail__pocket,
.env-mail--shell-hidden .env-mail__flap,
.env-mail--shell-hidden .env-mail__seal {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.env-stage--reading .env-mail {
  width: min(680px, 100%);
  padding-top: 0;
  filter: none;
  transform: none;
}
.env-stage--reading .env-mail__box {
  width: 100%;
  min-height: auto;
  height: auto;
}
.env-stage--reading .env-mail__body,
.env-stage--reading .env-mail__pocket,
.env-stage--reading .env-mail__flap,
.env-stage--reading .env-mail__seal {
  display: none;
}

.letter__surface--paper {
  min-height: calc(var(--pack-h) * 0.82);
  padding: 0;
  border: none;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #fffef9 0%, #f3ecdf 100%);
  box-shadow: 0 -2px 14px rgba(0, 0, 0, 0.1);
  background-image: none;
}
.letter__surface--paper .letter__head,
.letter__surface--paper .letter__body,
.letter__surface--paper .letter__foot {
  visibility: hidden;
}

/* Sequência de abertura */
.env-mail--animating .env-mail__seal {
  animation: mail-seal-break 0.5s var(--mail-ease) forwards;
}
.env-mail--animating .env-mail__flap {
  animation: mail-flap-open 0.9s var(--mail-ease) 0.2s forwards;
}
.env-mail--animating .env-mail__pocket {
  animation: mail-fade 0.65s ease 2.05s forwards;
}
.env-mail--animating .env-mail__body {
  animation: mail-fade 0.6s ease 2.35s forwards;
}

@keyframes mail-flap-idle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-2.5deg);
  }
}

@keyframes mail-flap-open {
  0% {
    transform: scaleY(1);
    opacity: 1;
  }
  100% {
    transform: scaleY(0);
    opacity: 0;
  }
}

@keyframes mail-seal-break {
  to {
    opacity: 0;
    transform: translate(-50%, -58%) scale(0.3);
  }
}

@keyframes mail-fade {
  to {
    opacity: 0;
  }
}

@keyframes letter-slot-open {
  0%,
  24% {
    clip-path: polygon(12% 44%, 88% 44%, 88% 100%, 12% 100%);
  }
  58% {
    clip-path: polygon(8% 20%, 92% 20%, 92% 100%, 8% 100%);
  }
  78%,
  100% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}

@keyframes letter-pull {
  0% {
    opacity: 0;
    transform: translateY(70%);
  }
  12% {
    opacity: 0.6;
  }
  22% {
    opacity: 1;
    transform: translateY(48%);
  }
  52% {
    transform: translateY(2%);
  }
  68% {
    transform: translateY(-18%);
  }
  82% {
    left: 11%;
    right: 11%;
    transform: translateY(-28%);
  }
  100% {
    left: 50%;
    right: auto;
    width: min(680px, calc(100vw - 48px));
    transform: translateX(-50%) translateY(0);
  }
}

/* Carta de leitura */
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
  .env-mail--animating .env-mail__seal,
  .env-mail--animating .env-mail__pocket,
  .env-mail--animating .env-mail__body,
  .letter--pulling,
  .letter__photo {
    animation: none !important;
    transition: none !important;
  }
}
</style>
