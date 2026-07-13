<template>
  <footer class="book-back">
    <RichText v-if="book.closingMessage" :text="book.closingMessage" class="book-back__msg" />
    <p v-if="book.signature" class="book-back__sign">{{ book.signature }}</p>
    <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="book.title" />
  </footer>
</template>

<script setup lang="ts">
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()
</script>

<style scoped>
.book-back {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  min-height: inherit;
  padding: clamp(28px, 6vw, 52px) clamp(24px, 5vw, 40px);
  background: color-mix(in srgb, var(--book-accent) 4%, var(--book-paper));
}

.book-back__msg {
  font-family: var(--book-font-display);
  font-style: italic;
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  line-height: 1.55;
  max-width: 36ch;
  margin: 0 auto 14px;
  color: var(--book-ink);
}

.book-back__sign {
  font-family: var(--book-font-accent);
  font-size: clamp(1.4rem, 4vw, 2rem);
  color: var(--book-accent);
  margin: 0 0 18px;
}
</style>
