<template>
  <header
    class="book-cover"
    :class="[
      `book-cover--${theme.cover.variant}`,
      `book-cover--mode-${coverMode}`,
      { 'book-cover--texture': theme.features.textureOverlay },
      { 'book-cover--opened': opened },
      { 'book-cover--has-photo': Boolean(coverPhotoUrl) },
    ]"
  >
    <div
      v-if="coverPhotoUrl && (coverMode === 'photo' || coverMode === 'full-bleed')"
      class="book-cover__media"
      aria-hidden="true"
    >
      <img :src="coverPhotoUrl" alt="" :style="coverPhotoStyle" />
    </div>

    <div class="book-cover__copy">
      <span v-if="eyebrow" class="book-cover__eyebrow">{{ eyebrow }}</span>
      <h1 class="book-cover__title">
        <span class="book-cover__title-main">{{ titleMain }}</span>
        <span v-if="titleSide" class="book-cover__title-side">{{ titleSide }}</span>
      </h1>
      <p v-if="book.subtitle" class="book-cover__subtitle">{{ book.subtitle }}</p>
      <span class="book-cover__rule" aria-hidden="true" />
      <p class="book-cover__hint">{{ hint }}</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookTheme } from '../themes'
import type { MemoryBookModel } from '../types'
import type { CoverMode } from '../bookConfig'

const props = withDefaults(
  defineProps<{
    book: MemoryBookModel
    theme: BookTheme
    opened?: boolean
  }>(),
  { opened: false },
)

const coverMode = computed<CoverMode>(
  () => props.book.bookConfig?.cover.mode ?? 'text',
)

const coverPhotoUrl = computed(() => props.book.coverPhotoUrl)
const coverPhotoStyle = computed(() => ({
  objectPosition: `${props.book.bookConfig?.cover.focal_x ?? 50}% ${props.book.bookConfig?.cover.focal_y ?? 50}%`,
}))

const eyebrow = computed(
  () => props.book.bookConfig?.cover.eyebrow?.trim() || props.theme.cover.eyebrow || 'MEMORY',
)

const titleMain = computed(() => props.book.title)
const titleSide = computed(() =>
  coverMode.value === 'text' && !props.opened ? 'BOOK.' : '',
)

const hint = computed(() => (props.opened ? 'Álbum aberto' : 'Toque na capa para abrir'))
</script>

<style scoped>
.book-cover {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  text-align: center;
  width: 100%;
  min-height: inherit;
  padding: clamp(32px, 8vw, 64px) clamp(24px, 6vw, 48px);
  position: relative;
  overflow: hidden;
  background: var(--book-paper);
  color: var(--book-ink);
}

.book-cover--mode-photo {
  grid-template-columns: 1.05fr 0.95fr;
  text-align: left;
  justify-items: stretch;
  gap: clamp(16px, 4vw, 28px);
}

.book-cover--mode-full-bleed .book-cover__media {
  position: absolute;
  inset: 0;
}

.book-cover--mode-full-bleed .book-cover__copy {
  position: relative;
  z-index: 1;
  color: #fff;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
}

.book-cover--mode-full-bleed .book-cover__eyebrow,
.book-cover--mode-full-bleed .book-cover__subtitle,
.book-cover--mode-full-bleed .book-cover__hint {
  color: rgba(255, 255, 255, 0.88);
}

.book-cover--mode-full-bleed .book-cover__rule {
  background: #fff;
}

.book-cover--opened {
  min-height: clamp(200px, 34vh, 300px);
  padding-bottom: 8px;
}

.book-cover__media {
  width: 100%;
  min-height: clamp(180px, 36vh, 340px);
  overflow: hidden;
  background: #ddd;
}

.book-cover__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-cover--mode-full-bleed .book-cover__media img {
  object-fit: cover;
}

.book-cover--mode-full-bleed .book-cover__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.55));
}

.book-cover__copy {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: inherit;
}

.book-cover--mode-photo .book-cover__copy {
  align-items: flex-start;
}

.book-cover__eyebrow {
  font-family: var(--book-font-body);
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--book-muted);
  margin-bottom: 14px;
}

.book-cover__title {
  position: relative;
  font-family: var(--book-font-display);
  font-size: clamp(2rem, 7vw, 3.6rem);
  font-weight: 700;
  line-height: 0.95;
  color: inherit;
  margin: 0;
  max-width: 14ch;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.book-cover__title-side {
  position: absolute;
  right: -1.1em;
  top: 0.15em;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.55em;
  letter-spacing: 0.08em;
}

.book-cover--opened .book-cover__title {
  font-size: clamp(1.5rem, 5vw, 2.4rem);
}

.book-cover--opened .book-cover__title-side {
  display: none;
}

.book-cover__subtitle {
  margin: 14px 0 0;
  font-family: var(--book-font-body);
  font-size: clamp(0.9rem, 2.2vw, 1.05rem);
  font-style: italic;
  color: var(--book-muted);
  max-width: 32ch;
}

.book-cover__rule {
  display: block;
  width: 64px;
  height: 2px;
  margin: 22px auto 16px;
  background: var(--book-accent);
}

.book-cover--mode-photo .book-cover__rule {
  margin-left: 0;
}

.book-cover__hint {
  font-size: 0.8rem;
  color: var(--book-muted);
  margin: 0;
}

.book-cover--opened .book-cover__hint {
  opacity: 0.7;
}

.book-cover--minimal {
  background: var(--book-paper);
}

@media (max-width: 720px) {
  .book-cover--mode-photo {
    grid-template-columns: 1fr;
  }

  .book-cover__title-side {
    display: none;
  }
}
</style>
