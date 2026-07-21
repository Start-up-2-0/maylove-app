<template>
  <BookShell :book="book" :mode="mode" :share-url="shareUrl" tpl-class="book-tpl--magazine">
    <template #cover="{ book: b }">
      <div class="mag-cover">
        <p class="mag-tag">Edição especial</p>
        <h1>{{ b.title }}</h1>
        <p v-if="b.subtitle">{{ b.subtitle }}</p>
      </div>
    </template>
    <template #page="{ page }">
      <div class="mag-page" :class="{ 'mag-page--hero': page.pageNo % 2 === 1 }">
        <div v-if="page.photos.length" class="mag-hero">
          <BookPageMedia :photos="page.photos" />
        </div>
        <div class="mag-copy">
          <span class="mag-kicker">Capítulo {{ page.pageNo }}</span>
          <h2 v-if="page.title">{{ page.title }}</h2>
          <p v-if="page.memoryDate" class="mag-date">{{ page.memoryDate }}</p>
          <RichText v-if="page.message && page.photos.length <= 1" :text="page.message" />
        </div>
      </div>
    </template>
    <template #back="{ book: b, shareUrl: url }">
      <div class="mag-back">
        <RichText v-if="b.closingMessage" :text="b.closingMessage" />
        <ShareBar v-if="mode === 'full' && url" :url="url" :text="b.title" />
      </div>
    </template>
  </BookShell>
</template>

<script setup lang="ts">
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import BookPageMedia from '../shared/BookPageMedia.vue'
import BookShell from '../shared/BookShell.vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

defineProps<{ book: MemoryBookModel; mode: BookRenderMode; shareUrl?: string }>()
</script>

<style scoped>
.mag-cover,
.mag-back {
  width: 100%;
  padding: 40px;
  text-align: left;
  background: #111;
  color: #fff;
}
.mag-tag {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
}
.mag-cover h1 {
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.05;
  margin: 8px 0;
  font-weight: 700;
}
.mag-page {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  min-height: inherit;
  background: #fafafa;
}
.mag-page--hero .mag-hero {
  grid-row: span 2;
}
.mag-hero {
  margin: 0;
  min-height: 220px;
}
.mag-hero :deep(.book-page-media__figure img) {
  width: 100%;
  height: auto;
  max-height: min(72vh, 820px);
  object-fit: contain;
  display: block;
}
.mag-copy {
  padding: 24px;
}
.mag-kicker {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--book-accent);
}
.mag-copy h2 {
  font-size: 1.5rem;
  margin: 6px 0;
}
.mag-date {
  font-size: 0.82rem;
  color: var(--book-muted);
  margin-bottom: 8px;
}
.mag-copy :deep(p) {
  line-height: 1.65;
  color: #333;
}
@media (max-width: 640px) {
  .mag-page {
    grid-template-columns: 1fr;
  }

  .mag-page--hero .mag-hero {
    grid-row: auto;
  }

  .mag-cover,
  .mag-back {
    padding: 28px 18px;
  }

  .mag-hero {
    min-height: 180px;
  }

  .mag-hero :deep(.book-page-media__figure img) {
    min-height: 180px;
  }

  .mag-copy {
    padding: 16px;
  }

  .mag-copy h2 {
    font-size: 1.25rem;
  }
}
</style>
