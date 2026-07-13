<template>
  <div class="book-page-media" :class="`book-page-media--${photos.length}`">
    <article v-for="photo in photos" :key="photo.id" class="book-page-media__item">
      <figure v-if="resolveMediaUrl(photo.url)" class="book-page-media__figure">
        <img :src="resolveMediaUrl(photo.url)!" :alt="photo.title || 'Memória'" loading="lazy" />
      </figure>
      <p v-if="photo.title" class="book-page-media__title">{{ photo.title }}</p>
      <RichText v-if="photo.caption" :text="photo.caption" class="book-page-media__caption" />
    </article>
  </div>
</template>

<script setup lang="ts">
import RichText from '@/components/experience/shared/RichText.vue'
import { resolveMediaUrl } from '../mediaUrl'
import type { MemoryBookPhoto } from '../types'

defineProps<{
  photos: MemoryBookPhoto[]
}>()
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

.book-page-media__figure {
  margin: 0;
  overflow: hidden;
}

.book-page-media__figure img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.book-page-media__title {
  margin: 8px 0 4px;
  font-weight: 600;
  font-size: 0.95rem;
}

.book-page-media__caption {
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--book-muted);
}

@media (max-width: 560px) {
  .book-page-media--2,
  .book-page-media--3,
  .book-page-media--4 {
    grid-template-columns: 1fr;
  }
}
</style>
