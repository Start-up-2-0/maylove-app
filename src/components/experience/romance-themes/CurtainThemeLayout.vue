<template>
  <div class="curtain-theme">
    <Transition name="curtain-overlay-fade" @after-leave="onCurtainLeft">
      <div
        v-if="showCurtain"
        class="curtain-overlay"
        :class="{ 'curtain-overlay--opening': opening, 'curtain-overlay--embedded': embedded }"
        role="dialog"
        aria-label="Abertura do espetáculo"
      >
        <div class="curtain-overlay__rod" aria-hidden="true" />
        <div class="curtain-overlay__left" aria-hidden="true" />
        <div class="curtain-overlay__right" aria-hidden="true" />
        <div v-if="!opening" class="curtain-overlay__center">
          <h1 class="curtain-overlay__couple">{{ coupleLabel }}</h1>
          <span class="curtain-overlay__heart" aria-hidden="true">♥</span>
          <p class="curtain-overlay__tagline">O espetáculo está prestes a começar</p>
          <button type="button" class="curtain-overlay__cta" @click="startOpen">
            Abrir as cortinas ›
          </button>
        </div>
      </div>
    </Transition>

    <div class="curtain-theme__content" :class="{ 'curtain-theme__content--ready': contentReady }">
      <section class="curtain-theme__hero" :style="heroStyle">
        <div class="curtain-theme__hero-shade" />
        <div class="curtain-theme__hero-body">
          <p class="curtain-theme__since">Juntos há</p>
          <h1 class="curtain-theme__couple">{{ coupleLabel }}</h1>
          <p class="curtain-theme__tagline">{{ tagline }}</p>
        </div>
      </section>

      <section v-if="showCounter" class="curtain-theme__countdown-wrap">
        <RomanceCountdownGrid :content="content" root-class="curtain-theme__countdown" />
      </section>

      <section v-if="messageText" class="curtain-theme__card">
        <p class="curtain-theme__eyebrow">Mensagem especial</p>
        <h2 class="curtain-theme__card-title">{{ content.title || 'O início do nosso para sempre' }}</h2>
        <p class="curtain-theme__card-text">
          {{ messageExpanded ? messageText : messagePreview }}
        </p>
        <button
          v-if="messageText.length > 120"
          type="button"
          class="curtain-theme__more"
          @click="messageExpanded = !messageExpanded"
        >
          {{ messageExpanded ? 'Ver menos' : 'Ler mais ›' }}
        </button>
      </section>

      <section v-if="content.music.url" class="curtain-theme__card">
        <header class="curtain-theme__card-head">
          <span class="curtain-theme__card-icon" aria-hidden="true">🎵</span>
          <p class="curtain-theme__eyebrow curtain-theme__eyebrow--inline">Nossa música</p>
        </header>
        <strong class="curtain-theme__track">{{ musicTitle }}</strong>
        <div class="curtain-theme__player">
          <span class="curtain-theme__play" aria-hidden="true">▶</span>
          <div class="curtain-theme__progress">
            <span class="curtain-theme__time">0:00</span>
            <div class="curtain-theme__progress-bar"><span /></div>
            <span class="curtain-theme__time">0:00</span>
          </div>
        </div>
      </section>

      <section v-if="content.photos.length" class="curtain-theme__card">
        <header class="curtain-theme__card-head">
          <span class="curtain-theme__card-icon" aria-hidden="true">📷</span>
          <p class="curtain-theme__eyebrow curtain-theme__eyebrow--inline">Nossas memórias</p>
        </header>
        <div class="curtain-theme__gallery">
          <img
            v-for="photo in content.photos"
            :key="photo.id"
            :src="photo.thumbnail || photo.url"
            alt=""
            loading="lazy"
          />
        </div>
      </section>

      <section class="curtain-theme__card">
        <header class="curtain-theme__card-head">
          <span class="curtain-theme__card-icon" aria-hidden="true">📖</span>
          <p class="curtain-theme__eyebrow curtain-theme__eyebrow--inline">Nossa história</p>
        </header>
        <ol v-if="timelineItems.length" class="curtain-theme__timeline">
          <li v-for="(item, index) in timelineItems" :key="index">
            <span class="curtain-theme__timeline-icon">{{ iconFor(item) }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p v-if="item.date" class="curtain-theme__timeline-date">{{ formatDate(item.date) }}</p>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
          </li>
        </ol>
        <p v-else class="curtain-theme__timeline-empty">Momento especial de vocês aparecerá aqui.</p>
      </section>

      <footer class="curtain-theme__foot">Feito com ♥ no MayLov</footer>
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

const showCurtain = ref(true)
const opening = ref(false)
const contentReady = ref(false)
const messageExpanded = ref(false)

const embedded = computed(() => Boolean(props.config?.contained))

const coupleLabel = computed(() => {
  if (props.content.senderName && props.content.honoreeName) {
    return `${props.content.senderName} & ${props.content.honoreeName}`
  }
  return props.content.honoreeName || props.content.title || 'Vocês'
})

const tagline = computed(
  () => props.content.subtitle?.trim() || 'Uma história escrita pelo amor',
)

const heroStyle = computed(() => {
  const photo = props.content.photos[0]?.url || props.content.photos[0]?.thumbnail
  if (!photo) {
    return { background: 'linear-gradient(180deg, #8b2942 0%, #f5f0e8 100%)' }
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
  window.setTimeout(() => {
    showCurtain.value = false
  }, 1100)
}

function onCurtainLeft() {
  contentReady.value = true
}

onMounted(() => {
  if (props.mode === 'preview' || embedded.value) {
    window.setTimeout(() => startOpen(), embedded.value ? 500 : 700)
  }
})
</script>

<style scoped>
.curtain-theme {
  position: relative;
  min-height: 100%;
  background: #f5f0e8;
  color: #3f2a22;
  font-family: Georgia, 'Times New Roman', serif;
}

/* ── Cortinas iniciais ───────────────────────────────────── */
.curtain-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  overflow: hidden;
  background: #1a0508;
}
.curtain-overlay__rod {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 14px;
  background: linear-gradient(180deg, #d4af37 0%, #8b6914 100%);
  box-shadow: 0 4px 12px rgb(0 0 0 / 45%);
  z-index: 4;
}
.curtain-overlay__left,
.curtain-overlay__right {
  position: absolute;
  top: 14px;
  bottom: 0;
  width: 52%;
  z-index: 2;
  background:
    repeating-linear-gradient(
      90deg,
      #6b0f1a 0px,
      #8b1538 18px,
      #5c0d16 36px,
      #7a1230 54px
    );
  box-shadow: inset 0 0 40px rgb(0 0 0 / 35%);
  transition: transform 1.1s cubic-bezier(0.45, 0.05, 0.22, 1);
}
.curtain-overlay__left {
  left: 0;
  transform-origin: left center;
  border-right: 3px solid rgb(0 0 0 / 35%);
}
.curtain-overlay__right {
  right: 0;
  transform-origin: right center;
  border-left: 3px solid rgb(0 0 0 / 35%);
}
.curtain-overlay--opening .curtain-overlay__left {
  transform: translateX(-102%);
}
.curtain-overlay--opening .curtain-overlay__right {
  transform: translateX(102%);
}
.curtain-overlay__center {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
  background: radial-gradient(circle at 50% 40%, rgb(0 0 0 / 55%) 0%, rgb(0 0 0 / 82%) 70%);
}
.curtain-overlay__couple {
  margin: 0;
  font-size: clamp(1.8rem, 7vw, 2.8rem);
  font-weight: 700;
  color: #e8c872;
  text-shadow: 0 2px 18px rgb(0 0 0 / 45%);
}
.curtain-overlay__heart {
  color: #f472b6;
  font-size: 1.1rem;
}
.curtain-overlay__tagline {
  margin: 0;
  max-width: 280px;
  font-size: 0.92rem;
  color: rgb(255 255 255 / 78%);
  font-family: system-ui, sans-serif;
}
.curtain-overlay__cta {
  margin-top: 12px;
  padding: 10px 18px;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  font-family: system-ui, sans-serif;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}
.curtain-overlay__cta:hover {
  background: rgb(255 255 255 / 10%);
  transform: translateY(-1px);
}
.curtain-overlay-fade-leave-active {
  transition: opacity 0.35s ease 0.85s;
}
.curtain-overlay-fade-leave-to {
  opacity: 0;
}

/* ── Conteúdo ────────────────────────────────────────────── */
.curtain-theme__content {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.curtain-theme__content--ready {
  opacity: 1;
  transform: none;
}
.curtain-theme__hero {
  position: relative;
  min-height: 260px;
  background-size: cover;
  background-position: center;
}
.curtain-theme__hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(63 42 34 / 25%) 0%, rgb(245 240 232 / 95%) 100%);
}
.curtain-theme__hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 260px;
  padding: 28px 18px 22px;
  text-align: center;
}
.curtain-theme__since {
  margin: 0 0 6px;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a4a3a;
  font-family: system-ui, sans-serif;
}
.curtain-theme__couple {
  margin: 0;
  font-size: clamp(1.7rem, 6vw, 2.3rem);
  color: #b8860b;
  line-height: 1.1;
}
.curtain-theme__tagline {
  margin: 10px 0 0;
  font-style: italic;
  color: #6b4c40;
  font-size: 0.95rem;
}
.curtain-theme__countdown-wrap {
  margin: -18px 16px 0;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(145deg, #5c1a2e 0%, #3f0f1c 100%);
  box-shadow: 0 16px 36px -20px rgb(60 10 25 / 65%);
}
.curtain-theme__countdown :deep(.rom-countdown__cell) {
  background: rgb(255 255 255 / 6%);
  border-color: rgb(255 255 255 / 10%);
}
.curtain-theme__countdown :deep(.rom-countdown__value) {
  color: #e8c872;
  font-family: Georgia, serif;
}
.curtain-theme__countdown :deep(.rom-countdown__label) {
  color: rgb(255 255 255 / 55%);
}
.curtain-theme__card {
  margin: 16px 16px 0;
  padding: 18px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 32px -24px rgb(63 42 34 / 35%);
}
.curtain-theme__card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.curtain-theme__card-icon {
  font-size: 1rem;
}
.curtain-theme__eyebrow {
  margin: 0 0 8px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #9f1239;
  font-family: system-ui, sans-serif;
}
.curtain-theme__eyebrow--inline {
  margin: 0;
}
.curtain-theme__card-title {
  margin: 0 0 10px;
  font-size: 1.15rem;
  color: #3f2a22;
}
.curtain-theme__card-text {
  margin: 0;
  line-height: 1.65;
  color: #5c4038;
  white-space: pre-wrap;
  font-family: system-ui, sans-serif;
  font-size: 0.92rem;
}
.curtain-theme__more {
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  color: #9f1239;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: system-ui, sans-serif;
}
.curtain-theme__track {
  display: block;
  margin-bottom: 12px;
  font-size: 0.95rem;
  font-family: system-ui, sans-serif;
}
.curtain-theme__player {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}
.curtain-theme__play {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #9f1239;
  color: #fff;
  font-size: 0.85rem;
}
.curtain-theme__progress {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  width: 100%;
}
.curtain-theme__time {
  font-size: 0.68rem;
  color: #8a6a5c;
  font-family: system-ui, sans-serif;
}
.curtain-theme__progress-bar {
  height: 4px;
  border-radius: 999px;
  background: #eaded6;
  overflow: hidden;
}
.curtain-theme__progress-bar span {
  display: block;
  width: 10%;
  height: 100%;
  background: #9f1239;
}
.curtain-theme__gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.curtain-theme__gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
}
.curtain-theme__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.curtain-theme__timeline li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
}
.curtain-theme__timeline-icon {
  font-size: 1rem;
}
.curtain-theme__timeline-date {
  margin: 2px 0 0;
  font-size: 0.76rem;
  color: #9f1239;
  font-family: system-ui, sans-serif;
}
.curtain-theme__timeline-empty {
  margin: 0;
  font-size: 0.9rem;
  color: #8a6a5c;
  font-family: system-ui, sans-serif;
}
.curtain-theme__foot {
  padding: 24px 16px 32px;
  text-align: center;
  font-size: 0.82rem;
  font-style: italic;
  color: #8a6a5c;
}
</style>
