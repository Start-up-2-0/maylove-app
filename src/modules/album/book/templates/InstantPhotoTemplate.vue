<template>
  <div class="ip-book" :class="[`ip-book--${mode}`]" :style="bookStyle">
    <header class="ip-cover">
      <p v-if="eyebrow" class="ip-cover__eyebrow">{{ eyebrow }}</p>
      <div class="ip-cover__mosaic" aria-hidden="true">
        <div
          v-for="(tile, index) in coverTiles"
          :key="`tile-${index}`"
          class="ip-cover__tile"
          :class="{ 'ip-cover__tile--center': tile.center }"
        >
          <template v-if="tile.center">
            <span class="ip-cover__badge">PHOTO</span>
          </template>
          <img v-else-if="tile.url" :src="tile.url" alt="" />
        </div>
      </div>
      <h1 class="ip-cover__title">{{ book.title }}</h1>
      <p v-if="book.subtitle" class="ip-cover__subtitle">{{ book.subtitle }}</p>
      <p v-else class="ip-cover__brand">Instant Photo.</p>
    </header>

    <section
      v-for="spread in spreads"
      :key="spread.pageNo"
      class="ip-spread"
      :class="[`ip-spread--count-${spread.photos.length}`]"
    >
      <div class="ip-spread__grid">
        <figure v-for="photo in spread.photos" :key="photo.id" class="ip-frame">
          <div class="ip-frame__photo">
            <img :src="photo.url" :alt="photo.title || 'Foto'" loading="lazy" />
          </div>
        </figure>
      </div>
      <p v-if="spread.pageNo" class="ip-spread__page">{{ spread.pageNo }}</p>
    </section>

    <p v-if="!spreads.length" class="ip-empty">Adicione fotos na fototeca para montar o Instant Photo.</p>

    <footer v-if="showFooter" class="ip-footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="ip-footer__msg" />
      <p v-if="book.signature" class="ip-footer__sign">{{ book.signature }}</p>
      <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="book.title" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import { getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import { normalizeBookConfig } from '../bookConfig'
import type { BookRenderMode, MemoryBookModel, MemoryBookPhoto } from '../types'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const theme = computed(() => getBookTheme(normalizePresentationId(props.book.presentation)))
const bookConfig = computed(() => normalizeBookConfig(props.book.bookConfig))

const bookStyle = computed(() =>
  getThemeCssVars(theme.value, bookConfig.value.colors.accent || props.book.colorPrimary, {
    paper: bookConfig.value.colors.paper || theme.value.tokens.paper,
    ink: bookConfig.value.colors.ink,
    page: bookConfig.value.colors.page || bookConfig.value.colors.paper,
    fontDisplay: theme.value.fonts.display,
    fontBody: theme.value.fonts.body,
  }),
)

const eyebrow = computed(
  () =>
    props.book.bookConfig?.cover.eyebrow?.trim() ||
    theme.value.cover.eyebrow ||
    'INSTANT PHOTO',
)

const allPhotos = computed(() => props.book.contentPages.flatMap((page) => page.photos))

const coverTiles = computed(() => {
  const photos = allPhotos.value
  const tiles: Array<{ url?: string; center?: boolean }> = []
  let photoIndex = 0
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      tiles.push({ center: true })
      continue
    }
    tiles.push({ url: photos[photoIndex]?.url })
    photoIndex += 1
  }
  return tiles
})

const spreads = computed(() =>
  props.book.contentPages.map((page) => ({
    pageNo: page.pageNo,
    photos: page.photos as MemoryBookPhoto[],
  })),
)

const showFooter = computed(
  () =>
    Boolean(props.book.closingMessage?.trim()) ||
    Boolean(props.book.signature?.trim()) ||
    (props.mode === 'full' && Boolean(props.shareUrl?.trim())),
)
</script>

<style scoped>
.ip-book {
  --ip-bg: var(--book-paper);
  --ip-ink: var(--book-ink);
  width: 100%;
  min-height: var(--exp-stage, 100svh);
  background: var(--ip-bg);
  color: var(--ip-ink);
}

.ip-book--preview {
  min-height: auto;
}

.ip-cover,
.ip-spread,
.ip-footer {
  width: min(920px, 100%);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 48px) clamp(16px, 4vw, 32px);
}

.ip-cover {
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ip-cover__eyebrow {
  margin: 0 0 18px;
  font-family: var(--book-font-body);
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--book-muted);
}

.ip-cover__mosaic {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-width: 420px;
  margin: 0 auto 28px;
}

.ip-cover__tile {
  aspect-ratio: 1;
  background: #0d0d0d;
  border: 6px solid #f4f1ea;
  border-bottom-width: 18px;
  box-shadow: 0 10px 24px -16px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.ip-cover__tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #111;
}

.ip-cover__tile--center {
  display: grid;
  place-items: center;
  background: #f4f1ea;
  border-bottom-width: 6px;
}

.ip-cover__badge {
  font-family: var(--book-font-display);
  font-size: clamp(0.85rem, 2.4vw, 1.1rem);
  letter-spacing: 0.08em;
  color: #181818;
}

.ip-cover__title {
  margin: 0;
  font-family: var(--book-font-display);
  font-size: clamp(2rem, 7vw, 3.4rem);
  font-weight: 700;
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.ip-cover__subtitle,
.ip-cover__brand {
  margin: 14px 0 0;
  font-family: var(--book-font-body);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: rgba(255, 255, 255, 0.78);
}

.ip-cover__brand {
  font-weight: 600;
}

.ip-spread {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.ip-spread__grid {
  display: grid;
  gap: clamp(12px, 2.5vw, 18px);
  justify-items: center;
}

.ip-spread--count-1 .ip-spread__grid {
  grid-template-columns: minmax(0, 360px);
}

.ip-spread--count-2 .ip-spread__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ip-spread--count-3 .ip-spread__grid,
.ip-spread--count-4 .ip-spread__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ip-spread--count-5 .ip-spread__grid,
.ip-spread--count-6 .ip-spread__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.ip-spread--count-7 .ip-spread__grid,
.ip-spread--count-8 .ip-spread__grid,
.ip-spread--count-9 .ip-spread__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.ip-frame {
  margin: 0;
  width: 100%;
  max-width: 240px;
  padding: 8px 8px 22px;
  background: #f4f1ea;
  box-shadow: 0 14px 28px -18px rgba(0, 0, 0, 0.75);
}

.ip-frame__photo {
  background: #111;
  line-height: 0;
  min-height: 96px;
}

.ip-frame__photo img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  object-position: center;
}

.ip-spread__page {
  margin: 18px 0 0;
  text-align: center;
  font-family: var(--book-font-body);
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  color: var(--book-muted);
}

.ip-empty {
  text-align: center;
  padding: 64px 20px;
  color: var(--book-muted);
}

.ip-footer {
  text-align: center;
}

.ip-footer__msg {
  margin: 0;
  font-family: var(--book-font-body);
  font-size: 1.05rem;
}

.ip-footer__sign {
  margin: 12px 0 0;
  font-family: var(--book-font-display);
  font-size: 1.15rem;
  letter-spacing: 0.04em;
}

@media (max-width: 640px) {
  .ip-spread--count-5 .ip-spread__grid,
  .ip-spread--count-6 .ip-spread__grid,
  .ip-spread--count-7 .ip-spread__grid,
  .ip-spread--count-8 .ip-spread__grid,
  .ip-spread--count-9 .ip-spread__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ip-cover__mosaic {
    gap: 6px;
  }

  .ip-cover__tile {
    border-width: 4px;
    border-bottom-width: 12px;
  }
}
</style>
