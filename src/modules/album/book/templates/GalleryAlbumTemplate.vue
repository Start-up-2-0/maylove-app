<template>
  <div class="ag" :class="[`ag--${mode}`]" :style="rootStyle">
    <header class="ag__hero">
      <p v-if="eyebrow" class="ag__eyebrow">{{ eyebrow }}</p>
      <h1 class="ag__title">{{ book.title }}</h1>
      <p v-if="book.subtitle" class="ag__lead">{{ book.subtitle }}</p>
    </header>

    <div v-if="shots.length" class="ag__grid" role="list" aria-label="Fotos do álbum">
      <article
        v-for="(shot, index) in shots"
        :key="shot.id"
        class="ag__item"
        :style="{ '--ag-delay': `${Math.min(index * 60, 720)}ms` }"
        role="listitem"
      >
        <PolaroidFrame
          :url="shot.url"
          :title="shot.title"
          :caption="shot.caption"
          :memory-date="shot.memoryDate"
          :frame-style="frameStyle"
        />
      </article>
    </div>

    <p v-else class="ag__empty">Adicione fotos na fototeca para montar o álbum.</p>

    <footer v-if="showClosing" class="ag__footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="ag__closing" />
      <p v-if="book.signature" class="ag__sign">{{ book.signature }}</p>
    </footer>

    <section v-if="shareUrl" class="ag__share" aria-label="Compartilhar álbum">
      <ShareBar :url="shareUrl" :text="book.title" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import { getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import { normalizeFrameStyle, resolveBookConfig } from '../bookConfig'
import PolaroidFrame from '../shared/PolaroidFrame.vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
  editable?: boolean
}>()

const presentation = computed(() => normalizePresentationId(props.book.presentation))
const theme = computed(() => getBookTheme(presentation.value))
const bookConfig = computed(() => resolveBookConfig(props.book.bookConfig, presentation.value))
const frameStyle = computed(() => normalizeFrameStyle(bookConfig.value.frame_style))

const rootStyle = computed(() =>
  getThemeCssVars(theme.value, bookConfig.value.colors.accent || props.book.colorPrimary, {
    paper: bookConfig.value.colors.paper || '#f3f5f8',
    ink: bookConfig.value.colors.ink || '#1c2a38',
    page: bookConfig.value.colors.page || bookConfig.value.colors.paper || '#f3f5f8',
    fontDisplay: theme.value.fonts.display,
    fontBody: theme.value.fonts.body,
  }),
)

const eyebrow = computed(
  () => bookConfig.value.cover.eyebrow?.trim() || theme.value.cover.eyebrow || 'ÁLBUM',
)

const shots = computed(() => {
  const photos = props.book.contentPages.flatMap((page) => page.photos)
  return photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    title: photo.title,
    caption: photo.caption,
    memoryDate: photo.memoryDate,
  }))
})

const showClosing = computed(
  () =>
    Boolean(props.book.closingMessage?.trim()) || Boolean(props.book.signature?.trim()),
)
</script>

<style scoped>
.ag {
  --ag-bg: var(--book-page, #f3f5f8);
  --ag-ink: var(--book-ink, #1c2a38);
  min-height: 100%;
  padding: clamp(28px, 5vw, 56px) clamp(16px, 4vw, 40px) clamp(40px, 6vw, 72px);
  color: var(--ag-ink);
  background:
    radial-gradient(ellipse at 50% -10%, rgba(255, 255, 255, 0.9), transparent 55%),
    linear-gradient(180deg, #f7f8fb 0%, var(--ag-bg) 40%, color-mix(in srgb, var(--ag-bg) 92%, #dfe6ee));
  font-family: var(--book-font-body, 'Segoe UI', sans-serif);
}

.ag--preview {
  min-height: 420px;
  padding: 24px 16px 32px;
  border-radius: 16px;
}

.ag__hero {
  max-width: 44rem;
  margin: 0 auto clamp(28px, 5vw, 48px);
  text-align: center;
}

.ag__eyebrow {
  margin: 0 0 10px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ag-ink) 45%, transparent);
}

.ag__title {
  margin: 0;
  font-family: var(--book-font-display, Georgia, 'Times New Roman', serif);
  font-size: clamp(1.85rem, 4.8vw, 2.75rem);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.ag__lead {
  margin: 14px auto 0;
  max-width: 36rem;
  font-size: clamp(0.98rem, 2.2vw, 1.12rem);
  line-height: 1.55;
  color: color-mix(in srgb, var(--ag-ink) 68%, transparent);
}

.ag__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: clamp(22px, 3.5vw, 36px);
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

.ag__item {
  animation: ag-rise 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--ag-delay, 0ms);
}

.ag__item :deep(.pf) {
  width: 100%;
}

.ag__empty {
  text-align: center;
  margin: 48px 0;
  color: color-mix(in srgb, var(--ag-ink) 55%, transparent);
}

.ag__footer {
  max-width: 36rem;
  margin: clamp(36px, 6vw, 64px) auto 0;
  text-align: center;
}

.ag__closing {
  margin: 0 0 10px;
  font-size: 1.05rem;
  line-height: 1.5;
}

.ag__sign {
  margin: 0;
  font-family: var(--book-font-display, Georgia, serif);
  font-style: italic;
  font-size: 1.05rem;
}

.ag__share {
  display: flex;
  justify-content: center;
  margin-top: clamp(28px, 5vw, 40px);
  padding-top: 24px;
  border-top: 1px solid color-mix(in srgb, var(--ag-ink) 12%, transparent);
}

@keyframes ag-rise {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 640px) {
  .ag__grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr));
    gap: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ag__item {
    animation: none;
  }
}
</style>
