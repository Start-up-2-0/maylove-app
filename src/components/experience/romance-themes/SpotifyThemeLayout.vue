<template>
  <div class="spotify-theme">
    <section class="spotify-theme__hero">
      <div
        class="spotify-theme__cover"
        :style="coverStyle"
      />
      <div class="spotify-theme__hero-text">
        <h1 class="spotify-theme__couple">{{ coupleLabel }}</h1>
        <p v-if="sinceLabel" class="spotify-theme__since">{{ sinceLabel }}</p>
      </div>
    </section>

    <RomanceCountdownGrid
      v-if="showCounter"
      :content="content"
      root-class="spotify-theme__countdown"
    />

    <section v-if="content.music.url" class="spotify-theme__player">
      <div class="spotify-theme__player-row">
        <div class="spotify-theme__player-art" :style="coverStyle" />
        <div class="spotify-theme__player-meta">
          <strong>{{ musicTitle }}</strong>
          <span>{{ coupleLabel }}</span>
        </div>
        <span class="spotify-theme__heart" aria-hidden="true">♡</span>
      </div>
      <div class="spotify-theme__progress">
        <span>0:00</span>
        <div class="spotify-theme__progress-bar"><span /></div>
        <span>0:00</span>
      </div>
    </section>

    <section v-if="content.photos.length" class="spotify-theme__section">
      <p class="spotify-theme__eyebrow">Álbum</p>
      <h2 class="spotify-theme__section-title">Nossas Fotos</h2>
      <div class="spotify-theme__photos">
        <img
          v-for="photo in content.photos"
          :key="photo.id"
          :src="photo.thumbnail || photo.url"
          alt=""
          loading="lazy"
        />
      </div>
    </section>

    <section v-if="messageText" class="spotify-theme__section">
      <p class="spotify-theme__eyebrow">Mensagem especial</p>
      <h2 v-if="content.title" class="spotify-theme__section-title">{{ content.title }}</h2>
      <p class="spotify-theme__message">{{ messageText }}</p>
    </section>

    <section v-if="timelineItems.length" class="spotify-theme__section">
      <p class="spotify-theme__eyebrow">Nossa timeline</p>
      <ol class="spotify-theme__timeline">
        <li v-for="(item, index) in timelineItems" :key="index">
          <span class="spotify-theme__timeline-icon">{{ iconFor(item) }}</span>
          <div>
            <strong>{{ item.title }}</strong>
            <p v-if="item.date" class="spotify-theme__timeline-date">{{ formatDate(item.date) }}</p>
            <p v-if="item.description">{{ item.description }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const coupleLabel = computed(() => {
  if (props.content.senderName && props.content.honoreeName) {
    return `${props.content.senderName} & ${props.content.honoreeName}`
  }
  return props.content.honoreeName || props.content.title || 'Vocês'
})

const coverPhoto = computed(() => props.content.photos[0]?.url || props.content.photos[0]?.thumbnail || '')

const coverStyle = computed(() =>
  coverPhoto.value
    ? { backgroundImage: `url(${coverPhoto.value})` }
    : { background: 'linear-gradient(145deg, #1db954 0%, #121212 100%)' },
)

const showCounter = computed(
  () => Boolean(props.content.specialDate && props.content.specialDateConfig?.enabled !== false),
)

const sinceLabel = computed(() => {
  if (!props.content.specialDate) return ''
  const year = new Date(props.content.specialDate).getFullYear()
  return Number.isNaN(year) ? 'Juntos desde sempre' : `Juntos desde ${year}`
})

const musicTitle = computed(() => props.content.music.title || 'Nossa trilha')

const messageText = computed(() => plainTimelineText(props.content.message))

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
.spotify-theme {
  --rom-countdown-accent: #1db954;
  min-height: 100%;
  padding: 20px 16px 28px;
  background: #121212;
  color: #fff;
}
.spotify-theme__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  margin-bottom: 18px;
}
.spotify-theme__cover {
  width: min(100%, 220px);
  aspect-ratio: 1;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 18px 40px rgb(0 0 0 / 45%);
}
.spotify-theme__couple {
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.spotify-theme__since {
  margin: 4px 0 0;
  color: rgb(255 255 255 / 65%);
  font-size: 0.92rem;
}
.spotify-theme__countdown {
  margin-bottom: 18px;
}
.spotify-theme__player {
  margin-bottom: 22px;
  padding: 12px;
  border-radius: 14px;
  background: #181818;
}
.spotify-theme__player-row {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 10px;
  align-items: center;
}
.spotify-theme__player-art {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
}
.spotify-theme__player-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.spotify-theme__player-meta strong {
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.spotify-theme__player-meta span {
  font-size: 0.76rem;
  color: rgb(255 255 255 / 55%);
}
.spotify-theme__heart {
  font-size: 1.1rem;
  color: rgb(255 255 255 / 70%);
}
.spotify-theme__progress {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  font-size: 0.68rem;
  color: rgb(255 255 255 / 45%);
}
.spotify-theme__progress-bar {
  height: 4px;
  border-radius: 999px;
  background: rgb(255 255 255 / 18%);
  overflow: hidden;
}
.spotify-theme__progress-bar span {
  display: block;
  width: 18%;
  height: 100%;
  background: #fff;
}
.spotify-theme__section {
  margin-bottom: 22px;
}
.spotify-theme__eyebrow {
  margin: 0 0 4px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1db954;
}
.spotify-theme__section-title {
  margin: 0 0 12px;
  font-size: 1.25rem;
  font-weight: 800;
}
.spotify-theme__photos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.spotify-theme__photos img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}
.spotify-theme__message {
  margin: 0;
  line-height: 1.6;
  color: rgb(255 255 255 / 82%);
  white-space: pre-wrap;
}
.spotify-theme__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.spotify-theme__timeline li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #181818;
}
.spotify-theme__timeline-icon {
  font-size: 1.2rem;
}
.spotify-theme__timeline-date {
  margin: 2px 0 0;
  font-size: 0.76rem;
  color: #1db954;
}
</style>
