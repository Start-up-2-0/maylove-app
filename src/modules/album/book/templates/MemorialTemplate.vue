<template>
  <div class="mem" :class="[`mem--${mode}`]" :style="rootStyle">
    <EffectsLayer :effects="['stars']" :accent="accentColor" :density="10" />

    <header class="mem-hero">
      <div v-if="book.coverPhotoUrl" class="mem-hero__photo">
        <img :src="book.coverPhotoUrl" :alt="book.title" />
        <div class="mem-hero__veil" />
      </div>
      <div class="mem-hero__content">
        <p class="mem-hero__eyebrow">{{ eyebrow }}</p>
        <h1 class="mem-hero__title">{{ heroTitle }}</h1>
        <p v-if="book.subtitle" class="mem-hero__dates">{{ book.subtitle }}</p>
        <p v-if="honoreeLabel" class="mem-hero__honoree">{{ honoreeLabel }}</p>
      </div>
    </header>

    <section v-if="book.closingMessage" class="mem-bio">
      <h2>Biografia</h2>
      <RichText :text="book.closingMessage" class="mem-bio__text" />
    </section>

    <section v-if="timelineEntries.length" class="mem-timeline" aria-labelledby="mem-tl-title">
      <h2 id="mem-tl-title">Linha do Tempo</h2>
      <ol class="mem-timeline__list">
        <li v-for="entry in timelineEntries" :key="entry.id" class="mem-timeline__item">
          <span class="mem-timeline__marker" aria-hidden="true" />
          <article class="mem-timeline__card">
            <figure v-if="entry.photoUrl" class="mem-timeline__photo">
              <img :src="entry.photoUrl" :alt="entry.title || 'Memória'" loading="lazy" />
            </figure>
            <div class="mem-timeline__body">
              <time v-if="entry.date" class="mem-timeline__date">{{ entry.date }}</time>
              <h3 v-if="entry.title">{{ entry.title }}</h3>
              <RichText v-if="entry.description" :text="entry.description" class="mem-timeline__desc" />
            </div>
          </article>
        </li>
      </ol>
    </section>

    <section v-if="galleryPhotos.length" class="mem-gallery" aria-labelledby="mem-gallery-title">
      <h2 id="mem-gallery-title">Recordações</h2>
      <div class="mem-gallery__grid" role="list">
        <button
          v-for="(photo, index) in galleryPhotos"
          :key="photo.id"
          type="button"
          class="mem-gallery__item"
          role="listitem"
          @click="openLightbox(index)"
        >
          <img :src="photo.url" :alt="photo.title || 'Recordação'" loading="lazy" />
          <span v-if="photo.title || photo.caption" class="mem-gallery__caption">
            <strong v-if="photo.title">{{ photo.title }}</strong>
            <small v-if="photo.caption">{{ photo.caption }}</small>
          </span>
        </button>
      </div>
    </section>

    <MemorialTributePanel v-if="mode === 'full' && albumSlug" :album-slug="albumSlug" />

    <footer v-if="book.signature" class="mem-footer">
      <p class="mem-footer__sign">{{ book.signature }}</p>
      <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="book.title" />
    </footer>

    <PhotoLightbox
      :open="lightboxOpen"
      :photos="galleryPhotos"
      :index="lightboxIndex"
      @close="lightboxOpen = false"
      @update:index="lightboxIndex = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import EffectsLayer from '@/components/experience/shared/EffectsLayer.vue'
import PhotoLightbox from '../shared/PhotoLightbox.vue'
import MemorialTributePanel from './MemorialTributePanel.vue'
import { getBookTheme, getThemeCssVars, fontPresetVars } from '../themes'
import { normalizeBookConfig } from '../bookConfig'
import type { BookRenderMode, MemoryBookModel, MemoryBookPhoto } from '../types'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
  albumSlug?: string
}>()

const bookConfig = computed(() => normalizeBookConfig(props.book.bookConfig))
const theme = computed(() => getBookTheme('memorial-luz'))
const fonts = computed(() => fontPresetVars(bookConfig.value.fonts.preset))
const accentColor = computed(
  () => bookConfig.value.colors.accent || props.book.colorPrimary || '#c9a86a',
)

const rootStyle = computed(() => ({
  ...getThemeCssVars(theme.value, accentColor.value, {
    paper: bookConfig.value.colors.paper || '#14110f',
    ink: bookConfig.value.colors.ink || '#f0ebe3',
    page: bookConfig.value.colors.page || '#1c1814',
    fontDisplay: fonts.value.display,
    fontBody: fonts.value.body,
  }),
  '--mem-accent': accentColor.value,
  '--mem-ink': bookConfig.value.colors.ink || '#f0ebe3',
  '--mem-muted': '#a89f94',
}))

const eyebrow = computed(
  () => bookConfig.value.cover.eyebrow?.trim() || theme.value.cover.eyebrow || 'EM MEMÓRIA',
)

const heroTitle = computed(() => props.book.title || 'Em memória')

const honoreeLabel = computed(() => {
  const sign = props.book.signature?.trim()
  if (!sign) return null
  if (heroTitle.value.toLowerCase().includes(sign.toLowerCase())) return null
  return sign
})

const galleryPhotos = computed<MemoryBookPhoto[]>(() =>
  props.book.contentPages.flatMap((page) => page.photos).filter((p) => p.url),
)

const timelineEntries = computed(() => {
  const entries = props.book.contentPages
    .map((page, index) => {
      const photo = page.photos[0]
      return {
        id: `${page.pageNo}-${index}`,
        date: page.memoryDate ?? photo?.memoryDate,
        title: page.title ?? photo?.title,
        description: page.message ?? page.caption ?? photo?.caption,
        photoUrl: photo?.url,
        sortKey: parseSortDate(page.memoryDate ?? photo?.memoryDate),
      }
    })
    .filter((entry) => entry.date || entry.title || entry.description)

  return entries.sort((a, b) => a.sortKey - b.sortKey)
})

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function parseSortDate(value?: string | null): number {
  if (!value) return Number.MAX_SAFE_INTEGER
  const iso = /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null
  if (iso) return new Date(`${iso}T12:00:00`).getTime()
  const year = value.match(/\b(19|20)\d{2}\b/)
  if (year) return new Date(`${year[0]}-01-01T12:00:00`).getTime()
  return Number.MAX_SAFE_INTEGER
}
</script>

<style scoped>
.mem {
  position: relative;
  min-height: 100%;
  color: var(--mem-ink, #f0ebe3);
  background: linear-gradient(180deg, #14110f 0%, #1c1814 48%, #14110f 100%);
  font-family: var(--book-font-body, 'Hanken Grotesk', sans-serif);
  overflow-x: hidden;
}

.mem--preview {
  min-height: auto;
}

.mem :deep(.exp-effects) {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.mem-hero,
.mem-bio,
.mem-timeline,
.mem-gallery,
.mem-footer {
  position: relative;
  z-index: 1;
}

.mem-hero {
  position: relative;
  min-height: min(72vh, 640px);
  display: grid;
  place-items: center;
  text-align: center;
  padding: clamp(48px, 10vw, 96px) clamp(20px, 5vw, 40px);
  overflow: hidden;
}

.mem-hero__photo {
  position: absolute;
  inset: 0;
}

.mem-hero__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.85);
}

.mem-hero__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 17, 15, 0.55) 0%,
    rgba(20, 17, 15, 0.82) 55%,
    #14110f 100%
  );
}

.mem-hero__content {
  position: relative;
  max-width: 640px;
}

.mem-hero__eyebrow {
  margin: 0 0 12px;
  font-size: 0.76rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--mem-accent, #c9a86a);
}

.mem-hero__title {
  margin: 0;
  font-family: var(--book-font-display, 'Cormorant Garamond', serif);
  font-size: clamp(2.2rem, 8vw, 3.6rem);
  font-weight: 500;
  line-height: 1.12;
}

.mem-hero__dates {
  margin: 14px 0 0;
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: var(--mem-muted, #a89f94);
  letter-spacing: 0.04em;
}

.mem-hero__honoree {
  margin: 10px 0 0;
  font-family: var(--book-font-display, 'Cormorant Garamond', serif);
  font-style: italic;
  color: color-mix(in srgb, var(--mem-accent, #c9a86a) 80%, #fff);
}

.mem-bio,
.mem-timeline,
.mem-gallery {
  max-width: 760px;
  margin: 0 auto;
  padding: clamp(28px, 5vw, 48px) clamp(16px, 4vw, 24px);
}

.mem-bio h2,
.mem-timeline h2,
.mem-gallery h2 {
  margin: 0 0 20px;
  text-align: center;
  font-family: var(--book-font-display, 'Cormorant Garamond', serif);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 500;
  color: var(--mem-accent, #c9a86a);
}

.mem-bio__text {
  font-size: 1.05rem;
  line-height: 1.75;
  color: color-mix(in srgb, var(--mem-ink, #f0ebe3) 92%, transparent);
  text-align: center;
}

.mem-timeline__list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 clamp(20px, 4vw, 32px);
  position: relative;
}

.mem-timeline__list::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: color-mix(in srgb, var(--mem-accent, #c9a86a) 35%, transparent);
}

.mem-timeline__item {
  position: relative;
  margin-bottom: 24px;
  padding-left: 28px;
}

.mem-timeline__marker {
  position: absolute;
  left: 0;
  top: 18px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--mem-accent, #c9a86a);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--mem-accent, #c9a86a) 18%, transparent);
}

.mem-timeline__card {
  padding: 16px;
  border-radius: 12px;
  background: color-mix(in srgb, #fff 4%, #1c1814);
  border: 1px solid color-mix(in srgb, var(--mem-accent, #c9a86a) 14%, transparent);
}

.mem-timeline__photo {
  margin: 0 0 12px;
  overflow: hidden;
  border-radius: 8px;
}

.mem-timeline__photo img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: cover;
}

.mem-timeline__date {
  display: block;
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mem-accent, #c9a86a);
  margin-bottom: 6px;
}

.mem-timeline__body h3 {
  margin: 0 0 8px;
  font-family: var(--book-font-display, 'Cormorant Garamond', serif);
  font-size: 1.2rem;
}

.mem-timeline__desc {
  color: var(--mem-muted, #a89f94);
  font-size: 0.94rem;
  line-height: 1.6;
}

.mem-gallery__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
}

.mem-gallery__item {
  position: relative;
  padding: 0;
  border: none;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #1c1814;
  aspect-ratio: 4 / 5;
}

.mem-gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 280ms ease;
}

.mem-gallery__item:hover img {
  transform: scale(1.04);
}

.mem-gallery__caption {
  position: absolute;
  inset: auto 0 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  text-align: left;
}

.mem-gallery__caption strong {
  display: block;
  font-size: 0.82rem;
  color: #fff;
}

.mem-gallery__caption small {
  display: block;
  font-size: 0.72rem;
  color: #ccc;
  margin-top: 2px;
}

.mem-footer {
  text-align: center;
  padding: clamp(32px, 6vw, 56px) clamp(16px, 4vw, 24px);
  border-top: 1px solid color-mix(in srgb, var(--mem-accent, #c9a86a) 12%, transparent);
}

.mem-footer__sign {
  margin: 0 0 20px;
  font-family: var(--book-font-display, 'Cormorant Garamond', serif);
  font-style: italic;
  font-size: 1.3rem;
  color: var(--mem-accent, #c9a86a);
}
</style>
