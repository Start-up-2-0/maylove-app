<template>
  <div
    class="book-page-media"
    :class="[
      `book-page-media--${photos.length}`,
      variant !== 'default' ? `book-page-media--${variant}` : null,
    ]"
  >
    <article v-for="photo in photos" :key="photo.id" class="book-page-media__item">
      <template v-if="variant === 'polaroid'">
        <PolaroidFrame
          v-if="resolveMediaUrl(photo.url)"
          :url="resolveMediaUrl(photo.url)!"
          :title="photo.title"
          :caption="photo.caption"
          :memory-date="photo.memoryDate"
          :frame-style="frameStyle"
        />
      </template>
      <template v-else>
        <figure v-if="resolveMediaUrl(photo.url)" class="book-page-media__figure">
          <img :src="resolveMediaUrl(photo.url)!" :alt="photo.title || 'Memória'" loading="lazy" />
        </figure>
        <p v-if="photo.title" class="book-page-media__title">{{ photo.title }}</p>
        <RichText v-if="photo.caption" :text="photo.caption" class="book-page-media__caption" />
      </template>
    </article>
  </div>
</template>

<script setup lang="ts">
import RichText from '@/components/experience/shared/RichText.vue'
import { resolveMediaUrl } from '../mediaUrl'
import type { BookFrameStyle } from '../frameStyles'
import PolaroidFrame from './PolaroidFrame.vue'
import type { MemoryBookPhoto } from '../types'

withDefaults(
  defineProps<{
    photos: MemoryBookPhoto[]
    variant?: 'default' | 'polaroid'
    frameStyle?: BookFrameStyle | string | null
  }>(),
  { variant: 'default', frameStyle: 'classic' },
)
</script>

<style scoped>
.book-page-media {
  display: grid;
  gap: 14px;
}

.book-page-media--1 {
  grid-template-columns: 1fr;
}

.book-page-media--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.book-page-media--3,
.book-page-media--4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.book-page-media--polaroid {
  gap: 18px;
}

.book-page-media__figure {
  margin: 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--book-paper, #fffdf8) 88%, #ebe4dc);
}

.book-page-media__figure img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(70vh, 760px);
  object-fit: contain;
  object-position: center;
}

.book-page-media__title {
  margin: 8px 0 0;
  font-family: var(--book-font-display, Georgia, serif);
  font-size: 1rem;
  font-weight: 700;
}

.book-page-media__caption {
  margin: 4px 0 0;
  font-size: 0.86rem;
  color: color-mix(in srgb, var(--book-ink, #222) 70%, transparent);
}
</style>
