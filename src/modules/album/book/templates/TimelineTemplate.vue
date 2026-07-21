<template>
  <div class="tl-book" :class="[`tl-book--${mode}`]" :style="themeStyle">
    <header class="tl-cover">
      <h1>{{ book.title }}</h1>
      <p v-if="book.subtitle" class="tl-cover__sub">{{ book.subtitle }}</p>
      <p v-else class="tl-cover__tagline">Nossa história, capítulo a capítulo</p>
    </header>

    <ol v-if="entries.length" class="tl-timeline">
      <li v-for="entry in entries" :key="entry.pageNo" class="tl-entry">
        <span class="tl-entry__marker" aria-hidden="true" />
        <article class="tl-entry__card">
          <figure v-if="entry.photoUrl" class="tl-entry__photo">
            <img :src="entry.photoUrl" :alt="entry.title || 'Memória'" loading="lazy" />
          </figure>
          <div class="tl-entry__body">
            <time v-if="entry.date" class="tl-entry__date">{{ entry.date }}</time>
            <h2 v-if="entry.title" class="tl-entry__title">{{ entry.title }}</h2>
            <RichText v-if="entry.description" :text="entry.description" class="tl-entry__desc" />
          </div>
        </article>
      </li>
    </ol>

    <footer class="tl-footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="tl-footer__msg" />
      <p v-if="book.signature" class="tl-footer__sign">{{ book.signature }}</p>
      <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="book.title" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

const props = defineProps<{ book: MemoryBookModel; mode: BookRenderMode; shareUrl?: string }>()

const themeStyle = computed(() => ({
  '--book-accent': props.book.colorPrimary,
}))

const entries = computed(() =>
  props.book.contentPages.map((page) => {
    const photo = page.photos[0]

    return {
      pageNo: page.pageNo,
      photoUrl: photo?.url,
      date: page.memoryDate ?? photo?.memoryDate,
      title: page.title ?? photo?.title,
      description: page.message ?? page.caption ?? photo?.caption,
    }
  }),
)
</script>

<style scoped>
.tl-book {
  --book-paper: #fffdf8;
  --book-muted: #7a6f66;
  width: 100%;
  min-height: var(--exp-stage, 100svh);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--book-accent) 6%, #fff) 0%,
    var(--book-paper) 24%
  );
}

.tl-book--preview {
  min-height: auto;
}

.tl-cover,
.tl-footer {
  width: 100%;
  padding: clamp(28px, 6vw, 48px) clamp(18px, 5vw, 40px);
  text-align: center;
}

.tl-cover h1 {
  font-size: clamp(1.8rem, 6vw, 2.4rem);
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
}

.tl-cover__sub,
.tl-cover__tagline {
  margin: 10px 0 0;
  color: var(--book-muted);
  font-size: 1.05rem;
}

.tl-cover__tagline {
  font-style: italic;
}

.tl-timeline {
  list-style: none;
  margin: 0 auto;
  padding: 8px clamp(16px, 4vw, 32px) 32px;
  max-width: 720px;
  position: relative;
}

.tl-timeline::before {
  content: '';
  position: absolute;
  left: clamp(28px, 5vw, 40px);
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: color-mix(in srgb, var(--book-accent) 35%, transparent);
}

.tl-entry {
  position: relative;
  padding-left: clamp(42px, 8vw, 56px);
  margin-bottom: 24px;
}

.tl-entry__marker {
  position: absolute;
  left: clamp(20px, 4vw, 32px);
  top: 18px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--book-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--book-accent) 20%, transparent);
}

.tl-entry__card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--book-accent) 14%, #e8e0da);
  box-shadow: 0 16px 36px -24px rgba(0, 0, 0, 0.35);
}

.tl-entry__photo {
  margin: 0;
  overflow: hidden;
  border-radius: 10px;
  background: color-mix(in srgb, var(--book-accent) 4%, #f7f3ee);
}

.tl-entry__photo img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(78vh, 920px);
  object-fit: contain;
  object-position: center;
  margin-inline: auto;
}

.tl-entry__date {
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--book-accent);
}

.tl-entry__title {
  margin: 6px 0 0;
  font-size: clamp(1.15rem, 4vw, 1.45rem);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 600;
}

.tl-entry__desc {
  margin-top: 8px;
  color: var(--book-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.tl-footer {
  border-top: 1px solid color-mix(in srgb, var(--book-accent) 12%, #e8e0da);
  background: color-mix(in srgb, var(--book-accent) 4%, #fff);
}

.tl-footer__msg {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 1.2rem;
  max-width: 40ch;
  margin: 0 auto 12px;
}

.tl-footer__sign {
  margin: 0 0 16px;
  font-family: 'Caveat', cursive;
  font-size: 1.8rem;
  color: var(--book-accent);
}

@media (max-width: 640px) {
  .tl-cover,
  .tl-footer {
    padding: 24px 16px;
  }

  .tl-timeline {
    padding-inline: 12px;
  }

  .tl-entry__card {
    padding: 14px;
  }
}
</style>
