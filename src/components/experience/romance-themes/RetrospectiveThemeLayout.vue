<template>
  <div
    class="retro-theme"
    :class="{
      'retro-theme--stars': palette.stars,
      'retro-theme--light': palette.mode === 'light',
      'retro-theme--embedded': embedded,
      'retro-theme--started': storyStarted,
    }"
    :style="themeStyle"
  >
    <header class="retro-theme__top">
      <button
        v-if="storyStarted && slideIndex > 0"
        type="button"
        class="retro-theme__back"
        aria-label="Voltar"
        @click="prevSlide"
      >
        ‹
      </button>
      <div class="retro-theme__top-center">
        <p class="retro-theme__brand">Retrospectiva</p>
        <div v-if="storyStarted && slides.length > 1" class="retro-theme__dots" aria-hidden="true">
          <span
            v-for="(_, index) in slides"
            :key="index"
            class="retro-theme__dot"
            :class="{ 'retro-theme__dot--active': index === slideIndex }"
          />
        </div>
      </div>
    </header>

    <button
      v-if="storyStarted && slideIndex > 0"
      type="button"
      class="retro-theme__nav retro-theme__nav--prev"
      aria-label="Slide anterior"
      @click="prevSlide"
    >
      ‹
    </button>
    <button
      v-if="storyStarted && slideIndex < slides.length - 1"
      type="button"
      class="retro-theme__nav retro-theme__nav--next"
      aria-label="Próximo slide"
      @click="nextSlide"
    >
      ›
    </button>

    <main class="retro-theme__stage">
      <!-- Intro -->
      <section v-if="currentSlide?.kind === 'intro'" class="retro-theme__intro">
        <div class="retro-theme__hero-card">
          <span class="retro-theme__hearts" aria-hidden="true">♥♥</span>
          <h1 class="retro-theme__couple">{{ coupleLabel }}</h1>
          <p class="retro-theme__subtitle">Uma história de amor</p>
          <p v-if="sinceLabel" class="retro-theme__since">{{ sinceLabel }}</p>
        </div>

        <RomanceCountdownGrid
          v-if="showCounter"
          :content="content"
          root-class="retro-theme__countdown"
        />

        <button type="button" class="retro-theme__cta" @click="startStory">
          <span aria-hidden="true">📖</span>
          Começar a história
        </button>
      </section>

      <!-- Photo moment -->
      <section v-else-if="photoSlide" class="retro-theme__photo">
        <figure class="retro-theme__photo-card">
          <img :src="photoSlide.photo.url" alt="" loading="lazy" />
          <figcaption>{{ photoSlide.caption }}</figcaption>
        </figure>
        <button type="button" class="retro-theme__cta" @click="nextSlide">
          <span aria-hidden="true">🔔</span>
          Mini desafio!
        </button>
      </section>

      <!-- Puzzle -->
      <section v-else-if="puzzleSlide" class="retro-theme__challenge">
        <RetrospectivePuzzle :image-url="puzzleSlide.photo.url" @solved="puzzleDone = true" />
        <button
          v-if="puzzleDone"
          type="button"
          class="retro-theme__cta"
          @click="nextSlide"
        >
          <span aria-hidden="true">→</span>
          Continuar a história
        </button>
      </section>

      <!-- Message -->
      <section v-else-if="currentSlide?.kind === 'message'" class="retro-theme__message">
        <article class="retro-theme__message-card">
          <p class="retro-theme__message-label">Mensagem</p>
          <h2>{{ content.title || 'O início do nosso para sempre' }}</h2>
          <p>{{ messageExpanded ? messageText : messagePreview }}</p>
          <button
            v-if="messageText.length > 100"
            type="button"
            class="retro-theme__more"
            @click="messageExpanded = !messageExpanded"
          >
            {{ messageExpanded ? 'Ver menos' : 'Ler mais ›' }}
          </button>
        </article>
        <button
          v-if="content.photos.length > 1"
          type="button"
          class="retro-theme__cta"
          @click="nextSlide"
        >
          <span aria-hidden="true">📷</span>
          Ver fotos
        </button>
        <button v-else type="button" class="retro-theme__cta" @click="nextSlide">
          <span aria-hidden="true">→</span>
          Continuar
        </button>
      </section>

      <!-- Gallery -->
      <section v-else-if="currentSlide?.kind === 'gallery'" class="retro-theme__gallery">
        <div class="retro-theme__gallery-grid">
          <img
            v-for="photo in content.photos"
            :key="photo.id"
            :src="photo.thumbnail || photo.url"
            alt=""
            loading="lazy"
          />
        </div>
        <button type="button" class="retro-theme__cta" @click="nextSlide">
          <span aria-hidden="true">🏆</span>
          Próximo desafio
        </button>
      </section>

      <!-- Memory -->
      <section v-else-if="currentSlide?.kind === 'memory'" class="retro-theme__challenge">
        <RetrospectiveMemory
          :photos="memoryPhotos"
          @complete="memoryDone = true"
        />
        <button v-if="memoryDone" type="button" class="retro-theme__cta" @click="nextSlide">
          <span aria-hidden="true">→</span>
          Continuar a história
        </button>
      </section>

      <!-- Photo quiz -->
      <section v-else-if="currentSlide?.kind === 'quiz'" class="retro-theme__challenge">
        <RetrospectivePhotoQuiz :photos="quizPhotos" @answered="onQuizAnswered" />
        <button v-if="quizDone" type="button" class="retro-theme__cta" @click="nextSlide">
          <span aria-hidden="true">→</span>
          Continuar a história
        </button>
      </section>

      <!-- Finale -->
      <section v-else-if="currentSlide?.kind === 'finale'" class="retro-theme__finale">
        <div class="retro-theme__hero-card retro-theme__hero-card--compact">
          <span class="retro-theme__hearts" aria-hidden="true">♥♥</span>
          <h2 class="retro-theme__couple retro-theme__couple--sm">{{ coupleLabel }}</h2>
          <p class="retro-theme__subtitle">Para sempre juntos</p>
        </div>

        <ol v-if="timelineItems.length" class="retro-theme__timeline">
          <li v-for="(item, index) in timelineItems" :key="index">
            <span>{{ iconFor(item) }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
          </li>
        </ol>

        <p v-if="content.closingMessage" class="retro-theme__closing">{{ content.closingMessage }}</p>
        <footer class="retro-theme__foot">Feito com ♥ no MayLov</footer>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RomanceCountdownGrid from '@/components/experience/romance-themes/RomanceCountdownGrid.vue'
import RetrospectiveMemory from '@/components/experience/romance-themes/RetrospectiveMemory.vue'
import RetrospectivePhotoQuiz from '@/components/experience/romance-themes/RetrospectivePhotoQuiz.vue'
import RetrospectivePuzzle from '@/components/experience/romance-themes/RetrospectivePuzzle.vue'
import { resolveRetrospectivePalette } from '@/modules/romance-wizard/retrospectivePalettes'
import type {
  ExperienceContent,
  ExperienceTimelineItem,
  LayoutConfig,
  ResolvedTheme,
  TemplateDefinition,
} from '@/templates/types'
import { getEmotionDisplay } from '@/utils/timelineEmotions'
import { plainTimelineText } from '@/utils/timeline'

interface IntroSlide {
  kind: 'intro'
}

interface PhotoMomentSlide {
  kind: 'photo'
  photo: { id: string; url: string }
  caption: string
}

interface PuzzleSlide {
  kind: 'puzzle'
  photo: { id: string; url: string }
  caption: string
}

interface MessageSlide {
  kind: 'message'
}

interface GallerySlide {
  kind: 'gallery'
}

interface MemorySlide {
  kind: 'memory'
}

interface QuizSlide {
  kind: 'quiz'
}

interface FinaleSlide {
  kind: 'finale'
}

type Slide =
  | IntroSlide
  | PhotoMomentSlide
  | PuzzleSlide
  | MessageSlide
  | GallerySlide
  | MemorySlide
  | QuizSlide
  | FinaleSlide

const props = defineProps<{
  definition: TemplateDefinition
  content: ExperienceContent
  theme: ResolvedTheme
  mode?: 'full' | 'preview'
  shareUrl?: string
  config?: LayoutConfig
}>()

const storyStarted = ref(false)
const slideIndex = ref(0)
const puzzleDone = ref(false)
const memoryDone = ref(false)
const quizDone = ref(false)
const messageExpanded = ref(false)

const embedded = computed(() => Boolean(props.config?.contained))

const palette = computed(() =>
  resolveRetrospectivePalette(
    props.content.retrospectivePaletteId,
    props.content.retrospectivePaletteId === 'custom' ? props.theme.primaryColor : null,
  ),
)

const themeStyle = computed(() => ({
  background: palette.value.background,
  '--retro-bg': palette.value.background,
  '--retro-card-bg': palette.value.cardBg,
  '--retro-card-border': palette.value.cardBorder,
  '--retro-accent': palette.value.accent,
  '--retro-accent-2': palette.value.accentSecondary,
  '--retro-text': palette.value.text,
  '--retro-text-muted': palette.value.textMuted,
  '--retro-countdown-bg': palette.value.countdownBg,
  '--retro-btn': palette.value.buttonGradient,
  '--rom-countdown-accent': palette.value.accent,
}))

const coupleLabel = computed(() => {
  if (props.content.senderName && props.content.honoreeName) {
    return `${props.content.senderName} & ${props.content.honoreeName}`
  }
  return props.content.honoreeName || props.content.title || 'Vocês'
})

const sinceLabel = computed(() => {
  if (!props.content.specialDate) return ''
  const parsed = new Date(props.content.specialDate)
  if (Number.isNaN(parsed.getTime())) return ''
  const formatted = parsed.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `Juntos desde ${formatted}`
})

const showCounter = computed(() => Boolean(props.content.specialDate))

const messageText = computed(() => plainTimelineText(props.content.message) || props.content.messages[0] || '')

const messagePreview = computed(() => {
  const text = messageText.value
  return text.length > 100 ? `${text.slice(0, 100).trim()}…` : text
})

const featuredPhoto = computed(() => props.content.photos[0] ?? null)

const slides = computed<Slide[]>(() => {
  const list: Slide[] = [{ kind: 'intro' }]

  if (featuredPhoto.value) {
    const photo = { id: featuredPhoto.value.id, url: featuredPhoto.value.url }
    const caption = 'Um momento especial...'
    list.push({ kind: 'photo', photo, caption })
    list.push({ kind: 'puzzle', photo, caption })
  }

  if (messageText.value.trim()) {
    list.push({ kind: 'message' })
  }

  if (props.content.photos.length > 1) {
    list.push({ kind: 'gallery' })
  }

  if (props.content.photos.length >= 4) {
    list.push({ kind: 'memory' })
  } else if (props.content.photos.length >= 3) {
    list.push({ kind: 'quiz' })
  }

  list.push({ kind: 'finale' })
  return list
})

const currentSlide = computed(() => slides.value[slideIndex.value] ?? slides.value[0])

const photoSlide = computed((): PhotoMomentSlide | null => {
  const slide = currentSlide.value
  return slide?.kind === 'photo' ? slide : null
})

const puzzleSlide = computed((): PuzzleSlide | null => {
  const slide = currentSlide.value
  return slide?.kind === 'puzzle' ? slide : null
})

const memoryPhotos = computed(() =>
  props.content.photos.slice(0, 4).map((photo) => ({ id: photo.id, url: photo.url })),
)

const quizPhotos = computed(() =>
  props.content.photos.slice(0, 3).map((photo) => ({
    id: photo.id,
    url: photo.url,
    caption: 'Um momento especial...',
  })),
)

const timelineItems = computed(() =>
  props.content.timeline.filter((item) => item.title?.trim() || item.description?.trim()),
)

watch(slideIndex, () => {
  puzzleDone.value = false
  memoryDone.value = false
  quizDone.value = false
})

function startStory() {
  storyStarted.value = true
  slideIndex.value = slides.value.length > 1 ? 1 : 0
}

function nextSlide() {
  if (slideIndex.value < slides.value.length - 1) slideIndex.value += 1
}

function prevSlide() {
  if (slideIndex.value > 0) slideIndex.value -= 1
  else storyStarted.value = false
}

function onQuizAnswered() {
  quizDone.value = true
}

function iconFor(item: ExperienceTimelineItem) {
  return getEmotionDisplay(item.emotion)?.icon ?? '♥'
}
</script>

<style scoped>
.retro-theme {
  position: relative;
  min-height: var(--exp-stage, 100svh);
  display: flex;
  flex-direction: column;
  color: var(--retro-text);
  overflow: hidden;
}
.retro-theme--embedded {
  min-height: 520px;
}
.retro-theme--stars::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgb(255 255 255 / 85%) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.35;
}
.retro-theme__top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 12px 44px 8px;
}
.retro-theme__back {
  position: absolute;
  left: 12px;
  top: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: rgb(0 0 0 / 18%);
  color: inherit;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}
.retro-theme--light .retro-theme__back {
  background: rgb(255 255 255 / 55%);
}
.retro-theme__top-center {
  text-align: center;
}
.retro-theme__brand {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}
.retro-theme__dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}
.retro-theme__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgb(255 255 255 / 28%);
}
.retro-theme--light .retro-theme__dot {
  background: rgb(0 0 0 / 15%);
}
.retro-theme__dot--active {
  width: 18px;
  background: var(--retro-accent);
}
.retro-theme__nav {
  position: absolute;
  top: 50%;
  z-index: 3;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: rgb(0 0 0 / 28%);
  color: #fff;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}
.retro-theme--light .retro-theme__nav {
  background: rgb(255 255 255 / 72%);
  color: var(--retro-text);
}
.retro-theme__nav--prev {
  left: 8px;
}
.retro-theme__nav--next {
  right: 8px;
}
.retro-theme__stage {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 20px 28px;
}
.retro-theme__intro,
.retro-theme__photo,
.retro-theme__message,
.retro-theme__gallery,
.retro-theme__challenge,
.retro-theme__finale {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: min(100%, 360px);
}
.retro-theme__hero-card {
  width: 100%;
  padding: 24px 18px 20px;
  border-radius: 20px;
  text-align: center;
  background: var(--retro-card-bg);
  border: 1px solid var(--retro-card-border);
  backdrop-filter: blur(8px);
}
.retro-theme__hero-card--compact {
  padding: 18px 16px;
}
.retro-theme__hearts {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #ef4444;
  letter-spacing: -0.15em;
}
.retro-theme__couple {
  margin: 0;
  font-family: 'Segoe Script', 'Brush Script MT', cursive;
  font-size: clamp(1.6rem, 7vw, 2.2rem);
  font-weight: 400;
  line-height: 1.15;
  color: var(--retro-accent);
}
.retro-theme__couple--sm {
  font-size: clamp(1.35rem, 6vw, 1.8rem);
}
.retro-theme__subtitle {
  margin: 10px 0 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--retro-text-muted);
}
.retro-theme__since {
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: var(--retro-text-muted);
}
.retro-theme :deep(.retro-theme__countdown .rom-countdown__cell) {
  background: var(--retro-countdown-bg);
  border-color: var(--retro-card-border);
}
.retro-theme :deep(.retro-theme__countdown .rom-countdown__label) {
  color: var(--retro-text-muted);
}
.retro-theme__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: min(100%, 280px);
  padding: 14px 20px;
  border: none;
  border-radius: 999px;
  background: var(--retro-btn);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 28px -12px rgb(0 0 0 / 45%);
}
.retro-theme__photo-card {
  width: 100%;
  margin: 0;
  border-radius: 18px;
  overflow: hidden;
  background: var(--retro-card-bg);
  border: 1px solid var(--retro-card-border);
}
.retro-theme__photo-card img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}
.retro-theme__photo-card figcaption {
  padding: 12px 14px;
  font-size: 0.88rem;
  font-style: italic;
  text-align: center;
  color: #fff;
  background: linear-gradient(transparent, rgb(0 0 0 / 72%));
  margin-top: -48px;
  position: relative;
}
.retro-theme__message-card {
  width: 100%;
  padding: 18px 16px;
  border-radius: 18px;
  background: var(--retro-card-bg);
  border: 1px solid var(--retro-card-border);
}
.retro-theme__message-label {
  margin: 0 0 8px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--retro-accent);
}
.retro-theme__message-card h2 {
  margin: 0 0 10px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  line-height: 1.25;
}
.retro-theme__message-card p {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--retro-text-muted);
}
.retro-theme__more {
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  color: var(--retro-accent);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}
.retro-theme__gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}
.retro-theme__gallery-grid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid var(--retro-card-border);
}
.retro-theme__timeline {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.retro-theme__timeline li {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: var(--retro-card-bg);
  border: 1px solid var(--retro-card-border);
}
.retro-theme__timeline strong {
  display: block;
  font-size: 0.88rem;
}
.retro-theme__timeline p {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--retro-text-muted);
}
.retro-theme__closing {
  margin: 0;
  text-align: center;
  font-size: 0.88rem;
  font-style: italic;
  color: var(--retro-text-muted);
}
.retro-theme__foot {
  margin-top: 4px;
  font-size: 0.72rem;
  color: var(--retro-text-muted);
  opacity: 0.85;
}
</style>
