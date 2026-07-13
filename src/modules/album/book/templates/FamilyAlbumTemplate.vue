<template>
  <BookShell :book="book" :mode="mode" :share-url="shareUrl" tpl-class="book-tpl--family" :show-binder="true">
    <template #cover="{ book: b }">
      <div class="fam-cover">
        <p class="fam-cover__eyebrow">Livro de memórias</p>
        <h1 class="fam-cover__title">{{ b.title }}</h1>
        <p v-if="b.subtitle" class="fam-cover__sub">{{ b.subtitle }}</p>
        <span class="fam-cover__rule" />
        <p class="fam-cover__hint">Toque ou use as setas para folhear →</p>
      </div>
    </template>

    <template #page="{ page }">
      <div class="fam-page">
        <div class="fam-page__photo">
          <BookPageMedia v-if="page.photos.length" :photos="page.photos" class="fam-page__grid" />
        </div>
        <div class="fam-page__text">
          <span class="fam-page__num">{{ String(page.pageNo).padStart(2, '0') }}</span>
          <p v-if="page.memoryDate" class="fam-page__date">{{ page.memoryDate }}</p>
          <h2 v-if="page.title" class="fam-page__title">{{ page.title }}</h2>
          <RichText v-if="page.message" :text="page.message" class="fam-page__msg" />
        </div>
      </div>
    </template>

    <template #back="{ book: b, shareUrl: url }">
      <div class="fam-back">
        <RichText v-if="b.closingMessage" :text="b.closingMessage" class="fam-back__msg" />
        <p v-if="b.signature" class="fam-back__sign">{{ b.signature }}</p>
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

defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()
</script>

<style scoped>
.fam-cover,
.fam-back {
  text-align: center;
  padding: clamp(28px, 6vw, 56px);
  width: 100%;
}

.fam-cover {
  background:
    radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--book-accent) 14%, transparent), transparent 58%),
    repeating-linear-gradient(
      -4deg,
      transparent,
      transparent 18px,
      color-mix(in srgb, var(--book-accent) 4%, transparent) 18px,
      color-mix(in srgb, var(--book-accent) 4%, transparent) 19px
    ),
    var(--book-paper);
}

.fam-cover__eyebrow {
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--book-muted);
}

.fam-cover__title {
  font-size: clamp(2rem, 6vw, 3.2rem);
  margin: 12px 0 8px;
  font-family: 'Playfair Display', Georgia, serif;
}

.fam-cover__sub {
  font-style: italic;
  color: var(--book-muted);
  font-size: 1.15rem;
}

.fam-cover__rule {
  display: block;
  width: 72px;
  height: 2px;
  margin: 18px auto;
  background: var(--book-accent);
}

.fam-cover__hint {
  font-size: 0.85rem;
  color: var(--book-muted);
}

.fam-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: inherit;
}

.fam-page__photo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: color-mix(in srgb, var(--book-accent) 5%, var(--book-paper));
  border-right: 1px dashed color-mix(in srgb, var(--book-accent) 20%, transparent);
}

.fam-page__grid :deep(.book-page-media__figure) {
  padding: 12px 12px 28px;
  background: #fff;
  box-shadow: 0 18px 36px -20px rgba(0, 0, 0, 0.45);
  transform: rotate(-2deg);
  border-radius: 3px;
}

.fam-polaroid {
  margin: 0;
  padding: 12px 12px 28px;
  background: #fff;
  box-shadow: 0 18px 36px -20px rgba(0, 0, 0, 0.45);
  transform: rotate(-2deg);
  border-radius: 3px;
}

.fam-polaroid img {
  display: block;
  width: 100%;
  max-width: 280px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.fam-page__text {
  padding: clamp(20px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.fam-page__num {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  color: var(--book-accent);
}

.fam-page__date {
  margin: 8px 0 4px;
  font-size: 0.82rem;
  color: var(--book-muted);
  font-style: italic;
}

.fam-page__title {
  font-size: clamp(1.2rem, 3vw, 1.7rem);
  margin-bottom: 10px;
  font-family: 'Playfair Display', Georgia, serif;
}

.fam-page__msg {
  font-family: 'Caveat', cursive;
  font-size: clamp(1.2rem, 2.8vw, 1.55rem);
  line-height: 1.5;
}

.fam-back__msg {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 1.35rem;
  max-width: 36ch;
  margin: 0 auto 16px;
}

.fam-back__sign {
  font-family: 'Caveat', cursive;
  font-size: 2rem;
  color: var(--book-accent);
}

@media (max-width: 640px) {
  .fam-page {
    grid-template-columns: 1fr;
  }

  .fam-cover,
  .fam-back {
    padding: 24px 16px;
  }

  .fam-page__photo {
    border-right: none;
    border-bottom: 1px dashed color-mix(in srgb, var(--book-accent) 20%, transparent);
    padding: 14px 12px;
  }

  .fam-page__text {
    padding: 16px;
  }

  .fam-page__grid :deep(.book-page-media__figure) {
    transform: none;
  }

  .fam-back__sign {
    font-size: 1.6rem;
  }
}
</style>
