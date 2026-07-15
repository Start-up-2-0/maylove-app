<template>
  <div class="pg" :class="[`pg--${mode}`]" :style="rootStyle">
    <header class="pg__hero">
      <p v-if="eyebrow" class="pg__eyebrow">{{ eyebrow }}</p>
      <h1 class="pg__title">{{ book.title }}</h1>
      <p v-if="book.subtitle" class="pg__lead">{{ book.subtitle }}</p>
      <p class="pg__count">{{ shots.length }} {{ shots.length === 1 ? 'fotografia' : 'fotografias' }}</p>
    </header>

    <div v-if="shots.length" class="pg__masonry" role="list" aria-label="Galeria de fotos">
      <button
        v-for="(shot, index) in shots"
        :key="shot.id"
        type="button"
        class="pg__shot"
        role="listitem"
        :style="{ '--pg-delay': `${Math.min(index * 40, 600)}ms` }"
        @click="openLightbox(index)"
      >
        <img :src="shot.url" :alt="shot.title || 'Memória'" loading="lazy" />
        <span v-if="shot.title || shot.caption" class="pg__shot-veil">
          <strong v-if="shot.title">{{ shot.title }}</strong>
          <small v-if="shot.caption">{{ shot.caption }}</small>
        </span>
      </button>
    </div>

    <p v-else class="pg__empty">Este álbum ainda não tem fotografias.</p>

    <footer v-if="showClosing" class="pg__footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="pg__closing" />
      <p v-if="book.signature" class="pg__sign">{{ book.signature }}</p>
    </footer>

    <section v-if="shareUrl" class="pg__share" aria-label="Compartilhar álbum">
      <ShareBar :url="shareUrl" :text="book.title" />
    </section>

    <PhotoLightbox
      :open="lightboxOpen"
      :photos="shots"
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
import { getBookTheme, getThemeCssVars, fontPresetVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import { normalizeBookConfig } from '../bookConfig'
import PhotoLightbox from '../shared/PhotoLightbox.vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const theme = computed(() => getBookTheme(normalizePresentationId(props.book.presentation)))
const bookConfig = computed(() => normalizeBookConfig(props.book.bookConfig))
const fonts = computed(() => fontPresetVars(bookConfig.value.fonts.preset))

const rootStyle = computed(() =>
  getThemeCssVars(theme.value, bookConfig.value.colors.accent || props.book.colorPrimary, {
    paper: bookConfig.value.colors.paper || '#f7f4ef',
    ink: bookConfig.value.colors.ink || '#1c1814',
    page: bookConfig.value.colors.page || bookConfig.value.colors.paper || '#f7f4ef',
    fontDisplay: fonts.value.display,
    fontBody: fonts.value.body,
  }),
)

const eyebrow = computed(
  () => bookConfig.value.cover.eyebrow?.trim() || theme.value.cover.eyebrow || 'GALERIA',
)

const shots = computed(() =>
  props.book.contentPages.flatMap((page) =>
    page.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      title: photo.title ?? null,
      caption: photo.caption ?? null,
      memoryDate: photo.memoryDate ?? null,
      placeName: photo.placeName ?? null,
    })),
  ),
)

const showClosing = computed(
  () => Boolean(props.book.closingMessage?.trim()) || Boolean(props.book.signature?.trim()),
)

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<style scoped>
.pg {
  --pg-ink: var(--book-ink, #1c1814);
  --pg-paper: var(--book-paper, #f7f4ef);
  min-height: 100%;
  padding: clamp(32px, 6vw, 72px) clamp(16px, 4vw, 48px) clamp(48px, 8vw, 96px);
  color: var(--pg-ink);
  background:
    radial-gradient(ellipse at 50% -8%, rgba(255, 255, 255, 0.72), transparent 50%),
    linear-gradient(180deg, #fcfbf8 0%, var(--pg-paper) 42%, color-mix(in srgb, var(--pg-paper) 90%, #ddd5c8));
  font-family: var(--book-font-body, 'Libre Baskerville', Georgia, serif);
}

.pg--preview {
  min-height: 420px;
  padding: 28px 16px 36px;
  border-radius: 16px;
}

.pg__hero {
  max-width: 40rem;
  margin: 0 auto clamp(28px, 5vw, 48px);
  text-align: center;
}

.pg__eyebrow {
  margin: 0 0 12px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--pg-ink) 42%, transparent);
}

.pg__title {
  margin: 0;
  font-family: var(--book-font-display, 'Cormorant Garamond', Georgia, serif);
  font-size: clamp(2rem, 5.5vw, 3.2rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.pg__lead {
  margin: 14px auto 0;
  max-width: 34rem;
  font-size: clamp(0.98rem, 2vw, 1.1rem);
  line-height: 1.6;
  color: color-mix(in srgb, var(--pg-ink) 68%, transparent);
}

.pg__count {
  margin: 18px 0 0;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--pg-ink) 45%, transparent);
}

.pg__masonry {
  column-width: 240px;
  column-gap: clamp(14px, 2vw, 22px);
  max-width: 1180px;
  margin: 0 auto;
}

.pg__shot {
  position: relative;
  display: block;
  width: 100%;
  margin: 0 0 clamp(14px, 2vw, 22px);
  padding: 0;
  border: 0;
  border-radius: 6px;
  overflow: hidden;
  break-inside: avoid;
  background: color-mix(in srgb, var(--pg-ink) 4%, #fff);
  box-shadow: 0 18px 36px -28px rgba(28, 24, 20, 0.45);
  cursor: zoom-in;
  animation: pg-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--pg-delay, 0ms);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.pg__shot:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 44px -24px rgba(28, 24, 20, 0.5);
}

.pg__shot img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.pg__shot-veil {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  gap: 2px;
  padding: 28px 12px 12px;
  text-align: left;
  color: #fff;
  background: linear-gradient(180deg, transparent, rgba(18, 14, 12, 0.72));
  opacity: 0;
  transition: opacity 200ms ease;
}

.pg__shot:hover .pg__shot-veil,
.pg__shot:focus-visible .pg__shot-veil {
  opacity: 1;
}

.pg__shot-veil strong {
  font-family: var(--book-font-display, Georgia, serif);
  font-size: 1rem;
  font-weight: 500;
}

.pg__shot-veil small {
  font-size: 0.78rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.85);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pg__empty,
.pg__footer {
  max-width: 36rem;
  margin: clamp(36px, 6vw, 64px) auto 0;
  text-align: center;
}

.pg__empty {
  color: color-mix(in srgb, var(--pg-ink) 55%, transparent);
}

.pg__closing {
  margin: 0 0 10px;
  font-size: 1.05rem;
  line-height: 1.55;
}

.pg__sign {
  margin: 0;
  font-family: var(--book-font-display, Georgia, serif);
  font-style: italic;
  font-size: 1.1rem;
}

.pg__share {
  display: flex;
  justify-content: center;
  margin-top: clamp(28px, 5vw, 40px);
  padding-top: 24px;
  border-top: 1px solid color-mix(in srgb, var(--pg-ink) 12%, transparent);
}

@keyframes pg-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pg__shot {
    animation: none;
  }
}
</style>
