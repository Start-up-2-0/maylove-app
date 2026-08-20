<template>
  <div class="env-story-theme">
    <Transition name="env-story-overlay-fade" @after-leave="onOverlayLeft">
      <div
        v-if="showOverlay"
        class="env-story-overlay"
        :class="{ 'env-story-overlay--opening': opening, 'env-story-overlay--embedded': embedded, 'env-story-overlay--preview': isPreview }"
        role="dialog"
        aria-label="Abrir envelope"
      >
        <div class="env-story-overlay__glow" aria-hidden="true" />

        <div class="env-story-overlay__stage">
          <div class="env-story-envelope" :class="{ 'env-story-envelope--open': opening }">
            <div class="env-story-envelope__shadow" aria-hidden="true" />
            <div class="env-story-envelope__body">
              <span class="env-story-envelope__back env-story-envelope__back--l" aria-hidden="true" />
              <span class="env-story-envelope__back env-story-envelope__back--r" aria-hidden="true" />
              <div class="env-story-envelope__letter" aria-hidden="true" />
              <span class="env-story-envelope__front" aria-hidden="true" />
              <div class="env-story-envelope__flap" aria-hidden="true">
                <span class="env-story-envelope__flap-text">com amor</span>
              </div>
              <button
                v-if="!opening"
                type="button"
                class="env-story-envelope__seal"
                aria-label="Abrir envelope"
                @click="startOpen"
              >
                <span aria-hidden="true">♥</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="!opening" class="env-story-overlay__copy">
          <p class="env-story-overlay__hint">{{ envelopeHint }}</p>
          <button type="button" class="env-story-overlay__skip" @click="skipAnimation">
            Pular animação ›
          </button>
        </div>
      </div>
    </Transition>

    <div class="env-story-theme__content" :class="{ 'env-story-theme__content--ready': contentReady }">
      <section class="env-story-theme__hero" :style="heroStyle">
        <div class="env-story-theme__hero-shade" />
        <div class="env-story-theme__hero-body">
          <p class="env-story-theme__since">Juntos há</p>
          <h1 class="env-story-theme__couple">{{ coupleLabel }}</h1>
        </div>
      </section>

      <section v-if="showCounter" class="env-story-theme__countdown-wrap">
        <div class="env-story-theme__particles" aria-hidden="true">
          <span
            v-for="particle in particles"
            :key="particle.id"
            class="env-story-theme__particle"
            :style="particle.style"
          >
            {{ particle.icon }}
          </span>
        </div>
        <RomanceCountdownGrid :content="content" root-class="env-story-theme__countdown" />
      </section>

      <section v-if="messageText" class="env-story-theme__card">
        <p class="env-story-theme__eyebrow">Mensagem especial</p>
        <h2 class="env-story-theme__card-title">{{ content.title || 'O início do nosso para sempre' }}</h2>
        <p class="env-story-theme__card-text">
          {{ messageExpanded ? messageText : messagePreview }}
        </p>
        <button
          v-if="messageText.length > 120"
          type="button"
          class="env-story-theme__more"
          @click="messageExpanded = !messageExpanded"
        >
          {{ messageExpanded ? 'Ver menos' : 'Ler mais ›' }}
        </button>
      </section>

      <section v-if="content.music.url" class="env-story-theme__card">
        <header class="env-story-theme__card-head">
          <span class="env-story-theme__card-icon" aria-hidden="true">🎵</span>
          <p class="env-story-theme__eyebrow env-story-theme__eyebrow--inline">Nossa música</p>
        </header>
        <strong class="env-story-theme__track">{{ musicTitle }}</strong>
        <div v-if="content.music.url" class="env-story-theme__player">
          <span class="env-story-theme__play" aria-hidden="true">▶</span>
          <div class="env-story-theme__progress">
            <span class="env-story-theme__time">0:00</span>
            <div class="env-story-theme__progress-bar"><span /></div>
            <span class="env-story-theme__time">0:00</span>
          </div>
        </div>
      </section>

      <section v-if="content.photos.length" class="env-story-theme__card">
        <header class="env-story-theme__card-head">
          <span class="env-story-theme__card-icon" aria-hidden="true">📷</span>
          <p class="env-story-theme__eyebrow env-story-theme__eyebrow--inline">Nossas memórias</p>
        </header>
        <div class="env-story-theme__gallery">
          <img
            v-for="(photo, index) in content.photos"
            :key="photo.id"
            :src="photo.thumbnail || photo.url"
            :alt="`Recordação ${index + 1} de ${content.photos.length}`"
            loading="lazy"
          />
        </div>
      </section>

      <section class="env-story-theme__card">
        <header class="env-story-theme__card-head">
          <span class="env-story-theme__card-icon" aria-hidden="true">📖</span>
          <p class="env-story-theme__eyebrow env-story-theme__eyebrow--inline">Nossa história</p>
        </header>
        <ol v-if="timelineItems.length" class="env-story-theme__timeline">
          <li v-for="(item, index) in timelineItems" :key="index">
            <span class="env-story-theme__timeline-icon">{{ iconFor(item) }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p v-if="item.date" class="env-story-theme__timeline-date">{{ formatDate(item.date) }}</p>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
          </li>
        </ol>
        <p v-else class="env-story-theme__timeline-empty">Momento especial de vocês aparecerá aqui.</p>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import RomanceCountdownGrid from '@/components/experience/romance-themes/RomanceCountdownGrid.vue'
import { useExperienceAudio } from '@/composables/experienceAudio'
import type {
  ExperienceContent,
  ExperienceTimelineItem,
  LayoutConfig,
  ResolvedTheme,
  TemplateDefinition,
} from '@/templates/types'
import { getEmotionDisplay } from '@/utils/timelineEmotions'
import { plainTimelineText } from '@/utils/timeline'

const props = defineProps<{
  definition: TemplateDefinition
  content: ExperienceContent
  theme: ResolvedTheme
  mode?: 'full' | 'preview'
  shareUrl?: string
  config?: LayoutConfig
}>()

const audio = useExperienceAudio()
const showOverlay = ref(true)
const opening = ref(false)
const contentReady = ref(false)
const messageExpanded = ref(false)

const embedded = computed(() => Boolean(props.config?.contained))
const isPreview = computed(() => props.mode === 'preview' || embedded.value)

const coupleLabel = computed(() => {
  if (props.content.senderName && props.content.honoreeName) {
    return `${props.content.senderName} & ${props.content.honoreeName}`
  }
  return props.content.honoreeName || props.content.title || 'Vocês'
})

const envelopeHint = computed(
  () => props.content.subtitle?.trim() || 'Uma mensagem especial para você...',
)

const heroStyle = computed(() => {
  const photo = props.content.photos[0]?.url || props.content.photos[0]?.thumbnail
  if (!photo) {
    return {
      background: 'linear-gradient(180deg, #fbcfe8 0%, #fff1f2 55%, #fff8ef 100%)',
    }
  }
  return { backgroundImage: `url(${photo})` }
})

const showCounter = computed(
  () => Boolean(props.content.specialDate && props.content.specialDateConfig?.enabled !== false),
)

const messageText = computed(() => plainTimelineText(props.content.message))
const messagePreview = computed(() => {
  const text = messageText.value
  if (!text) return ''
  return text.length > 120 ? `${text.slice(0, 117)}...` : text
})

const musicTitle = computed(() =>
  props.content.music.url ? props.content.music.title || 'Nossa trilha' : 'Nenhuma música selecionada',
)

const timelineItems = computed(() => props.content.timeline.filter((item) => item.title?.trim()))

const particles = [
  { id: 1, icon: '♥', style: { left: '8%', top: '12%', animationDelay: '0s' } },
  { id: 2, icon: '✉', style: { left: '82%', top: '18%', animationDelay: '0.8s' } },
  { id: 3, icon: '♥', style: { left: '18%', top: '72%', animationDelay: '1.4s' } },
  { id: 4, icon: '✉', style: { left: '76%', top: '68%', animationDelay: '0.3s' } },
  { id: 5, icon: '♥', style: { left: '48%', top: '8%', animationDelay: '1.1s' } },
  { id: 6, icon: '✉', style: { left: '52%', top: '78%', animationDelay: '1.7s' } },
]

function iconFor(item: ExperienceTimelineItem) {
  return getEmotionDisplay(item.emotion)?.icon ?? '♥'
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}

function startOpen() {
  if (opening.value) return
  opening.value = true
  audio?.play?.()
  window.setTimeout(() => {
    contentReady.value = true
    showOverlay.value = false
  }, 1400)
}

function skipAnimation() {
  opening.value = true
  contentReady.value = true
  showOverlay.value = false
}

function onOverlayLeft() {
  contentReady.value = true
}

onMounted(() => {
  if (isPreview.value) {
    window.setTimeout(() => skipAnimation(), 180)
  }
})
</script>

<style scoped>
.env-story-theme {
  position: relative;
  min-height: 100%;
  background: #fff8ef;
  color: #5c3d2e;
  font-family: system-ui, -apple-system, sans-serif;
}

/* ── Overlay: envelope animado ───────────────────────────── */
.env-story-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px;
  background:
    radial-gradient(circle at 30% 20%, rgb(251 207 232 / 55%), transparent 45%),
    radial-gradient(circle at 70% 80%, rgb(249 168 212 / 35%), transparent 50%),
    linear-gradient(180deg, #fce7f3 0%, #fdf2f8 50%, #fff1f2 100%);
  overflow: hidden;
}
.env-story-overlay--embedded {
  position: absolute;
}
.env-story-overlay__glow {
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background-image: radial-gradient(circle, rgb(219 39 119 / 12%) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}
.env-story-overlay__stage {
  position: relative;
  z-index: 2;
  perspective: 800px;
}
.env-story-envelope {
  position: relative;
  width: min(240px, 68vw);
  height: min(170px, 48vw);
}
.env-story-envelope__shadow {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: -10px;
  height: 18px;
  border-radius: 50%;
  background: rgb(190 24 93 / 18%);
  filter: blur(8px);
  transition: opacity 0.5s ease;
}
.env-story-envelope--open .env-story-envelope__shadow {
  opacity: 0.35;
}
.env-story-envelope__body {
  position: relative;
  width: 100%;
  height: 100%;
}
.env-story-envelope__back {
  position: absolute;
  bottom: 0;
  width: 50%;
  height: 72%;
  background: linear-gradient(145deg, rgb(251 207 232 / 90%), rgb(244 114 182 / 75%));
  border: 1px solid rgb(255 255 255 / 55%);
  box-shadow: inset 0 0 20px rgb(255 255 255 / 25%);
}
.env-story-envelope__back--l {
  left: 0;
  clip-path: polygon(0 0, 100% 30%, 100% 100%, 0 100%);
  border-radius: 6px 0 8px 8px;
}
.env-story-envelope__back--r {
  right: 0;
  clip-path: polygon(0 30%, 100% 0, 100% 100%, 0 100%);
  border-radius: 0 6px 8px 8px;
}
.env-story-envelope__letter {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 18%;
  height: 58%;
  border-radius: 8px 8px 4px 4px;
  background: linear-gradient(180deg, #fff 0%, #fff8ef 100%);
  box-shadow: 0 -4px 16px rgb(190 24 93 / 12%);
  transform: translateY(0);
  transition:
    transform 1s cubic-bezier(0.45, 0.05, 0.22, 1) 0.35s,
    opacity 0.4s ease 0.9s;
  z-index: 1;
}
.env-story-envelope--open .env-story-envelope__letter {
  transform: translateY(-72%);
}
.env-story-envelope__front {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 62%;
  border-radius: 8px;
  background: linear-gradient(180deg, rgb(255 255 255 / 55%) 0%, rgb(251 207 232 / 82%) 100%);
  border: 1px solid rgb(255 255 255 / 65%);
  backdrop-filter: blur(6px);
  z-index: 2;
  transition: opacity 0.5s ease 0.55s;
}
.env-story-envelope--open .env-story-envelope__front {
  opacity: 0;
}
.env-story-envelope__flap {
  position: absolute;
  left: 0;
  right: 0;
  top: 18%;
  height: 52%;
  transform-origin: 50% 0%;
  transform-style: preserve-3d;
  transition: transform 0.85s cubic-bezier(0.45, 0.05, 0.22, 1);
  z-index: 4;
}
.env-story-envelope__flap::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(253 242 248 / 95%) 0%, rgb(251 207 232 / 88%) 100%);
  border: 1px solid rgb(255 255 255 / 70%);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
  border-radius: 4px 4px 0 0;
  box-shadow: 0 6px 18px rgb(190 24 93 / 12%);
}
.env-story-envelope__flap-text {
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -50%);
  font-size: 0.72rem;
  font-style: italic;
  color: rgb(190 24 93 / 75%);
  z-index: 1;
  white-space: nowrap;
}
.env-story-envelope--open .env-story-envelope__flap {
  transform: rotateX(-168deg);
}
.env-story-envelope__seal {
  position: absolute;
  left: 50%;
  top: 52%;
  z-index: 5;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  border: none;
  border-radius: 999px;
  background: linear-gradient(145deg, #db2777, #be185d);
  color: #1a0508;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  box-shadow:
    0 4px 14px rgb(190 24 93 / 35%),
    inset 0 1px 0 rgb(255 255 255 / 25%);
  transition:
    transform 0.2s ease,
    opacity 0.35s ease;
}
.env-story-envelope__seal:hover {
  transform: translate(-50%, -50%) scale(1.06);
}
.env-story-envelope--open .env-story-envelope__seal {
  opacity: 0;
  pointer-events: none;
}
.env-story-overlay__copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  transition: opacity 0.35s ease;
}
.env-story-overlay--opening .env-story-overlay__copy {
  opacity: 0;
  pointer-events: none;
}
.env-story-overlay__hint {
  margin: 0;
  font-size: 0.95rem;
  font-style: italic;
  color: rgb(190 24 93 / 72%);
  font-family: Georgia, 'Times New Roman', serif;
}
.env-story-overlay__skip {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 72%);
  color: rgb(190 24 93 / 85%);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 16px rgb(190 24 93 / 10%);
}
.env-story-overlay-fade-leave-active {
  transition: opacity 0.45s ease 1s;
}
.env-story-overlay--preview.env-story-overlay-fade-leave-active {
  transition: opacity 0.22s ease;
}
.env-story-overlay-fade-leave-to {
  opacity: 0;
}

/* ── Conteúdo ────────────────────────────────────────────── */
.env-story-theme__content {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.45, 0.05, 0.22, 1);
}
.env-story-theme__content--ready {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .env-story-overlay,
  .env-story-envelope *,
  .env-story-theme__content,
  .env-story-theme__particle { animation: none !important; transition-duration: 0.01ms !important; transition-delay: 0ms !important; }
}
.env-story-theme__hero {
  position: relative;
  min-height: min(52vw, 220px);
  background-size: cover;
  background-position: center;
}
.env-story-theme__hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 8%) 0%,
    rgb(255 248 239 / 88%) 72%,
    #fff8ef 100%
  );
}
.env-story-theme__hero-body {
  position: relative;
  z-index: 1;
  padding: 28px 20px 22px;
  text-align: center;
}
.env-story-theme__since {
  margin: 0 0 6px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #be123c;
}
.env-story-theme__couple {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 700;
  font-style: italic;
  color: #7c2d12;
  line-height: 1.15;
}
.env-story-theme__countdown-wrap {
  position: relative;
  margin: -8px 16px 0;
  padding: 14px 12px;
  border-radius: 16px;
  background: rgb(255 255 255 / 72%);
  border: 1px solid rgb(219 39 119 / 12%);
  box-shadow: 0 10px 28px -18px rgb(190 24 93 / 25%);
}
.env-story-theme__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}
.env-story-theme__particle {
  position: absolute;
  font-size: 0.75rem;
  opacity: 0.55;
  animation: env-story-float 4.5s ease-in-out infinite;
}
@keyframes env-story-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.45;
  }
  50% {
    transform: translateY(-8px) scale(1.08);
    opacity: 0.75;
  }
}
.env-story-theme :deep(.env-story-theme__countdown .rom-countdown__cell) {
  background: #fff;
  border-color: rgb(219 39 119 / 10%);
}
.env-story-theme :deep(.env-story-theme__countdown .rom-countdown__value) {
  color: #be123c;
}
.env-story-theme :deep(.env-story-theme__countdown .rom-countdown__label) {
  color: rgb(92 61 46 / 55%);
}
.env-story-theme__card {
  margin: 16px 16px 0;
  padding: 16px;
  border-radius: 16px;
  background: rgb(255 255 255 / 78%);
  border: 1px solid rgb(219 39 119 / 10%);
}
.env-story-theme__card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.env-story-theme__card-icon {
  font-size: 1rem;
}
.env-story-theme__eyebrow {
  margin: 0 0 8px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #db2777;
}
.env-story-theme__eyebrow--inline {
  margin: 0;
}
.env-story-theme__card-title {
  margin: 0 0 10px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  line-height: 1.25;
  color: #431407;
}
.env-story-theme__card-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: rgb(92 61 46 / 82%);
}
.env-story-theme__more {
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  color: #db2777;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}
.env-story-theme__track {
  display: block;
  font-size: 0.9rem;
  color: #431407;
}
.env-story-theme__music-empty {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: rgb(92 61 46 / 55%);
}
.env-story-theme__player {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.env-story-theme__play {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #fce7f3;
  color: #be123c;
  font-size: 0.72rem;
}
.env-story-theme__progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.68rem;
  color: rgb(92 61 46 / 55%);
}
.env-story-theme__progress-bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: rgb(219 39 119 / 12%);
  overflow: hidden;
}
.env-story-theme__progress-bar span {
  display: block;
  width: 35%;
  height: 100%;
  background: #db2777;
  border-radius: inherit;
}
.env-story-theme__gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.env-story-theme__gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
}
.env-story-theme__timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.env-story-theme__timeline li {
  display: flex;
  gap: 10px;
}
.env-story-theme__timeline-icon {
  flex-shrink: 0;
  font-size: 1rem;
}
.env-story-theme__timeline strong {
  display: block;
  font-size: 0.88rem;
  color: #431407;
}
.env-story-theme__timeline-date,
.env-story-theme__timeline p {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: rgb(92 61 46 / 65%);
}
.env-story-theme__timeline-empty {
  margin: 0;
  font-size: 0.82rem;
  color: rgb(92 61 46 / 55%);
}
.env-story-theme__foot {
  padding: 20px 16px 28px;
  text-align: center;
  font-size: 0.72rem;
  color: rgb(92 61 46 / 55%);
}
</style>
