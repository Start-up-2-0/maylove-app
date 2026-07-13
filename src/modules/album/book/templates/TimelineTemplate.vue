<template>
  <BookShell :book="book" :mode="mode" :share-url="shareUrl" tpl-class="book-tpl--timeline">
    <template #cover="{ book: b }">
      <div class="tl-cover">
        <h1>{{ b.title }}</h1>
        <p>Nossa história, capítulo a capítulo</p>
      </div>
    </template>
    <template #page="{ page }">
      <div class="tl-page">
        <div class="tl-rail">
          <span class="tl-dot" />
          <span v-if="page.memoryDate" class="tl-date">{{ page.memoryDate }}</span>
        </div>
        <div class="tl-body">
          <BookPageMedia v-if="page.photos.length" :photos="page.photos" />
          <h2 v-if="page.title">{{ page.title }}</h2>
          <RichText v-if="page.message && page.photos.length <= 1" :text="page.message" />
        </div>
      </div>
    </template>
    <template #back="{ book: b, shareUrl: url }">
      <div class="tl-back">
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
.tl-cover,
.tl-back {
  width: 100%;
  padding: 40px;
  text-align: center;
}
.tl-cover h1 {
  font-size: 2.2rem;
}
.tl-page {
  display: grid;
  grid-template-columns: 120px 1fr;
  min-height: inherit;
  background: linear-gradient(90deg, color-mix(in srgb, var(--book-accent) 8%, #fff), #fff);
}
.tl-rail {
  position: relative;
  border-right: 2px solid color-mix(in srgb, var(--book-accent) 35%, transparent);
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.tl-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--book-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--book-accent) 20%, transparent);
}
.tl-date {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: var(--book-muted);
}
.tl-body {
  padding: 24px 28px;
}
.tl-photo {
  margin: 0 0 14px;
  max-width: 360px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 12px 28px -18px rgba(0, 0, 0, 0.35);
}
.tl-photo img {
  width: 100%;
  display: block;
  aspect-ratio: 16/10;
  object-fit: cover;
}
.tl-body h2 {
  margin-bottom: 8px;
}
@media (max-width: 640px) {
  .tl-page {
    grid-template-columns: 1fr;
  }
  .tl-rail {
    flex-direction: row;
    border-right: none;
    border-bottom: 2px solid color-mix(in srgb, var(--book-accent) 35%, transparent);
  }
  .tl-date {
    writing-mode: horizontal-tb;
    transform: none;
  }
}
</style>
