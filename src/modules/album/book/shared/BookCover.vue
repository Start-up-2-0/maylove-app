<template>
  <header
    class="book-cover"
    :class="[`book-cover--${theme.cover.variant}`, { 'book-cover--texture': theme.features.textureOverlay }]"
  >
    <span v-if="theme.cover.eyebrow" class="book-cover__eyebrow">{{ theme.cover.eyebrow }}</span>
    <h1 class="book-cover__title">{{ book.title }}</h1>
    <p v-if="book.subtitle" class="book-cover__subtitle">{{ book.subtitle }}</p>
    <span class="book-cover__rule" aria-hidden="true" />
    <p class="book-cover__hint">Deslize ou use as setas para folhear</p>
  </header>
</template>

<script setup lang="ts">
import type { BookTheme } from '../themes'
import type { MemoryBookModel } from '../types'

defineProps<{
  book: MemoryBookModel
  theme: BookTheme
}>()
</script>

<style scoped>
.book-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  min-height: inherit;
  padding: clamp(32px, 8vw, 64px) clamp(24px, 6vw, 48px);
  position: relative;
  overflow: hidden;
}

.book-cover--texture::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
  pointer-events: none;
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
  font-family: var(--book-font-display);
  font-size: clamp(2rem, 7vw, 3.4rem);
  font-weight: 500;
  line-height: 1.08;
  color: var(--book-ink);
  margin: 0;
  max-width: 16ch;
}

.book-cover__subtitle {
  margin: 12px 0 0;
  font-family: var(--book-font-body);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-style: italic;
  color: var(--book-muted);
  max-width: 28ch;
}

.book-cover__rule {
  display: block;
  width: 64px;
  height: 2px;
  margin: 22px auto 16px;
  background: var(--book-accent);
}

.book-cover__hint {
  font-size: 0.8rem;
  color: var(--book-muted);
  margin: 0;
}

/* Variantes */
.book-cover--minimal {
  background:
    radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--book-accent) 10%, transparent), transparent 55%),
    var(--book-paper);
}

.book-cover--romantic {
  background:
    radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--book-accent) 14%, #fff), transparent 60%),
    linear-gradient(180deg, #fff, var(--book-paper));
}

.book-cover--romantic .book-cover__title {
  font-family: var(--book-font-display);
  font-weight: 400;
}

.book-cover--family {
  background:
    repeating-linear-gradient(
      -4deg,
      transparent,
      transparent 18px,
      color-mix(in srgb, var(--book-accent) 4%, transparent) 18px,
      color-mix(in srgb, var(--book-accent) 4%, transparent) 19px
    ),
    var(--book-paper);
}

.book-cover--polaroid {
  background: var(--book-paper-alt);
}

.book-cover--scrapbook {
  background:
    linear-gradient(var(--book-paper) 0 0) padding-box,
    repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(160, 140, 110, 0.12) 27px, rgba(160, 140, 110, 0.12) 28px);
}

.book-cover--scrapbook::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 18%;
  width: 72px;
  height: 22px;
  background: color-mix(in srgb, var(--book-accent) 35%, #f5e6b8);
  transform: rotate(-14deg);
  opacity: 0.85;
}

.book-cover--travel {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--book-accent) 6%, var(--book-paper)), var(--book-paper));
  border-bottom: 3px double color-mix(in srgb, var(--book-accent) 25%, transparent);
}

.book-cover--magazine {
  background: var(--book-paper-alt);
  color: #fff;
  text-align: left;
  align-items: flex-start;
}

.book-cover--magazine .book-cover__title,
.book-cover--magazine .book-cover__subtitle,
.book-cover--magazine .book-cover__eyebrow,
.book-cover--magazine .book-cover__hint {
  color: #fff;
}

.book-cover--magazine .book-cover__rule {
  margin-left: 0;
}

.book-cover--luxury {
  background:
    linear-gradient(180deg, var(--book-paper) 0%, color-mix(in srgb, var(--book-accent) 4%, var(--book-paper)) 100%);
  border: 1px solid color-mix(in srgb, var(--book-accent) 20%, transparent);
}

.book-cover--luxury .book-cover__title {
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: clamp(1.6rem, 5vw, 2.6rem);
}
</style>
