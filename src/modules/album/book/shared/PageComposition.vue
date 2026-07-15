<template>
  <div
    class="page-comp"
    :class="[
      `page-comp--${page.layout}`,
      `page-comp--${theme.strategy}`,
      { 'page-comp--scrapbook': theme.features.scrapbookDecor },
      { 'page-comp--texture': theme.features.textureOverlay },
    ]"
  >
    <span v-if="theme.features.scrapbookDecor" class="page-comp__tape" aria-hidden="true" />

    <!-- Abertura de capítulo -->
    <template v-if="page.layout === 'chapter-opener'">
      <div class="page-comp__chapter">
        <span class="page-comp__chapter-num">{{ String(page.pageNo).padStart(2, '0') }}</span>
        <h2 class="page-comp__chapter-title">{{ page.chapterTitle || page.title || 'Capítulo' }}</h2>
        <p v-if="page.memoryDate" class="page-comp__chapter-date">{{ page.memoryDate }}</p>
        <span class="page-comp__chapter-rule" />
      </div>
    </template>

    <!-- Só texto -->
    <template v-else-if="page.layout === 'text-focus'">
      <div class="page-comp__text-only">
        <p v-if="page.memoryDate" class="page-comp__meta">{{ page.memoryDate }}</p>
        <h2 v-if="page.title" class="page-comp__title">{{ page.title }}</h2>
        <RichText v-if="page.message" :text="page.message" class="page-comp__body" />
      </div>
    </template>

    <!-- Polaroid -->
    <template v-else-if="page.layout === 'polaroid-memory'">
      <div class="page-comp__polaroid-grid">
        <template v-for="(photo, index) in page.photos" :key="photo.id">
          <PolaroidFrame
            v-if="photo.url"
            :url="photo.url"
            :title="photo.title"
            :caption="photo.caption"
            :memory-date="photo.memoryDate"
            :frame-style="frameStyle"
            :rotation="index % 2 === 0 ? -2 : 2"
          />
        </template>
      </div>
      <div v-if="page.message && page.photos.length <= 1" class="page-comp__aside">
        <RichText :text="page.message" />
      </div>
    </template>

    <!-- Demais layouts com fotos — galeria Polaroid -->
    <template v-else>
      <div
        class="page-comp__polaroid-grid"
        :class="`page-comp__polaroid-grid--${Math.min(page.photos.length, 3)}`"
      >
        <template v-for="(photo, index) in page.photos" :key="photo.id">
          <PolaroidFrame
            v-if="photo.url"
            :url="photo.url"
            :title="photo.title"
            :caption="photo.caption"
            :memory-date="photo.memoryDate"
            :frame-style="frameStyle"
            :rotation="index % 2 === 0 ? -1.5 : 1.5"
          />
        </template>
      </div>

      <aside v-if="showCaptionBlock" class="page-comp__caption-block">
        <p v-if="page.memoryDate" class="page-comp__meta">{{ page.memoryDate }}</p>
        <h2 v-if="page.title" class="page-comp__title">{{ page.title }}</h2>
        <RichText v-if="page.message" :text="page.message" class="page-comp__body" />
      </aside>
    </template>

    <span v-if="showPageNumber" class="page-comp__pagenum">{{ page.pageNo }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import type { BookTheme } from '../themes'
import type { BookFrameStyle } from '../frameStyles'
import PolaroidFrame from './PolaroidFrame.vue'
import type { MemoryBookContentPage } from '../types'

const props = withDefaults(
  defineProps<{
    page: MemoryBookContentPage
    theme: BookTheme
    frameStyle?: BookFrameStyle | string | null
  }>(),
  { frameStyle: 'classic' },
)

const showPageNumber = computed(() => props.theme.features.pageNumbers)

/** Bloco de página só em foto única — multi-foto usa legenda por imagem */
const showCaptionBlock = computed(() => {
  if (props.page.layout === 'full-bleed') return false
  if (props.page.photos.length > 1) return false
  return Boolean(props.page.title || props.page.message || props.page.memoryDate)
})
</script>

<style scoped>
.page-comp {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: inherit;
  padding: clamp(18px, 4vw, 32px);
  font-family: var(--book-font-body);
  color: var(--book-ink);
  background: var(--book-paper);
  overflow: visible;
}

.page-comp--texture::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
  pointer-events: none;
}

.page-comp__tape {
  position: absolute;
  top: 12px;
  right: 8%;
  width: 64px;
  height: 18px;
  background: color-mix(in srgb, var(--book-accent) 30%, #f5e6b8);
  transform: rotate(8deg);
  opacity: 0.9;
  z-index: 2;
}

.page-comp__pagenum {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--book-muted);
}

/* Capítulo */
.page-comp__chapter {
  margin: auto;
  text-align: center;
  padding: 24px;
}

.page-comp__chapter-num {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: var(--book-accent);
}

.page-comp__chapter-title {
  font-family: var(--book-font-display);
  font-size: clamp(1.6rem, 5vw, 2.4rem);
  margin: 10px 0 6px;
  font-weight: 500;
}

.page-comp__chapter-date {
  font-size: 0.85rem;
  color: var(--book-muted);
  font-style: italic;
}

.page-comp__chapter-rule {
  display: block;
  width: 48px;
  height: 2px;
  margin: 16px auto 0;
  background: var(--book-accent);
}

/* Texto exclusivo */
.page-comp__text-only {
  margin: auto;
  max-width: 38ch;
  text-align: center;
  padding: 20px;
}

.page-comp__meta {
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--book-accent);
  margin: 0 0 8px;
}

.page-comp__title {
  font-family: var(--book-font-display);
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 500;
  margin: 0 0 10px;
  line-height: 1.2;
}

.page-comp__body {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--book-muted);
}

/* Full bleed */
.page-comp--full-bleed {
  padding: 0;
}

.page-comp--full-bleed .page-comp__media--full-bleed {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  place-items: center;
}

.page-comp--full-bleed .page-comp__photo {
  margin: 0;
  width: 100%;
  border-radius: 0;
  box-shadow: none;
}

.page-comp--full-bleed .page-comp__photo img {
  width: 100%;
  height: auto;
  max-height: min(82vh, 960px);
  object-fit: contain;
}

/* Hero + legenda */
.page-comp--hero-caption {
  display: grid;
  grid-template-rows: auto auto;
  padding: 0;
}

.page-comp__media--hero-caption .page-comp__photo {
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

.page-comp__media--hero-caption img {
  width: 100%;
  height: auto;
  max-height: min(72vh, 820px);
  object-fit: contain;
}

.page-comp--hero-caption .page-comp__caption-block {
  padding: clamp(16px, 4vw, 28px);
}

/* Assimétrico 2 fotos */
.page-comp--asymmetric-duo .page-comp__media--asymmetric-duo {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  grid-template-rows: auto auto;
  gap: 10px;
  align-items: start;
  flex: 1;
}

.page-comp__media--asymmetric-duo .page-comp__photo--0 {
  grid-row: span 2;
}

.page-comp__photo {
  margin: 0;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: var(--book-shadow);
  background: color-mix(in srgb, var(--book-paper) 88%, #ebe4dc);
}

.page-comp__photo img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(70vh, 760px);
  object-fit: contain;
  object-position: center;
}

/* Editorial trio */
.page-comp--editorial-trio .page-comp__media--editorial-trio {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: auto auto;
  gap: 10px;
  align-items: start;
  flex: 1;
}

.page-comp__media--editorial-trio .page-comp__photo--0 {
  grid-row: span 2;
}

/* Collage */
.page-comp--collage-grid .page-comp__media--collage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  align-items: start;
  flex: 1;
}

.page-comp__mini-cap {
  display: grid;
  gap: 4px;
  padding: 8px 10px 10px;
  text-align: center;
  background: color-mix(in srgb, var(--book-paper) 92%, transparent);
}

.page-comp__mini-cap--rich {
  text-align: left;
}

.page-comp__mini-date {
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--book-accent);
}

.page-comp__mini-title {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--book-ink);
}

.page-comp__mini-body {
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--book-muted);
}

/* Polaroid grid */
.page-comp__polaroid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: clamp(16px, 3vw, 24px);
  place-content: center;
  flex: 1;
  width: 100%;
}

.page-comp__polaroid-grid--1 {
  grid-template-columns: minmax(180px, 280px);
}

.page-comp__polaroid-grid--2 {
  grid-template-columns: repeat(2, minmax(140px, 240px));
}

.page-comp__polaroid-frame {
  margin: 0;
  padding: 10px 10px 14px;
  background: #fff;
  box-shadow: 0 14px 28px -16px rgba(0, 0, 0, 0.45);
  transform: rotate(-1.5deg);
}

.page-comp__polaroid:nth-child(even) .page-comp__polaroid-frame {
  transform: rotate(1.5deg);
}

.page-comp__polaroid-frame img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(64vh, 640px);
  object-fit: contain;
  object-position: center;
  filter: sepia(0.12) contrast(1.06) saturate(0.92);
}

.page-comp__polaroid-cap {
  min-height: 40px;
  padding-top: 8px;
  text-align: center;
  font-family: var(--book-font-accent);
  font-size: 1.05rem;
  color: var(--book-ink);
}

.page-comp__aside {
  margin-top: 12px;
  padding: 0 8px;
  font-family: var(--book-font-accent);
  font-size: 1.15rem;
  text-align: center;
}

/* Magazine variant */
.page-comp--magazine .page-comp__title {
  font-family: var(--book-font-display);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Luxury — mais espaço */
.page-comp--luxury {
  padding: clamp(24px, 5vw, 40px);
}

.page-comp--luxury .page-comp__caption-block {
  padding-top: 20px;
}

@media (max-width: 640px) {
  .page-comp--asymmetric-duo .page-comp__media--asymmetric-duo,
  .page-comp--editorial-trio .page-comp__media--editorial-trio {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .page-comp__media--asymmetric-duo .page-comp__photo--0,
  .page-comp__media--editorial-trio .page-comp__photo--0 {
    grid-row: auto;
  }
}
</style>
