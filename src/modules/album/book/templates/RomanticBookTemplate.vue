<template>
  <BookShell :book="book" :mode="mode" :share-url="shareUrl" tpl-class="book-tpl--romantic">
    <template #cover="{ book: b }">
      <div class="rom-cover">
        <p class="rom-eyebrow">Para sempre</p>
        <h1>{{ b.title }}</h1>
        <p v-if="b.subtitle" class="rom-sub">{{ b.subtitle }}</p>
      </div>
    </template>
    <template #page="{ page }">
      <div class="rom-page">
        <div class="rom-page__media" v-if="page.photos[0]">
          <img :src="page.photos[0].url" alt="" loading="lazy" />
        </div>
        <div class="rom-page__copy">
          <p v-if="page.memoryDate" class="rom-date">{{ page.memoryDate }}</p>
          <h2 v-if="page.title">{{ page.title }}</h2>
          <RichText v-if="page.message" :text="page.message" />
        </div>
      </div>
    </template>
    <template #back="{ book: b, shareUrl: url }">
      <div class="rom-back">
        <RichText v-if="b.closingMessage" :text="b.closingMessage" />
        <p v-if="b.signature" class="rom-sign">{{ b.signature }}</p>
        <ShareBar v-if="mode === 'full' && url" :url="url" :text="b.title" />
      </div>
    </template>
  </BookShell>
</template>

<script setup lang="ts">
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import BookShell from '../shared/BookShell.vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

defineProps<{ book: MemoryBookModel; mode: BookRenderMode; shareUrl?: string }>()
</script>

<style scoped>
.rom-cover,
.rom-back {
  width: 100%;
  padding: 48px 32px;
  text-align: center;
  background: linear-gradient(160deg, #fff, color-mix(in srgb, var(--book-accent) 6%, #fff));
}
.rom-eyebrow {
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: var(--book-muted);
}
.rom-cover h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  margin: 10px 0;
}
.rom-sub {
  font-style: italic;
  color: var(--book-muted);
}
.rom-page {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  min-height: inherit;
}
.rom-page__media img {
  width: 100%;
  height: 100%;
  min-height: 280px;
  object-fit: cover;
}
.rom-page__copy {
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}
.rom-date {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--book-muted);
}
.rom-page__copy h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 400;
  font-size: 1.6rem;
}
.rom-page__copy :deep(p) {
  font-family: 'Playfair Display', Georgia, serif;
  line-height: 1.75;
  color: #4a4440;
}
.rom-sign {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 1.5rem;
  color: var(--book-accent);
}
@media (max-width: 640px) {
  .rom-page {
    grid-template-columns: 1fr;
  }
}
</style>
