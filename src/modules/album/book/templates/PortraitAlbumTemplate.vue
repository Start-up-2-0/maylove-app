<template>
  <div class="ar-page" :class="[`ar-page--${mode}`]" :style="pageStyle">
    <header class="ar-page__header">
      <p v-if="eyebrow" class="ar-page__eyebrow">{{ eyebrow }}</p>
      <h1 class="ar-page__title">{{ book.title }}</h1>
      <p v-if="book.subtitle" class="ar-page__subtitle">{{ book.subtitle }}</p>
    </header>

    <div v-if="prints.length" class="ar-page__stage" role="list" aria-label="Álbum de retratos">
      <PolaroidFrame
        v-for="print in prints"
        :key="print.id"
        :url="print.url"
        :title="print.title"
        :caption="print.caption"
        :memory-date="print.memoryDate"
        :frame-style="frameStyle"
        :rotation="print.rotation"
        class="ar-print"
        :style="print.style"
        role="listitem"
      />
    </div>

    <p v-else class="ar-page__empty">Adicione fotos na fototeca para montar o álbum retrato.</p>

    <footer v-if="showClosing" class="ar-page__footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="ar-page__msg" />
      <p v-if="book.signature" class="ar-page__sign">{{ book.signature }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import { getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import { normalizeFrameStyle, resolveBookConfig } from '../bookConfig'
import PolaroidFrame from '../shared/PolaroidFrame.vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const presentation = computed(() => normalizePresentationId(props.book.presentation))
const theme = computed(() => getBookTheme(presentation.value))
const bookConfig = computed(() => resolveBookConfig(props.book.bookConfig, presentation.value))
const frameStyle = computed(() => normalizeFrameStyle(bookConfig.value.frame_style))

const pageStyle = computed(() =>
  getThemeCssVars(theme.value, bookConfig.value.colors.accent || props.book.colorPrimary, {
    paper: bookConfig.value.colors.paper || theme.value.tokens.paper,
    ink: bookConfig.value.colors.ink,
    page: bookConfig.value.colors.page || bookConfig.value.colors.paper,
    fontDisplay: theme.value.fonts.display,
    fontBody: theme.value.fonts.body,
  }),
)

const eyebrow = computed(
  () =>
    bookConfig.value.cover.eyebrow?.trim() ||
    theme.value.cover.eyebrow ||
    'Álbum de retratos',
)

const ROTATIONS = [-1.6, 1.2, -0.8, 1.5, -1.1, 0.9, -1.4, 1.0]

const prints = computed(() => {
  const photos = props.book.contentPages.flatMap((page) => page.photos)
  return photos.map((photo, index) => {
    const rot = ROTATIONS[index % ROTATIONS.length]
    return {
      id: photo.id,
      url: photo.url,
      title: photo.title,
      caption: photo.caption,
      memoryDate: photo.memoryDate,
      rotation: rot,
      style: {
        '--ar-delay': `${Math.min(index * 55, 700)}ms`,
      } as Record<string, string>,
    }
  })
})

const showClosing = computed(
  () =>
    Boolean(props.book.closingMessage?.trim()) || Boolean(props.book.signature?.trim()),
)
</script>

<style scoped>
.ar-page {
  --book-paper: #e8dcc8;
  --book-ink: #2c241c;
  min-height: 100%;
  padding: clamp(20px, 4vw, 40px);
  color: var(--book-ink);
  background:
    radial-gradient(ellipse at 20% 0%, rgba(255, 255, 255, 0.35), transparent 45%),
    var(--book-paper, #e8dcc8);
  font-family: var(--book-font-body, Georgia, serif);
}

.ar-page__header {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 32px);
}

.ar-page__eyebrow {
  margin: 0 0 8px;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--book-ink) 55%, transparent);
}

.ar-page__title {
  margin: 0;
  font-family: var(--book-font-display, Georgia, serif);
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  font-weight: 600;
}

.ar-page__subtitle {
  margin: 8px 0 0;
  font-size: 1rem;
  color: color-mix(in srgb, var(--book-ink) 65%, transparent);
}

.ar-page__stage {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  gap: clamp(18px, 3vw, 28px);
  align-items: start;
}

.ar-print {
  width: 100%;
  animation: ar-in 520ms ease both;
  animation-delay: var(--ar-delay, 0ms);
}

.ar-page__empty,
.ar-page__footer {
  text-align: center;
  margin-top: 28px;
}

.ar-page__empty {
  color: color-mix(in srgb, var(--book-ink) 55%, transparent);
}

.ar-page__msg {
  max-width: 36rem;
  margin: 0 auto 8px;
}

.ar-page__sign {
  margin: 0;
  font-style: italic;
}

@keyframes ar-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ar-print {
    animation: none;
  }
}
</style>
