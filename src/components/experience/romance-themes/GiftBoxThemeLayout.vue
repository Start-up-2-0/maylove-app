<template>
  <div class="gift-theme">
    <Transition name="gift-overlay-fade" @after-leave="onGiftLeft">
      <div
        v-if="showGift"
        class="gift-overlay"
        :class="{ 'gift-overlay--opening': opening, 'gift-overlay--embedded': embedded, 'gift-overlay--preview': isPreview }"
        role="dialog"
        aria-label="Abrir presente"
      >
        <div class="gift-overlay__sparkles" aria-hidden="true" />
        <div class="gift-overlay__stage">
          <div class="gift-box" :class="{ 'gift-box--open': opening }">
            <div class="gift-box__lid">
              <span class="gift-box__bow" aria-hidden="true" />
            </div>
            <span class="gift-box__ribbon-v" aria-hidden="true" />
            <span class="gift-box__ribbon-h" aria-hidden="true" />
            <div class="gift-box__body">
              <span class="gift-box__heart" aria-hidden="true">♥</span>
            </div>
          </div>
        </div>

        <div v-if="!opening" class="gift-overlay__copy">
          <p class="gift-overlay__for">Para {{ coupleLabel }}</p>
          <p class="gift-overlay__love">com muito amor <span aria-hidden="true">🦋</span></p>
          <button type="button" class="gift-overlay__cta" @click="startOpen">
            Abrir o presente 🎁
          </button>
        </div>
      </div>
    </Transition>

    <div class="gift-theme__content" :class="{ 'gift-theme__content--ready': contentReady }">
      <section class="gift-theme__hero" :style="heroStyle">
        <div class="gift-theme__hero-shade" />
        <div class="gift-theme__hero-body">
          <h1 class="gift-theme__couple">{{ coupleLabel }}</h1>
          <p class="gift-theme__tagline">Um presente de amor para você</p>
        </div>
      </section>

      <section v-if="showCounter" class="gift-theme__countdown-wrap">
        <RomanceCountdownGrid :content="content" root-class="gift-theme__countdown" />
      </section>

      <section v-if="messageText" class="gift-theme__card">
        <header class="gift-theme__card-head">
          <span class="gift-theme__card-icon" aria-hidden="true">🎁</span>
          <p class="gift-theme__eyebrow">Mensagem do coração</p>
        </header>
        <h2 class="gift-theme__card-title">{{ content.title || 'O início do nosso para sempre' }}</h2>
        <p class="gift-theme__card-text">
          {{ messageExpanded ? messageText : messagePreview }}
        </p>
        <button
          v-if="messageText.length > 120"
          type="button"
          class="gift-theme__more"
          @click="messageExpanded = !messageExpanded"
        >
          {{ messageExpanded ? 'Ver menos' : 'Ler mais ›' }}
        </button>
      </section>

      <section v-if="content.music.url" class="gift-theme__card">
        <header class="gift-theme__card-head">
          <span class="gift-theme__card-icon" aria-hidden="true">🎁</span>
          <p class="gift-theme__eyebrow">Nossa música</p>
        </header>
        <strong class="gift-theme__track">{{ musicTitle }}</strong>
        <div class="gift-theme__player">
          <span class="gift-theme__play" aria-hidden="true">▶</span>
          <div class="gift-theme__progress">
            <span class="gift-theme__time">0:00</span>
            <div class="gift-theme__progress-bar"><span /></div>
            <span class="gift-theme__time">0:00</span>
          </div>
        </div>
      </section>

      <section v-if="content.photos.length" class="gift-theme__card">
        <header class="gift-theme__card-head">
          <span class="gift-theme__card-icon" aria-hidden="true">🎁</span>
          <p class="gift-theme__eyebrow">Nosso álbum</p>
        </header>
        <div class="gift-theme__gallery">
          <img
            v-for="(photo, index) in content.photos"
            :key="photo.id"
            :src="photo.thumbnail || photo.url"
            :alt="`Recordação ${index + 1} de ${content.photos.length}`"
            loading="lazy"
          />
        </div>
      </section>

      <section class="gift-theme__card">
        <header class="gift-theme__card-head">
          <span class="gift-theme__card-icon" aria-hidden="true">🎁</span>
          <p class="gift-theme__eyebrow">Momentos especiais</p>
        </header>
        <ol v-if="timelineItems.length" class="gift-theme__timeline">
          <li v-for="(item, index) in timelineItems" :key="index">
            <span class="gift-theme__timeline-icon">{{ iconFor(item) }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p v-if="item.date" class="gift-theme__timeline-date">{{ formatDate(item.date) }}</p>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
          </li>
        </ol>
        <p v-else class="gift-theme__timeline-empty">Momento especial de vocês aparecerá aqui.</p>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import RomanceCountdownGrid from '@/components/experience/romance-themes/RomanceCountdownGrid.vue'
import type { ExperienceContent, ExperienceTimelineItem, LayoutConfig, ResolvedTheme, TemplateDefinition } from '@/templates/types'
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

const showGift = ref(true)
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

const heroStyle = computed(() => {
  const photo = props.content.photos[0]?.url || props.content.photos[0]?.thumbnail
  if (!photo) {
    return {
      background: 'linear-gradient(145deg, #fb7185 0%, #be123c 55%, #881337 100%)',
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

const musicTitle = computed(() => props.content.music.title || 'Nenhuma música selecionada')

const timelineItems = computed(() => props.content.timeline.filter((item) => item.title?.trim()))

function iconFor(item: ExperienceTimelineItem) {
  return getEmotionDisplay(item.emotion)?.icon ?? '💕'
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}

function startOpen() {
  if (opening.value) return
  opening.value = true
  window.setTimeout(() => {
    contentReady.value = true
    showGift.value = false
  }, 1200)
}

function skipOpening() {
  opening.value = true
  contentReady.value = true
  showGift.value = false
}

function onGiftLeft() {
  contentReady.value = true
}

onMounted(() => {
  if (isPreview.value) {
    window.setTimeout(() => skipOpening(), 180)
  }
})
</script>

<style scoped>
.gift-theme {
  position: relative;
  min-height: 100%;
  background: #fff1f2;
  color: #4a1025;
}

/* ── Intro: caixa de presente ────────────────────────────── */
.gift-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 24px;
  background:
    radial-gradient(circle at 20% 15%, rgb(251 113 133 / 25%), transparent 40%),
    radial-gradient(circle at 80% 85%, rgb(244 114 182 / 20%), transparent 45%),
    linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%);
  overflow: hidden;
}
.gift-overlay--embedded {
  position: absolute;
}
.gift-overlay__sparkles {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    radial-gradient(circle, #fda4af 1px, transparent 1px),
    radial-gradient(circle, #fb7185 1px, transparent 1px);
  background-size: 48px 48px, 72px 72px;
  background-position: 0 0, 24px 24px;
  pointer-events: none;
}
.gift-overlay__stage {
  perspective: 900px;
  perspective-origin: 50% 40%;
}
.gift-box {
  position: relative;
  width: min(220px, 62vw);
  height: min(200px, 56vw);
  transform-style: preserve-3d;
}
.gift-box__body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 62%;
  border-radius: 10px;
  background: linear-gradient(180deg, #e11d48 0%, #be123c 100%);
  box-shadow: 0 18px 36px -16px rgb(190 18 60 / 55%);
  display: grid;
  place-items: center;
  transition:
    transform 0.9s cubic-bezier(0.45, 0.05, 0.22, 1),
    opacity 0.6s ease 0.3s;
}
.gift-box__heart {
  font-size: 1.4rem;
  color: #fde68a;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 25%));
}
.gift-box__ribbon-v,
.gift-box__ribbon-h {
  position: absolute;
  z-index: 2;
  background: #facc15;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 25%);
  transition: opacity 0.4s ease 0.5s;
}
.gift-box__ribbon-v {
  left: 50%;
  top: 18%;
  bottom: 0;
  width: 22%;
  transform: translateX(-50%);
  border-radius: 4px;
}
.gift-box__ribbon-h {
  left: 0;
  right: 0;
  top: 38%;
  height: 14%;
}
.gift-box__lid {
  position: absolute;
  left: -4%;
  right: -4%;
  top: 0;
  height: 42%;
  transform-origin: 50% 100%;
  transform-style: preserve-3d;
  transition: transform 1s cubic-bezier(0.45, 0.05, 0.22, 1);
  z-index: 3;
}
.gift-box__lid::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px 10px 4px 4px;
  background: linear-gradient(180deg, #f43f5e 0%, #e11d48 100%);
  box-shadow: 0 8px 20px rgb(190 18 60 / 35%);
}
.gift-box__bow {
  position: absolute;
  left: 50%;
  top: -16px;
  width: 52px;
  height: 28px;
  transform: translateX(-50%);
  background: #facc15;
  border-radius: 999px 999px 8px 8px;
  box-shadow:
    -18px 4px 0 -6px #facc15,
    18px 4px 0 -6px #facc15,
    inset 0 0 0 1px rgb(255 255 255 / 30%);
}
.gift-box--open .gift-box__lid {
  transform: rotateX(-112deg) translateY(-8px);
}
.gift-box--open .gift-box__body {
  transform: translateY(24px) scale(0.88);
  opacity: 0;
}
.gift-box--open .gift-box__ribbon-v,
.gift-box--open .gift-box__ribbon-h {
  opacity: 0;
}
.gift-overlay__copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  transition: opacity 0.35s ease;
}
.gift-overlay--opening .gift-overlay__copy {
  opacity: 0;
  pointer-events: none;
}
.gift-overlay__for {
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  font-style: italic;
  color: #be123c;
  font-family: Georgia, 'Times New Roman', serif;
}
.gift-overlay__love {
  margin: 0;
  font-size: 0.95rem;
  color: #9f1239;
  font-family: system-ui, sans-serif;
}
.gift-overlay__cta {
  margin-top: 10px;
  padding: 12px 22px;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #be123c;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 10px 28px -12px rgb(190 18 60 / 45%);
  cursor: pointer;
  font-family: system-ui, sans-serif;
  transition: transform 0.2s ease;
}
.gift-overlay__cta:hover {
  transform: translateY(-2px);
}
.gift-overlay-fade-leave-active {
  transition: opacity 0.4s ease 0.95s;
}
.gift-overlay--preview.gift-overlay-fade-leave-active {
  transition: opacity 0.22s ease;
}
.gift-overlay-fade-leave-to {
  opacity: 0;
}

/* ── Conteúdo ────────────────────────────────────────────── */
.gift-theme__content {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  transition:
    opacity 0.55s ease,
    transform 0.55s ease;
}
.gift-theme__content--ready {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .gift-overlay *,
  .gift-theme__content { animation: none !important; transition-duration: 0.01ms !important; transition-delay: 0ms !important; }
}
.gift-theme__hero {
  position: relative;
  min-height: 240px;
  margin: 16px 16px 0;
  border-radius: 18px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  box-shadow: 0 16px 40px -22px rgb(190 18 60 / 45%);
}
.gift-theme__hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(190 18 60 / 20%) 0%,
    rgb(136 19 55 / 78%) 100%
  );
}
.gift-theme__hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 240px;
  padding: 24px 18px;
  text-align: center;
}
.gift-theme__couple {
  margin: 0;
  font-size: clamp(1.8rem, 6vw, 2.4rem);
  font-weight: 700;
  font-style: italic;
  color: #fff;
  text-shadow: 0 2px 16px rgb(0 0 0 / 35%);
  font-family: Georgia, 'Times New Roman', serif;
}
.gift-theme__tagline {
  margin: 8px 0 0;
  font-size: 0.92rem;
  color: rgb(255 255 255 / 88%);
  font-family: system-ui, sans-serif;
}
.gift-theme__countdown-wrap {
  margin: 14px 16px 0;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(145deg, #881337 0%, #4c0519 100%);
}
.gift-theme__countdown :deep(.rom-countdown__cell) {
  background: rgb(255 255 255 / 7%);
  border-color: rgb(255 255 255 / 10%);
}
.gift-theme__countdown :deep(.rom-countdown__value) {
  color: #fff;
}
.gift-theme__countdown :deep(.rom-countdown__label) {
  color: #fde68a;
}
.gift-theme__card {
  margin: 14px 16px 0;
  padding: 18px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgb(251 113 133 / 22%);
  box-shadow: 0 10px 28px -20px rgb(190 18 60 / 30%);
}
.gift-theme__card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.gift-theme__card-icon {
  font-size: 1rem;
}
.gift-theme__eyebrow {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #e11d48;
  font-family: system-ui, sans-serif;
}
.gift-theme__card-title {
  margin: 0 0 10px;
  font-size: 1.15rem;
  font-style: italic;
  color: #881337;
  font-family: Georgia, serif;
}
.gift-theme__card-text {
  margin: 0;
  line-height: 1.65;
  color: #6b3045;
  white-space: pre-wrap;
  font-family: system-ui, sans-serif;
  font-size: 0.92rem;
}
.gift-theme__more {
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  color: #e11d48;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: system-ui, sans-serif;
}
.gift-theme__track {
  display: block;
  margin-bottom: 12px;
  font-size: 0.95rem;
  font-family: system-ui, sans-serif;
}
.gift-theme__player {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}
.gift-theme__play {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #fb7185;
  color: #fff;
  font-size: 0.85rem;
}
.gift-theme__progress {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  width: 100%;
}
.gift-theme__time {
  font-size: 0.68rem;
  color: #9f1239;
  font-family: system-ui, sans-serif;
}
.gift-theme__progress-bar {
  height: 4px;
  border-radius: 999px;
  background: #fecdd3;
  overflow: hidden;
}
.gift-theme__progress-bar span {
  display: block;
  width: 12%;
  height: 100%;
  background: #e11d48;
}
.gift-theme__gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.gift-theme__gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
}
.gift-theme__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.gift-theme__timeline li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
}
.gift-theme__timeline-icon {
  font-size: 1rem;
}
.gift-theme__timeline-date {
  margin: 2px 0 0;
  font-size: 0.76rem;
  color: #e11d48;
  font-family: system-ui, sans-serif;
}
.gift-theme__timeline-empty {
  margin: 0;
  font-size: 0.9rem;
  color: #9f1239;
  font-family: system-ui, sans-serif;
}
.gift-theme__foot {
  padding: 24px 16px 32px;
  text-align: center;
  font-size: 0.82rem;
  font-style: italic;
  color: #be123c;
}
</style>
