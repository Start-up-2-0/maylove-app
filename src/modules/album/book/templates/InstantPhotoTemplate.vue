<template>
  <div
    class="ip-book"
    :class="[`ip-book--${mode}`, { 'ip-book--open': opened, 'ip-book--closed': !opened }]"
    :style="bookStyle"
  >
    <div ref="stageRef" class="ip-book__stage">
      <section class="ip-cover" aria-label="Capa do álbum">
        <button
          v-if="!opened"
          type="button"
          class="ip-cover__btn"
          aria-expanded="false"
          aria-controls="ip-pages"
          @click="openAlbum"
        >
          <div class="ip-cover__face">
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
            <p class="ip-cover__hint">Toque na capa para abrir</p>
          </div>
        </button>
        <div v-else class="ip-cover__open">
          <div class="ip-cover__face">
            <p v-if="eyebrow" class="ip-cover__eyebrow">{{ eyebrow }}</p>
            <div class="ip-cover__mosaic" aria-hidden="true">
              <div
                v-for="(tile, index) in coverTiles"
                :key="`tile-open-${index}`"
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
          </div>
          <button type="button" class="ip-cover__close" @click="closeAlbum">Fechar álbum</button>
        </div>
      </section>

      <div v-if="opened" id="ip-pages" ref="pagesRef" class="ip-pages">
        <section
          v-for="spread in spreads"
          :key="spread.pageNo"
          class="ip-spread"
          :class="[`ip-spread--count-${spread.photos.length}`]"
        >
          <div class="ip-spread__grid">
            <PolaroidFrame
              v-for="(photo, index) in spread.photos"
              :key="photo.id"
              :url="photo.url"
              :title="photo.title"
              :caption="photo.caption"
              :memory-date="photo.memoryDate"
              :frame-style="frameStyle"
              :rotation="ROTATIONS[index % ROTATIONS.length]"
            />
          </div>
          <p v-if="spread.pageNo" class="ip-spread__page">{{ spread.pageNo }}</p>
        </section>

        <p v-if="!spreads.length" class="ip-empty">
          Adicione fotos na fototeca para montar o Instant Photo.
        </p>

        <footer v-if="showClosing" class="ip-footer">
          <RichText v-if="book.closingMessage" :text="book.closingMessage" class="ip-footer__msg" />
          <p v-if="book.signature" class="ip-footer__sign">{{ book.signature }}</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import { getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import { resolveBookConfig, normalizeFrameStyle } from '../bookConfig'
import PolaroidFrame from '../shared/PolaroidFrame.vue'
import type { BookRenderMode, MemoryBookModel, MemoryBookPhoto } from '../types'

const ROTATIONS = [-1.8, 1.4, -1.1, 1.7, -0.9, 1.2]

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const presentation = computed(() => normalizePresentationId(props.book.presentation))
const theme = computed(() => getBookTheme(presentation.value))
const bookConfig = computed(() => resolveBookConfig(props.book.bookConfig, presentation.value))
const frameStyle = computed(() => normalizeFrameStyle(bookConfig.value.frame_style))

const bookStyle = computed(() =>
  getThemeCssVars(theme.value, bookConfig.value.colors.accent || props.book.colorPrimary, {
    paper: bookConfig.value.colors.paper || theme.value.tokens.paper,
    ink: bookConfig.value.colors.ink || theme.value.tokens.ink,
    page: bookConfig.value.colors.page || bookConfig.value.colors.paper || theme.value.tokens.paper,
    fontDisplay: theme.value.fonts.display,
    fontBody: theme.value.fonts.body,
  }),
)

const eyebrow = computed(
  () =>
    bookConfig.value.cover.eyebrow?.trim() ||
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

const showClosing = computed(
  () =>
    Boolean(props.book.closingMessage?.trim()) || Boolean(props.book.signature?.trim()),
)

/** Preview do wizard já começa aberto para ver as colagens. */
const opened = ref(props.mode === 'preview')
const pagesRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)

async function openAlbum() {
  opened.value = true
  await nextTick()
  pagesRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function closeAlbum() {
  opened.value = false
  nextTick(() => {
    if (stageRef.value) stageRef.value.scrollTop = 0
    if (props.mode === 'full') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
}
</script>

<style scoped>
.ip-book {
  --ip-bg: var(--book-paper);
  --ip-ink: var(--book-ink);
  --ip-ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  min-height: var(--exp-stage, 100svh);
  background: var(--ip-bg);
  color: var(--ip-ink);
}

.ip-book--preview {
  min-height: auto;
}

.ip-book__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.ip-book--closed .ip-book__stage {
  justify-content: center;
  min-height: inherit;
}

.ip-book--preview .ip-book__stage {
  max-height: clamp(400px, 64vh, 680px);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.ip-cover {
  width: min(920px, 100%);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 48px) clamp(16px, 4vw, 32px);
}

.ip-book--closed .ip-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: inherit;
}

.ip-cover__btn {
  display: block;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: inherit;
  cursor: pointer;
  transition:
    transform 280ms var(--ip-ease),
    filter 280ms var(--ip-ease);
}

.ip-cover__btn:hover {
  transform: translateY(-4px) scale(1.01);
  filter: brightness(1.06);
}

.ip-cover__face {
  text-align: center;
}

.ip-cover__open {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 20px;
}

.ip-cover__close {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--ip-ink);
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    background 180ms var(--ip-ease),
    border-color 180ms var(--ip-ease);
}

.ip-cover__close:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
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
  color: var(--ip-ink);
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

.ip-cover__hint {
  margin: 18px 0 0;
  font-family: var(--book-font-body);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  color: var(--book-muted);
}

.ip-pages {
  width: 100%;
  animation: ip-pages-in 420ms var(--ip-ease) both;
}

.ip-spread,
.ip-footer {
  width: min(920px, 100%);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 48px) clamp(16px, 4vw, 32px);
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
.ip-spread--count-6 .ip-spread__grid,
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

@keyframes ip-pages-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .ip-book--preview .ip-book__stage {
    max-height: clamp(340px, 58vh, 520px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ip-pages {
    animation: none;
  }

  .ip-cover__btn,
  .ip-cover__btn:hover {
    transition: none;
    transform: none;
  }
}
</style>
