<template>
  <BookShell
    :book="book"
    :mode="mode"
    :share-url="shareUrl"
    tpl-class="book-tpl--notebook"
    :show-binder="false"
  >
    <template #cover="{ book: b }">
      <div class="nb-cover">
        <span class="nb-tape nb-tape--tl" />
        <span class="nb-tape nb-tape--br" />
        <h1>{{ b.title }}</h1>
        <p v-if="b.subtitle">{{ b.subtitle }}</p>
      </div>
    </template>
    <template #page="{ page }">
      <div class="nb-page">
        <p v-if="page.memoryDate" class="nb-date">{{ page.memoryDate }}</p>
        <h2 v-if="page.title">{{ page.title }}</h2>
        <BookPageMedia v-if="page.photos.length" :photos="page.photos" />
        <RichText
          v-if="page.message && page.photos.length <= 1"
          :text="page.message"
          class="nb-text"
        />
      </div>
    </template>
    <template #back="{ book: b, shareUrl: url }">
      <div class="nb-back">
        <RichText v-if="b.closingMessage" :text="b.closingMessage" />
        <p v-if="b.signature" class="nb-sign">{{ b.signature }}</p>
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
.nb-cover,
.nb-back {
  position: relative;
  width: 100%;
  padding: 48px 32px;
  text-align: center;
}
.nb-cover {
  background:
    linear-gradient(#f7f1e6 0 0) padding-box,
    repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180, 160, 130, 0.18) 27px, rgba(180, 160, 130, 0.18) 28px);
}
.nb-cover h1 {
  font-family: 'Caveat', cursive;
  font-size: 2.8rem;
}
.nb-tape {
  position: absolute;
  width: 72px;
  height: 22px;
  background: color-mix(in srgb, var(--book-accent) 35%, #f5e6b8);
  opacity: 0.85;
  transform: rotate(-18deg);
}
.nb-tape--tl {
  top: 18px;
  left: 18%;
}
.nb-tape--br {
  bottom: 22px;
  right: 16%;
  transform: rotate(12deg);
}
.nb-page {
  padding: 28px 32px 32px 48px;
  min-height: inherit;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--book-accent) 25%, #e8d4c8) 0 3px, transparent 3px),
    repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(160, 140, 110, 0.15) 27px, rgba(160, 140, 110, 0.15) 28px),
    #fbf7ef;
}
.nb-date {
  font-size: 0.82rem;
  color: var(--book-muted);
  margin-bottom: 6px;
}
.nb-page h2 {
  font-family: 'Caveat', cursive;
  font-size: 1.8rem;
  margin-bottom: 12px;
}
.nb-text {
  font-family: 'Caveat', cursive;
  font-size: 1.45rem;
  line-height: 1.55;
  max-width: 42ch;
  margin-top: 12px;
}
.nb-sign {
  font-family: 'Caveat', cursive;
  font-size: 2rem;
  color: var(--book-accent);
}

@media (max-width: 640px) {
  .nb-cover,
  .nb-back {
    padding: 32px 18px;
  }

  .nb-cover h1 {
    font-size: clamp(1.9rem, 8vw, 2.4rem);
  }

  .nb-page {
    padding: 18px 14px 18px 24px;
  }

  .nb-page h2 {
    font-size: 1.45rem;
  }

  .nb-text {
    font-size: 1.2rem;
  }

  .nb-sign {
    font-size: 1.6rem;
  }
}
</style>
