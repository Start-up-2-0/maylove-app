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
        <figure v-if="resolveMediaUrl(photo.url)" class="book-page-media__figure book-page-media__figure--polaroid">
          <div class="book-page-media__polaroid-photo">
            <img :src="resolveMediaUrl(photo.url)!" :alt="photo.title || 'Memória'" loading="lazy" />
          </div>
          <figcaption class="book-page-media__polaroid-label">
            <p v-if="photo.title" class="book-page-media__polaroid-title">{{ photo.title }}</p>
            <RichText v-if="photo.caption" :text="photo.caption" class="book-page-media__polaroid-caption" />
          </figcaption>
        </figure>
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
import type { MemoryBookPhoto } from '../types'

withDefaults(
  defineProps<{
    photos: MemoryBookPhoto[]
    variant?: 'default' | 'polaroid'
  }>(),
  { variant: 'default' },
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

.book-page-media__figure--polaroid {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 12px 12px 16px;
  background: #fff;
  border-radius: 3px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 14px 28px -16px rgba(0, 0, 0, 0.45);
}

.book-page-media--polaroid .book-page-media__item:nth-child(odd) .book-page-media__figure--polaroid {
  transform: rotate(-2deg);
}

.book-page-media--polaroid .book-page-media__item:nth-child(even) .book-page-media__figure--polaroid {
  transform: rotate(2deg);
}

.book-page-media__polaroid-photo {
  overflow: hidden;
  border-radius: 2px;
  background: #f3f0ea;
}

.book-page-media__polaroid-photo img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  filter: sepia(0.18) contrast(1.08) saturate(0.88) brightness(1.03);
}

.book-page-media__polaroid-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  margin: 0;
  padding: 10px 6px 0;
  text-align: center;
}

.book-page-media__polaroid-title {
  margin: 0;
  font-family: 'Caveat', cursive;
  font-size: 1.35rem;
  line-height: 1.2;
  color: #444;
}

.book-page-media__polaroid-caption {
  margin: 2px 0 0;
  font-family: 'Caveat', cursive;
  font-size: 1.1rem;
  line-height: 1.3;
  color: #666;
}

@media (max-width: 640px) {
  .book-page-media {
    gap: 10px;
  }

  .book-page-media--2,
  .book-page-media--4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .book-page-media--3 {
    grid-template-columns: 1fr;
  }

  .book-page-media__title {
    font-size: 0.88rem;
  }

  .book-page-media__caption {
    font-size: 0.85rem;
  }

  .book-page-media__figure--polaroid {
    padding: 8px 8px 12px;
  }

  .book-page-media--polaroid .book-page-media__item:nth-child(odd) .book-page-media__figure--polaroid {
    transform: rotate(-1deg);
  }

  .book-page-media--polaroid .book-page-media__item:nth-child(even) .book-page-media__figure--polaroid {
    transform: rotate(1deg);
  }

  .book-page-media__polaroid-label {
    min-height: 38px;
    padding-top: 6px;
  }

  .book-page-media__polaroid-title {
    font-size: 1.05rem;
  }

  .book-page-media__polaroid-caption {
    font-size: 0.95rem;
  }
}

@media (max-width: 380px) {
  .book-page-media--2,
  .book-page-media--3,
  .book-page-media--4 {
    grid-template-columns: 1fr;
  }

  .book-page-media--polaroid .book-page-media__item:nth-child(odd) .book-page-media__figure--polaroid,
  .book-page-media--polaroid .book-page-media__item:nth-child(even) .book-page-media__figure--polaroid {
    transform: none;
  }
}
</style>
