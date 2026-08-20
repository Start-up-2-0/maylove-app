<template>
  <div class="cinema-theme">
    <section class="cinema-theme__hero" :style="heroStyle">
      <div class="cinema-theme__hero-shade" />
      <div class="cinema-theme__hero-body">
        <p class="cinema-theme__eyebrow">Tributo cinematográfico</p>
        <h1 class="cinema-theme__couple">{{ coupleHeadline }}</h1>
        <p class="cinema-theme__tagline">{{ tagline }}</p>
      </div>
    </section>

    <RomanceCountdownGrid
      v-if="showCounter"
      :content="content"
      root-class="cinema-theme__countdown"
    />

    <section v-if="messageText" class="cinema-theme__panel">
      <header class="cinema-theme__panel-head">
        <h2>{{ content.title || 'O início do nosso para sempre' }}</h2>
        <button type="button" class="cinema-theme__open" @click="letterOpen = !letterOpen">
          {{ letterOpen ? 'Fechar' : 'Abrir' }}
        </button>
      </header>
      <p v-if="letterOpen" class="cinema-theme__letter">{{ messageText }}</p>
      <p v-else class="cinema-theme__letter cinema-theme__letter--peek">
        {{ messagePreview }}
      </p>
    </section>

    <section v-if="content.music.url" class="cinema-theme__panel">
      <p class="cinema-theme__section-label">Nossa trilha</p>
      <strong class="cinema-theme__track">{{ musicTitle }}</strong>
      <div class="cinema-theme__player">
        <span class="cinema-theme__play" aria-hidden="true">▶</span>
        <div class="cinema-theme__progress"><span /></div>
      </div>
    </section>

    <section v-if="content.photos.length" class="cinema-theme__panel">
      <p class="cinema-theme__section-label">Cenas da galeria</p>
      <div class="cinema-theme__gallery">
        <img
          v-for="(photo, index) in content.photos"
          :key="photo.id"
          :src="photo.thumbnail || photo.url"
          :alt="`Recordação ${index + 1} de ${content.photos.length}`"
          loading="lazy"
        />
      </div>
    </section>

    <section class="cinema-theme__panel cinema-theme__panel--timeline">
      <p class="cinema-theme__section-label cinema-theme__section-label--gold">Nossa timeline</p>
      <ol v-if="timelineItems.length" class="cinema-theme__timeline">
        <li v-for="(item, index) in timelineItems" :key="index">
          <span class="cinema-theme__timeline-line" aria-hidden="true" />
          <div class="cinema-theme__timeline-card">
            <span class="cinema-theme__timeline-icon">{{ iconFor(item) }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p v-if="item.date" class="cinema-theme__timeline-date">{{ formatDate(item.date) }}</p>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
          </div>
        </li>
      </ol>
      <p v-else class="cinema-theme__timeline-empty">
        Adicione marcos especiais no editor para aparecer aqui.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

const letterOpen = ref(props.mode === 'preview')

const coupleHeadline = computed(() => {
  if (props.content.senderName && props.content.honoreeName) {
    return `${props.content.senderName.toUpperCase()} + ${props.content.honoreeName.toUpperCase()}`
  }
  return (props.content.honoreeName || props.content.title || 'VOCÊS').toUpperCase()
})

const tagline = computed(
  () => props.content.subtitle?.trim() || 'Uma história dirigida pelo amor',
)

const heroStyle = computed(() => {
  const photo = props.content.photos[0]?.url || props.content.photos[0]?.thumbnail
  if (!photo) {
    return { background: 'linear-gradient(180deg, #2e1a2e 0%, #0f0a12 100%)' }
  }
  return { backgroundImage: `url(${photo})` }
})

const showCounter = computed(
  () => Boolean(props.content.specialDate && props.content.specialDateConfig?.enabled !== false),
)

const messageText = computed(() => plainTimelineText(props.content.message))
const messagePreview = computed(() => {
  const text = messageText.value
  if (!text) return 'Sua mensagem aparecerá aqui.'
  return text.length > 120 ? `${text.slice(0, 117)}...` : text
})

const musicTitle = computed(() => props.content.music.title || 'Nenhuma música selecionada')

const timelineItems = computed(() => props.content.timeline.filter((item) => item.title?.trim()))

function iconFor(item: ExperienceTimelineItem) {
  return getEmotionDisplay(item.emotion)?.icon ?? '✨'
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.cinema-theme {
  --rom-countdown-accent: #e07a2f;
  --exp-ink: #fff;
  --exp-text: rgb(255 255 255 / 82%);
  --exp-muted: rgb(255 255 255 / 60%);
  min-height: 100%;
  padding: 0 0 28px;
  background: #0f0a12;
  color: #fff;
  font-family: Georgia, 'Times New Roman', serif;
}
.cinema-theme__hero {
  position: relative;
  min-height: 280px;
  background-size: cover;
  background-position: center;
}
.cinema-theme__hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(15 10 18 / 35%) 0%, rgb(15 10 18 / 92%) 100%),
    radial-gradient(circle at 20% 10%, rgb(224 122 47 / 18%), transparent 45%);
  backdrop-filter: blur(2px);
}
.cinema-theme__hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 280px;
  padding: 28px 18px 22px;
}
.cinema-theme__eyebrow {
  margin: 0 0 8px;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e5d1b1;
}
.cinema-theme__couple {
  margin: 0;
  font-size: clamp(1.6rem, 6vw, 2.4rem);
  line-height: 1.05;
  font-weight: 700;
}
.cinema-theme__tagline {
  margin: 10px 0 0;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 72%);
  font-family: system-ui, sans-serif;
}
.cinema-theme__countdown {
  margin: 16px 16px 0;
}
.cinema-theme__panel {
  margin: 16px 16px 0;
  padding: 16px;
  border-radius: 18px;
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 8%);
}
.cinema-theme__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.cinema-theme__panel-head h2 {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.cinema-theme__open {
  border: 1px solid rgb(255 255 255 / 18%);
  background: transparent;
  color: #e5d1b1;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: system-ui, sans-serif;
}
.cinema-theme__letter {
  margin: 14px 0 0;
  line-height: 1.65;
  font-style: italic;
  color: rgb(255 255 255 / 82%);
  white-space: pre-wrap;
}
.cinema-theme__letter--peek {
  opacity: 0.75;
}
.cinema-theme__section-label {
  margin: 0 0 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 55%);
  font-family: system-ui, sans-serif;
}
.cinema-theme__section-label--gold {
  color: #e5d1b1;
}
.cinema-theme__track {
  display: block;
  margin-bottom: 12px;
  font-size: 0.95rem;
  font-family: system-ui, sans-serif;
}
.cinema-theme__player {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}
.cinema-theme__play {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #e07a2f;
  color: #111;
  font-size: 0.85rem;
}
.cinema-theme__progress {
  height: 4px;
  border-radius: 999px;
  background: rgb(255 255 255 / 15%);
  overflow: hidden;
}
.cinema-theme__progress span {
  display: block;
  width: 12%;
  height: 100%;
  background: #e07a2f;
}
.cinema-theme__gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.cinema-theme__gallery img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
}
.cinema-theme__panel--timeline {
  position: relative;
}
.cinema-theme__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cinema-theme__timeline li {
  position: relative;
  padding-left: 18px;
}
.cinema-theme__timeline-line {
  position: absolute;
  left: 0;
  top: 4px;
  bottom: -14px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ff8c00 0%, #d35400 100%);
}
.cinema-theme__timeline-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
}
.cinema-theme__timeline-icon {
  font-size: 1.1rem;
}
.cinema-theme__timeline-date {
  margin: 2px 0 0;
  font-size: 0.76rem;
  color: #e5d1b1;
  font-family: system-ui, sans-serif;
}
.cinema-theme__timeline-empty {
  margin: 0;
  padding-left: 14px;
  border-left: 3px solid #d35400;
  color: rgb(255 255 255 / 55%);
  font-family: system-ui, sans-serif;
  font-size: 0.92rem;
  line-height: 1.5;
}
</style>
