<template>
  <div class="env" :class="{ 'env--preview': mode === 'preview' }">
    <!-- Estágio inicial: envelope fechado -->
    <transition name="env-fade">
      <div v-if="!opened" class="env-stage">
        <p v-if="content.subtitle" class="env-stage__eyebrow exp-eyebrow">{{ content.subtitle }}</p>
        <button class="env-envelope" :class="{ 'is-hover': true }" aria-label="Abrir carta" @click="open">
          <span class="env-envelope__body" />
          <span class="env-envelope__flap" />
          <span class="env-envelope__seal">{{ initial }}</span>
        </button>
        <p class="env-stage__hint">Para {{ content.honoreeName || 'você' }}</p>
        <button class="env-open-btn" @click="open">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 7l8 6 8-6M4 7h16v11H4z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Abrir carta
        </button>
      </div>
    </transition>

    <!-- Carta revelada -->
    <transition name="env-letter">
      <article v-if="opened" class="letter">
        <header class="letter__head">
          <p class="letter__place">Uma carta para você</p>
          <h1 class="letter__title">{{ content.title }}</h1>
        </header>

        <div class="letter__body">
          <template v-if="messageIsHtml">
            <RichText :text="content.message" class="letter__para" />
            <p v-for="(para, i) in extraParagraphs" :key="`m${i}`" class="letter__para">{{ para }}</p>
            <figure v-for="photo in content.photos" :key="photo.id" class="letter__photo">
              <img :src="photo.url" :alt="content.title" loading="lazy" />
            </figure>
          </template>
          <template v-for="(para, i) in paragraphs" v-else :key="i">
            <p v-if="i <= activeIndex" class="letter__para">
              {{ i < activeIndex ? para : typedText }}<span v-if="i === activeIndex && !doneTyping" class="letter__caret" />
            </p>
            <figure v-if="photoFor(i) && i < activeIndex" class="letter__photo">
              <img :src="photoFor(i)!.url" :alt="`Recordação ${i + 1}`" loading="lazy" />
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
import type { ExperienceMediaItem, LayoutComponentProps } from '@/templates/types'
import { useExperienceAudio } from '@/composables/experienceAudio'
import { containsHtml } from '@/utils/richText'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const messageIsHtml = computed(() => containsHtml(props.content.message))
const extraParagraphs = computed(() => props.content.messages.filter(Boolean))

const opened = ref(false)
const activeIndex = ref(0)
const typedText = ref('')
const doneTyping = ref(false)
let timer: number | undefined

const initial = computed(() => (props.content.senderName || props.content.honoreeName || 'M').charAt(0).toUpperCase())

const paragraphs = computed<string[]>(() => {
  const base = (props.content.message || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const extra = props.content.messages.filter(Boolean)
  const all = [...base, ...extra]
  return all.length ? all : ['Com carinho, para você.']
})

function photoFor(index: number): ExperienceMediaItem | null {
  return props.content.photos[index] ?? null
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function open() {
  if (opened.value) return
  opened.value = true
  if (audio?.hasAudio) audio.play()
  // Conteúdo formatado (HTML) é exibido de uma vez, sem digitação.
  if (reduced || messageIsHtml.value) {
    activeIndex.value = paragraphs.value.length
    doneTyping.value = true
    return
  }
  window.setTimeout(startTyping, 650)
}

function startTyping() {
  const para = paragraphs.value[activeIndex.value] ?? ''
  const speed = Math.max(12, 24 * props.theme.speedMultiplier)
  let pos = 0
  const step = () => {
    pos += 1
    typedText.value = para.slice(0, pos)
    if (pos < para.length) {
      timer = window.setTimeout(step, speed)
    } else {
      // pausa antes do próximo parágrafo
      timer = window.setTimeout(nextParagraph, 520)
    }
  }
  step()
}

function nextParagraph() {
  if (activeIndex.value >= paragraphs.value.length - 1) {
    activeIndex.value = paragraphs.value.length
    doneTyping.value = true
    return
  }
  activeIndex.value += 1
  typedText.value = ''
  startTyping()
}

onBeforeUnmount(() => window.clearTimeout(timer))
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

/* ---------- Estágio do envelope ---------- */
.env-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}
.env-stage__eyebrow {
  font-style: normal;
}
.env-envelope {
  position: relative;
  width: clamp(220px, 42vw, 320px);
  height: clamp(150px, 28vw, 214px);
  border: none;
  background: none;
  cursor: pointer;
  filter: drop-shadow(0 26px 48px color-mix(in srgb, var(--exp-primary) 40%, transparent));
  transition: transform 0.4s var(--exp-ease);
}
.env-envelope:hover {
  transform: translateY(-6px) rotate(-1deg);
}
.env-envelope__body {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--exp-primary) 92%, #fff) 0%, var(--exp-primary) 100%);
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
.env-envelope__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 58%;
  transform-origin: top center;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  background: color-mix(in srgb, var(--exp-primary) 80%, #000 6%);
  z-index: 3;
  animation: env-flap-idle 3.4s ease-in-out infinite;
}
.env-envelope__seal {
  position: absolute;
  top: 44%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
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
}
@keyframes env-flap-idle {
  0%, 100% { transform: rotateX(0deg); }
  50% { transform: rotateX(14deg); }
}
.env-stage__hint {
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.letter__photo {
  margin: 8px auto 22px;
  width: min(320px, 80%);
  padding: 10px 10px 30px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 14px 30px -14px rgba(0, 0, 0, 0.5);
  transform: rotate(-2deg);
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
  animation: env-fade-in 0.8s var(--exp-ease);
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

.env-fade-enter-active,
.env-fade-leave-active {
  transition: opacity 0.5s var(--exp-ease);
}
.env-fade-enter-from,
.env-fade-leave-to {
  opacity: 0;
}
.env-letter-enter-active {
  transition: opacity 0.7s var(--exp-ease), transform 0.7s var(--exp-ease);
}
.env-letter-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}
@keyframes env-fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .env-envelope__flap { animation: none; }
}
</style>
