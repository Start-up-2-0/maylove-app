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
        <BookPageMedia :photos="page.photos" variant="polaroid" class="pol-frames" />
        <div v-if="page.message && page.photos.length <= 1" class="pol-note">
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
import BookPageMedia from '../shared/BookPageMedia.vue'
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
.pol-frames {
  width: 100%;
  max-width: 720px;
}

.pol-frames :deep(.book-page-media--polaroid) {
  gap: 22px;
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

@media (max-width: 640px) {
  .pol-cover,
  .pol-back {
    padding: 24px 16px;
  }

  .pol-cover h1 {
    font-size: clamp(1.75rem, 8vw, 2.5rem);
    line-height: 1.1;
  }

  .pol-page {
    padding: 14px 10px;
    gap: 12px;
  }

  .pol-frames :deep(.book-page-media--polaroid) {
    gap: 14px;
  }

  .pol-note {
    font-size: 1.2rem;
    padding: 0 8px;
  }

  .pol-sign {
    font-size: 1.6rem;
  }
}
</style>
