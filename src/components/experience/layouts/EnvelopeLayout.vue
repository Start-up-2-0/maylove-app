<template>
  <div class="env" :class="{ 'env--preview': mode === 'preview', [`env--${phase}`]: true }">
    <!-- Cena do envelope: aba → carta subindo → expansão -->
    <div v-if="phase !== 'read'" class="env-scene">
      <p v-if="phase === 'closed' && content.subtitle" class="env-scene__eyebrow exp-eyebrow">
        {{ content.subtitle }}
      </p>

      <div class="env-envelope-wrap">
        <button
          class="env-envelope"
          :class="envelopeClass"
          :disabled="phase !== 'closed'"
          aria-label="Abrir carta"
          @click="open"
        >
          <span class="env-envelope__back" />
          <span class="env-envelope__letter-peek" aria-hidden="true" />
          <span class="env-envelope__body" />
          <span class="env-envelope__flap" />
          <span class="env-envelope__seal">{{ initial }}</span>
        </button>
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

const FLAP_MS = 680
const RISE_MS = 1100
const EXPAND_MS = 780

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
}
.env-scene__eyebrow {
  font-style: normal;
  animation: env-soft-in 0.6s var(--exp-ease) both;
}
.env-envelope-wrap {
  perspective: 1100px;
  width: clamp(220px, 42vw, 320px);
  height: clamp(150px, 28vw, 214px);
}
.env-envelope {
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background: none;
  cursor: pointer;
  transform-style: preserve-3d;
  filter: drop-shadow(0 26px 48px color-mix(in srgb, var(--exp-primary) 40%, transparent));
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.65s ease,
    filter 0.65s ease;
}
.env-envelope:disabled {
  cursor: default;
}
.env--closed .env-envelope:hover:not(:disabled) {
  transform: translateY(-6px) rotate(-1deg);
}
.env-envelope__back {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: color-mix(in srgb, var(--exp-primary) 68%, #000 12%);
  transform: translateZ(-2px);
}
.env-envelope__body {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--exp-primary) 92%, #fff) 0%,
    var(--exp-primary) 100%
  );
  z-index: 2;
}
.env-envelope__body::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background:
    linear-gradient(45deg, transparent 49%, color-mix(in srgb, #000 12%, transparent) 50%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, color-mix(in srgb, #000 12%, transparent) 50%, transparent 51%);
}
.env-envelope__letter-peek {
  position: absolute;
  left: 11%;
  right: 11%;
  bottom: 10%;
  height: 72%;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #fffef9 0%, #f8f4ea 100%);
  box-shadow: 0 -3px 14px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transform: translateY(78%);
  opacity: 0;
  pointer-events: none;
}
.env-envelope__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 58%;
  transform-origin: top center;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  background: color-mix(in srgb, var(--exp-primary) 80%, #000 6%);
  z-index: 4;
  backface-visibility: hidden;
  animation: env-flap-idle 3.4s ease-in-out infinite;
  transition: transform 0.68s cubic-bezier(0.33, 1, 0.68, 1);
}
.env-envelope__seal {
  position: absolute;
  top: 44%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  font-family: var(--exp-font-display);
  font-size: 1.3rem;
  color: #fff;
  background: color-mix(in srgb, var(--exp-accent) 88%, #000);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  transition:
    opacity 0.4s ease,
    transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
}

/* Fases da abertura */
.env-envelope--flap .env-envelope__flap,
.env-envelope--rise .env-envelope__flap,
.env-envelope--expand .env-envelope__flap {
  animation: none;
  transform: rotateX(-168deg);
}
.env-envelope--flap .env-envelope__seal,
.env-envelope--rise .env-envelope__seal,
.env-envelope--expand .env-envelope__seal {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.55);
}
.env-envelope--rise .env-envelope__letter-peek {
  opacity: 1;
  transform: translateY(-22%);
  transition:
    transform 1.05s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.45s ease;
}
.env-envelope--expand .env-envelope__letter-peek {
  opacity: 0.25;
  transform: translateY(-88%) scale(1.03);
  transition:
    transform 0.78s cubic-bezier(0.25, 1, 0.5, 1),
    opacity 0.55s ease;
}
.env-envelope--expand {
  opacity: 0;
  transform: translateY(18px) scale(0.94);
  filter: blur(1px);
}

@keyframes env-flap-idle {
  0%,
  100% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(14deg);
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
  transform: translateY(72px) scale(0.9);
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
  .env-envelope,
  .env-envelope__letter-peek,
  .env-envelope__seal,
  .letter-reveal-enter-active,
  .letter__photo {
    transition: none !important;
    animation: none !important;
  }
}
</style>
