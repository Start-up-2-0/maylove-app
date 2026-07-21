<template>
  <div
    class="page-comp"
    :class="[
      `page-comp--${page.layout}`,
      `page-comp--${theme.strategy}`,
      { 'page-comp--texture': theme.features.textureOverlay },
    ]"
  >
    <!-- Abertura de capítulo -->
    <template v-if="page.layout === 'chapter-opener'">
      <div class="page-comp__chapter">
        <span class="page-comp__chapter-num">{{ String(page.pageNo).padStart(2, '0') }}</span>
        <h2 class="page-comp__chapter-title">{{ page.chapterTitle || page.title || 'Capítulo' }}</h2>
        <p v-if="page.memoryDate" class="page-comp__chapter-date">{{ page.memoryDate }}</p>
        <span class="page-comp__chapter-rule" />
      </div>
    </template>

    <!-- Só texto — pausa narrativa -->
    <template v-else-if="page.layout === 'text-focus'">
      <div class="page-comp__text-only">
        <p v-if="page.memoryDate" class="page-comp__meta">{{ page.memoryDate }}</p>
        <h2 v-if="page.title" class="page-comp__title">{{ page.title }}</h2>
        <RichText v-if="page.message" :text="page.message" class="page-comp__body page-comp__body--lead" />
      </div>
    </template>

    <!-- Polaroid scrapbook -->
    <template v-else-if="page.layout === 'polaroid-memory'">
      <PolaroidScrapStage :photos="page.photos" :frame-style="frameStyle" />
      <p v-if="page.title" class="page-comp__scrap-title">{{ page.title }}</p>
    </template>

    <!-- Full bleed -->
    <template v-else-if="page.layout === 'full-bleed'">
      <div class="page-comp__media page-comp__media--full-bleed">
        <figure v-if="leadPhoto" class="page-comp__photo">
          <img :src="leadPhoto.url" :alt="leadPhoto.title || 'Memória'" loading="lazy" />
        </figure>
      </div>
    </template>

    <!-- Página dupla (spread) -->
    <template v-else-if="page.layout === 'double-spread'">
      <div class="page-comp__media page-comp__media--double-spread">
        <figure v-if="leadPhoto" class="page-comp__photo">
          <img :src="leadPhoto.url" :alt="leadPhoto.title || 'Memória'" loading="lazy" />
        </figure>
      </div>
      <aside v-if="showCaptionBlock" class="page-comp__caption-block page-comp__caption-block--spread">
        <p v-if="captionMetaLine" class="page-comp__meta">{{ captionMetaLine }}</p>
        <h2 v-if="captionTitle" class="page-comp__title">{{ captionTitle }}</h2>
        <RichText v-if="captionBody" :text="captionBody" class="page-comp__body" />
      </aside>
    </template>

    <!-- Hero + legenda -->
    <template v-else-if="page.layout === 'hero-caption'">
      <div class="page-comp__media page-comp__media--hero-caption">
        <figure v-if="leadPhoto" class="page-comp__photo">
          <img :src="leadPhoto.url" :alt="leadPhoto.title || 'Memória'" loading="lazy" />
        </figure>
      </div>
      <aside v-if="showCaptionBlock" class="page-comp__caption-block">
        <p v-if="captionMetaLine" class="page-comp__meta">{{ captionMetaLine }}</p>
        <h2 v-if="captionTitle" class="page-comp__title">{{ captionTitle }}</h2>
        <RichText v-if="captionBody" :text="captionBody" class="page-comp__body" />
      </aside>
    </template>

    <!-- Duo assimétrico / trio editorial / collage -->
    <template v-else>
      <div class="page-comp__media" :class="`page-comp__media--${page.layout}`">
        <figure
          v-for="(photo, index) in page.photos"
          :key="photo.id"
          class="page-comp__photo"
          :class="`page-comp__photo--${index}`"
        >
          <img :src="photo.url" :alt="photo.title || 'Memória'" loading="lazy" />
          <figcaption
            v-if="photo.title || photo.caption || photo.memoryDate || photo.placeName"
            class="page-comp__mini-cap"
            :class="{ 'page-comp__mini-cap--rich': Boolean(photo.caption) }"
          >
            <span v-if="photo.memoryDate || photo.placeName" class="page-comp__mini-date">
              {{ [photo.memoryDate, photo.placeName].filter(Boolean).join(' · ') }}
            </span>
            <span v-if="photo.title" class="page-comp__mini-title">{{ photo.title }}</span>
            <RichText v-if="photo.caption" :text="photo.caption" class="page-comp__mini-body" />
          </figcaption>
        </figure>
      </div>
    </template>

    <span v-if="showPageNumber" class="page-comp__pagenum">{{ page.pageNo }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import type { BookTheme } from '../themes'
import type { BookFrameStyle } from '../frameStyles'
import PolaroidScrapStage from './PolaroidScrapStage.vue'
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

const leadPhoto = computed(() => props.page.photos[0] ?? null)

const captionTitle = computed(
  () => props.page.title?.trim() || leadPhoto.value?.title?.trim() || '',
)

const captionBody = computed(
  () => props.page.message?.trim() || leadPhoto.value?.caption?.trim() || '',
)

const captionDate = computed(
  () => props.page.memoryDate?.trim() || leadPhoto.value?.memoryDate?.trim() || '',
)

const captionPlace = computed(
  () => leadPhoto.value?.placeName?.trim() || '',
)

const captionMetaLine = computed(() =>
  [captionDate.value, captionPlace.value].filter(Boolean).join(' · '),
)

const showCaptionBlock = computed(() =>
  Boolean(captionTitle.value || captionBody.value || captionMetaLine.value),
)
</script>

<style scoped>
.page-comp {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: inherit;
  padding: clamp(28px, 5vw, 48px) clamp(22px, 4vw, 40px);
  font-family: var(--book-font-body);
  color: var(--book-ink);
  background: var(--book-paper);
  overflow: hidden;
}

.page-comp--texture::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
  pointer-events: none;
}

.page-comp__pagenum {
  position: absolute;
  bottom: 14px;
  right: 18px;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--book-muted);
}

.page-comp__chapter {
  margin: auto;
  text-align: center;
  padding: clamp(32px, 8vw, 64px) 24px;
  max-width: 28rem;
}

.page-comp__chapter-num {
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--book-accent);
}

.page-comp__chapter-title {
  font-family: var(--book-font-display);
  font-size: clamp(1.85rem, 5vw, 2.75rem);
  margin: 14px 0 8px;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.page-comp__chapter-date {
  font-size: 0.9rem;
  color: var(--book-muted);
  font-style: italic;
}

.page-comp__chapter-rule {
  display: block;
  width: 40px;
  height: 1px;
  margin: 22px auto 0;
  background: color-mix(in srgb, var(--book-ink) 35%, transparent);
}

.page-comp__text-only {
  margin: auto;
  max-width: 34ch;
  text-align: center;
  padding: clamp(40px, 10vw, 80px) 20px;
}

.page-comp__meta {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--book-accent);
  margin: 0 0 12px;
}

.page-comp__title {
  font-family: var(--book-font-display);
  font-size: clamp(1.35rem, 3.8vw, 1.95rem);
  font-weight: 500;
  margin: 0 0 14px;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.page-comp__body {
  font-size: 1.02rem;
  line-height: 1.7;
  color: var(--book-muted);
}

.page-comp__body--lead {
  font-size: clamp(1.15rem, 2.6vw, 1.35rem);
  line-height: 1.75;
  font-style: italic;
  color: var(--book-ink);
}

.page-comp--full-bleed {
  padding: 0;
}

.page-comp--double-spread {
  padding: 0;
}

.page-comp__media--double-spread {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: clamp(360px, 62vh, 820px);
  background: color-mix(in srgb, var(--book-ink) 3%, var(--book-paper));
}

.page-comp--double-spread .page-comp__photo {
  margin: 0;
  width: 100%;
  box-shadow: none;
  border-radius: 0;
  background: transparent;
}

.page-comp--double-spread .page-comp__photo img {
  width: 100%;
  height: auto;
  max-height: min(82vh, 960px);
  object-fit: contain;
}

.page-comp__caption-block--spread {
  text-align: center;
  max-width: 46rem;
  margin-inline: auto;
  padding: clamp(18px, 3vw, 28px) clamp(20px, 4vw, 40px) clamp(24px, 4vw, 36px);
}

.page-comp__media--full-bleed {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: clamp(320px, 58vh, 720px);
  background: color-mix(in srgb, var(--book-ink) 4%, var(--book-paper));
}

.page-comp--full-bleed .page-comp__photo {
  margin: 0;
  width: 100%;
  box-shadow: none;
  border-radius: 0;
  background: transparent;
}

.page-comp--full-bleed .page-comp__photo img {
  width: 100%;
  height: auto;
  max-height: min(78vh, 900px);
  object-fit: contain;
}

.page-comp--hero-caption {
  padding: 0;
  display: grid;
  grid-template-rows: auto auto;
}

.page-comp__media--hero-caption {
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--book-ink) 3%, var(--book-paper));
  min-height: clamp(240px, 42vh, 560px);
}

.page-comp__media--hero-caption .page-comp__photo {
  margin: 0;
  width: 100%;
  box-shadow: none;
  border-radius: 0;
  background: transparent;
}

.page-comp__media--hero-caption img {
  width: 100%;
  height: auto;
  max-height: min(68vh, 780px);
  object-fit: contain;
}

.page-comp--hero-caption .page-comp__caption-block {
  padding: clamp(22px, 4vw, 36px) clamp(24px, 5vw, 48px) clamp(28px, 5vw, 44px);
  max-width: 38rem;
  margin-inline: auto;
  text-align: center;
}

.page-comp--asymmetric-duo .page-comp__media--asymmetric-duo {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: clamp(14px, 2.5vw, 22px);
  align-items: start;
  flex: 1;
}

.page-comp__media--asymmetric-duo .page-comp__photo--0 {
  grid-row: span 2;
}

.page-comp__photo {
  margin: 0;
  overflow: hidden;
  border-radius: 0;
  box-shadow: none;
  background: color-mix(in srgb, var(--book-ink) 4%, var(--book-paper));
}

.page-comp__photo img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(64vh, 720px);
  object-fit: contain;
  object-position: center;
}

.page-comp--editorial-trio .page-comp__media--editorial-trio {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  grid-template-rows: auto auto;
  gap: clamp(12px, 2vw, 18px);
  align-items: start;
  flex: 1;
}

.page-comp__media--editorial-trio .page-comp__photo--0 {
  grid-row: span 2;
}

.page-comp--collage-grid .page-comp__media--collage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(10px, 2vw, 16px);
  align-items: start;
  flex: 1;
}

.page-comp--collage-grid .page-comp__photo img {
  max-height: min(42vh, 420px);
}

.page-comp__mini-cap {
  display: grid;
  gap: 4px;
  padding: 10px 4px 0;
  text-align: left;
}

.page-comp__mini-date {
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--book-accent);
}

.page-comp__mini-title {
  font-family: var(--book-font-display);
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--book-ink);
}

.page-comp__mini-body {
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--book-muted);
}

.page-comp__scrap-title {
  margin: 0;
  padding: 14px 18px 4px;
  text-align: center;
  font-family: 'Caveat', 'Segoe Print', cursive;
  font-size: 1.45rem;
  color: var(--book-muted);
}

.page-comp--polaroid-memory {
  padding: 10px;
  overflow: hidden;
}

.page-comp--polaroid-memory :deep(.scrap) {
  min-height: clamp(340px, 52vh, 600px);
  background: transparent;
}

.page-comp--luxury {
  padding: clamp(36px, 6vw, 56px) clamp(28px, 5vw, 52px);
}

.page-comp--luxury .page-comp__caption-block {
  padding-top: 8px;
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

  .page-comp--hero-caption .page-comp__caption-block {
    text-align: left;
  }
}
</style>
