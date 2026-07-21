<template>
  <Teleport to="body">
    <Transition name="memory-fade">
      <div v-if="place" class="memory-overlay" role="dialog" aria-modal="true" @click.self="$emit('close')">
        <article class="memory-panel">
          <button type="button" class="memory-panel__close" aria-label="Fechar" @click="$emit('close')">×</button>

          <header class="memory-panel__hero">
            <span class="memory-panel__emoji">{{ getPlaceEmoji(place) }}</span>
            <p class="memory-panel__type">{{ MAP_PLACE_TYPE_LABELS[place.place_type] }}</p>
            <h2>{{ place.title }}</h2>
            <p v-if="place.subtitle" class="memory-panel__subtitle">{{ place.subtitle }}</p>
            <div class="memory-panel__meta">
              <span v-if="place.memory_date">{{ formatMemoryDate(place.memory_date) }}</span>
              <span v-if="place.sentiment">{{ getSentimentEmoji(place.sentiment) }} {{ getSentimentLabel(place.sentiment) }}</span>
              <span v-if="counts.photos">{{ counts.photos }} foto{{ counts.photos > 1 ? 's' : '' }}</span>
              <span v-if="counts.videos">{{ counts.videos }} vídeo{{ counts.videos > 1 ? 's' : '' }}</span>
            </div>
          </header>

          <section v-if="photos.length" class="memory-panel__gallery">
            <figure
              v-for="(photo, index) in photos"
              :key="photo.id"
              class="memory-panel__polaroid"
              :style="{ animationDelay: `${index * 0.08}s` }"
            >
              <img :src="photo.url || photo.url_thumbnail || ''" alt="" loading="lazy" />
            </figure>
          </section>

          <section v-if="videos.length" class="memory-panel__videos">
            <video
              v-for="video in videos"
              :key="video.id"
              :src="video.url || ''"
              controls
              playsinline
              preload="metadata"
            />
          </section>

          <section v-if="place.description" class="memory-panel__story">
            <h3>A memória</h3>
            <p>{{ place.description }}</p>
          </section>

          <section v-if="content.letter" class="memory-panel__letter">
            <h3>Carta</h3>
            <div class="memory-panel__letter-body">{{ content.letter }}</div>
          </section>

          <section v-if="content.moment_timeline?.length" class="memory-panel__moment-timeline">
            <h3>Linha do tempo deste momento</h3>
            <ol>
              <li v-for="entry in content.moment_timeline" :key="entry.id">
                <strong>{{ entry.label }}</strong>
                <span v-if="entry.time">{{ entry.time }}</span>
              </li>
            </ol>
          </section>

          <section v-if="chips.length" class="memory-panel__chips">
            <span v-for="chip in chips" :key="chip" class="memory-chip">{{ chip }}</span>
          </section>

          <footer v-if="content.music_url" class="memory-panel__music">
            <p>🎵 {{ content.music_title || 'Música deste momento' }}</p>
            <audio :src="content.music_url" controls preload="none" />
          </footer>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MapPlace } from '@/api/types'
import { countPlaceMedia, parsePlaceContent } from '../mapPlaceContent'
import { formatMemoryDate } from '../mapJourney'
import {
  getPlaceEmoji,
  getSentimentEmoji,
  getSentimentLabel,
  MAP_PLACE_TYPE_LABELS,
} from '../mapPlaceTypes'

const props = defineProps<{ place: MapPlace | null }>()
defineEmits<{ close: [] }>()

const content = computed(() => (props.place ? parsePlaceContent(props.place) : parsePlaceContent({ content_json: {} } as MapPlace)))
const counts = computed(() => (props.place ? countPlaceMedia(props.place) : { photos: 0, videos: 0 }))

const photos = computed(() => props.place?.media?.filter((m) => m.media_type === 'photo') ?? [])
const videos = computed(() => props.place?.media?.filter((m) => m.media_type === 'video') ?? [])

const chips = computed(() => {
  if (!content.value || !props.place) return []
  const items: string[] = []
  content.value.people?.forEach((p) => items.push(`👥 ${p}`))
  if (content.value.weather) items.push(`🌤 ${content.value.weather}`)
  content.value.objects?.forEach((o) => items.push(`✨ ${o}`))
  if (props.place.city) items.push(`📍 ${props.place.city}`)
  return items
})
</script>

<style scoped>
.memory-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(10, 8, 12, 0.72);
  backdrop-filter: blur(10px);
}
.memory-panel {
  position: relative;
  width: min(720px, 100%);
  max-height: min(90vh, 900px);
  overflow: auto;
  padding: 28px 24px 32px;
  border-radius: 28px;
  background: linear-gradient(165deg, #fff9fc 0%, #ffffff 42%, #fff5fa 100%);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.35);
}
.memory-panel__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(225, 29, 122, 0.08);
  color: #be185d;
  font-size: 1.4rem;
  line-height: 1;
}
.memory-panel__hero {
  text-align: center;
  margin-bottom: 24px;
}
.memory-panel__emoji {
  font-size: 2.4rem;
  display: block;
  margin-bottom: 8px;
}
.memory-panel__type {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e11d7a;
  font-weight: 700;
}
.memory-panel__hero h2 {
  margin: 8px 0 4px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 600;
}
.memory-panel__subtitle {
  color: #6b7280;
  margin: 0;
}
.memory-panel__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.82rem;
  color: #6b7280;
}
.memory-panel__meta span {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(225, 29, 122, 0.06);
}
.memory-panel__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.memory-panel__polaroid {
  margin: 0;
  padding: 8px 8px 14px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  transform: rotate(-2deg);
  animation: polaroid-in 0.55s ease both;
}
.memory-panel__polaroid:nth-child(even) {
  transform: rotate(2deg);
}
.memory-panel__polaroid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}
.memory-panel__videos {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}
.memory-panel__videos video {
  width: 100%;
  border-radius: 16px;
  background: #111;
}
.memory-panel__story,
.memory-panel__letter,
.memory-panel__moment-timeline,
.memory-panel__music {
  margin-bottom: 20px;
}
.memory-panel__story h3,
.memory-panel__letter h3,
.memory-panel__moment-timeline h3 {
  margin: 0 0 8px;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e11d7a;
}
.memory-panel__story p,
.memory-panel__letter-body {
  margin: 0;
  line-height: 1.7;
  white-space: pre-wrap;
}
.memory-panel__letter-body {
  padding: 18px;
  border-radius: 16px;
  background: rgba(255, 247, 251, 0.9);
  border: 1px solid rgba(225, 29, 122, 0.12);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.08rem;
}
.memory-panel__moment-timeline ol {
  margin: 0;
  padding-left: 18px;
}
.memory-panel__moment-timeline li {
  margin-bottom: 8px;
}
.memory-panel__moment-timeline span {
  display: block;
  font-size: 0.82rem;
  color: #6b7280;
}
.memory-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.memory-chip {
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(225, 29, 122, 0.14);
  font-size: 0.82rem;
}
.memory-panel__music audio {
  width: 100%;
  margin-top: 8px;
}
@keyframes polaroid-in {
  from {
    opacity: 0;
    transform: translateY(16px) rotate(0deg) scale(0.96);
  }
}
.memory-fade-enter-active,
.memory-fade-leave-active {
  transition: opacity 0.35s ease;
}
.memory-fade-enter-from,
.memory-fade-leave-to {
  opacity: 0;
}
</style>
