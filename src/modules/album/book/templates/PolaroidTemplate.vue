<template>
  <BookShell :book="book" :mode="mode" :share-url="shareUrl" tpl-class="book-tpl--polaroid">
    <template #cover="{ book: b }">
      <div class="pol-cover">
        <h1>{{ b.title }}</h1>
        <p v-if="b.subtitle">{{ b.subtitle }}</p>
      </div>
    </template>
    <template #page="{ page }">
      <div class="pol-page">
        <figure v-if="page.photos[0]" class="pol-frame">
          <img :src="page.photos[0].url" alt="" loading="lazy" />
          <figcaption>{{ page.caption || page.title || `Memória ${page.pageNo}` }}</figcaption>
        </figure>
        <div v-if="page.message" class="pol-note">
          <RichText :text="page.message" />
        </div>
      </div>
    </template>
    <template #back="{ book: b, shareUrl: url }">
      <div class="pol-back">
        <RichText v-if="b.closingMessage" :text="b.closingMessage" />
        <p v-if="b.signature" class="pol-sign">{{ b.signature }}</p>
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
.pol-cover,
.pol-back {
  padding: 40px;
  text-align: center;
  width: 100%;
}
.pol-cover h1 {
  font-family: 'Caveat', cursive;
  font-size: 3rem;
}
.pol-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 28px;
  background: #eceae4;
}
.pol-frame {
  margin: 0;
  padding: 14px 14px 42px;
  background: #fff;
  box-shadow: 0 14px 28px -16px rgba(0, 0, 0, 0.4);
  transform: rotate(1.5deg);
  max-width: 320px;
}
.pol-frame img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
.pol-frame figcaption {
  margin-top: 12px;
  font-family: 'Caveat', cursive;
  font-size: 1.35rem;
  text-align: center;
  color: #444;
}
.pol-note {
  max-width: 360px;
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  line-height: 1.45;
}
.pol-sign {
  font-family: 'Caveat', cursive;
  font-size: 2rem;
  color: var(--book-accent);
}
</style>
