<template>
  <div class="ar-page" :class="[`ar-page--${mode}`]" :style="pageStyle">
    <header class="ar-page__header">
      <p v-if="eyebrow" class="ar-page__eyebrow">{{ eyebrow }}</p>
      <h1 class="ar-page__title">{{ book.title }}</h1>
      <p v-if="book.subtitle" class="ar-page__subtitle">{{ book.subtitle }}</p>
    </header>

    <div v-if="prints.length" class="ar-page__stage" role="list" aria-label="Álbum de retratos">
      <figure
        v-for="print in prints"
        :key="print.id"
        class="ar-print"
        :class="[`ar-print--${print.shape}`]"
        :style="print.style"
        role="listitem"
      >
        <span class="ar-print__corner ar-print__corner--tl" aria-hidden="true" />
        <span class="ar-print__corner ar-print__corner--tr" aria-hidden="true" />
        <span class="ar-print__corner ar-print__corner--bl" aria-hidden="true" />
        <span class="ar-print__corner ar-print__corner--br" aria-hidden="true" />
        <div class="ar-print__scallop">
          <div class="ar-print__photo">
            <img :src="print.url" :alt="print.title || 'Retrato'" loading="lazy" />
          </div>
        </div>
      </figure>
    </div>

    <p v-else class="ar-page__empty">Adicione fotos na fototeca para montar o álbum retrato.</p>

    <footer v-if="showFooter" class="ar-page__footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="ar-page__msg" />
      <p v-if="book.signature" class="ar-page__sign">{{ book.signature }}</p>
      <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="book.title" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import { getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import { normalizeBookConfig } from '../bookConfig'
import type { BookRenderMode, MemoryBookModel } from '../types'

type Shape = 'wide' | 'square' | 'tall' | 'sm' | 'md'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const theme = computed(() => getBookTheme(normalizePresentationId(props.book.presentation)))
const bookConfig = computed(() => normalizeBookConfig(props.book.bookConfig))

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
    props.book.bookConfig?.cover.eyebrow?.trim() ||
    theme.value.cover.eyebrow ||
    'Álbum de retratos',
)

const SHAPES: Shape[] = ['wide', 'square', 'sm', 'tall', 'md', 'wide', 'square', 'tall']
const ROTATIONS = [-1.6, 1.2, -0.8, 1.5, -1.1, 0.9, -1.4, 1.0]

const prints = computed(() => {
  const photos = props.book.contentPages.flatMap((page) => page.photos)
  return photos.map((photo, index) => {
    const shape = SHAPES[index % SHAPES.length]
    const rot = ROTATIONS[index % ROTATIONS.length]
    return {
      id: photo.id,
      url: photo.url,
      title: photo.title,
      shape,
      style: {
        '--ar-rot': `${rot}deg`,
        '--ar-delay': `${Math.min(index * 55, 700)}ms`,
        zIndex: String(5 + (index % 5)),
      } as Record<string, string>,
    }
  })
})

const showFooter = computed(
  () =>
    Boolean(props.book.closingMessage?.trim()) ||
    Boolean(props.book.signature?.trim()) ||
    (props.mode === 'full' && Boolean(props.shareUrl?.trim())),
)
</script>

<style scoped>
.ar-page {
  --ar-paper: var(--book-paper);
  --ar-paper-dark: var(--book-paper-alt);
  --ar-corner: #b89a78;
  width: 100%;
  min-height: var(--exp-stage, 100svh);
  padding: clamp(22px, 4vw, 40px) clamp(16px, 4vw, 36px) clamp(40px, 6vw, 64px);
  color: var(--book-ink);
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(90, 70, 45, 0.025) 2px,
      rgba(90, 70, 45, 0.025) 3px
    ),
    radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.35), transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(80, 55, 30, 0.08), transparent 50%),
    linear-gradient(165deg, var(--ar-paper) 0%, var(--ar-paper-dark) 100%);
  box-shadow: inset 0 0 80px rgba(70, 50, 30, 0.08);
}

.ar-page--preview {
  min-height: auto;
}

.ar-page__header {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 32px);
}

.ar-page__eyebrow {
  margin: 0 0 8px;
  font-family: var(--book-font-body);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--book-muted);
}

.ar-page__title {
  margin: 0;
  font-family: var(--book-font-display);
  font-size: clamp(1.7rem, 5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #3b3228;
}

.ar-page__subtitle {
  margin: 10px 0 0;
  font-family: var(--book-font-body);
  font-style: italic;
  font-size: 1.1rem;
  color: var(--book-muted);
}

.ar-page__stage {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(16px, 3vw, 28px) clamp(12px, 2.5vw, 22px);
  align-items: start;
  max-width: 920px;
  margin: 0 auto;
  padding: 8px 4px;
}

.ar-page__empty {
  text-align: center;
  color: var(--book-muted);
  font-family: var(--book-font-body);
  font-style: italic;
  padding: 48px 16px;
}

.ar-print {
  position: relative;
  justify-self: center;
  width: 100%;
  padding: 11px 11px 14px;
  background: #f7f2e8;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.65) inset,
    0 12px 24px -14px rgba(40, 28, 16, 0.45),
    0 3px 8px -4px rgba(40, 28, 16, 0.22);
  transform: rotate(var(--ar-rot, 0deg));
  animation: ar-in 560ms cubic-bezier(0.22, 0.9, 0.25, 1) both;
  animation-delay: var(--ar-delay, 0ms);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.ar-print:hover {
  transform: rotate(0deg) translateY(-3px) scale(1.02);
  z-index: 20 !important;
}

.ar-print--wide {
  grid-column: span 4;
  max-width: 420px;
}

.ar-print--md {
  grid-column: span 3;
  max-width: 300px;
}

.ar-print--square {
  grid-column: span 2;
  max-width: 220px;
}

.ar-print--sm {
  grid-column: span 2;
  max-width: 170px;
}

.ar-print--tall {
  grid-column: span 2;
  max-width: 190px;
}

.ar-print__scallop {
  /* Borda branca com “serrilha” via máscara radial repetida */
  padding: 7px;
  background: #fffef9;
  filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.8));
  mask-image:
    radial-gradient(circle at 8px 0, #000 7px, transparent 7.5px),
    radial-gradient(circle at 8px 100%, #000 7px, transparent 7.5px),
    radial-gradient(circle at 0 8px, #000 7px, transparent 7.5px),
    radial-gradient(circle at 100% 8px, #000 7px, transparent 7.5px),
    linear-gradient(#000, #000);
  mask-size:
    16px 8px,
    16px 8px,
    8px 16px,
    8px 16px,
    calc(100% - 14px) calc(100% - 14px);
  mask-position:
    top left,
    bottom left,
    top left,
    top right,
    center;
  mask-repeat: repeat-x, repeat-x, repeat-y, repeat-y, no-repeat;
  -webkit-mask-image:
    radial-gradient(circle at 8px 0, #000 7px, transparent 7.5px),
    radial-gradient(circle at 8px 100%, #000 7px, transparent 7.5px),
    radial-gradient(circle at 0 8px, #000 7px, transparent 7.5px),
    radial-gradient(circle at 100% 8px, #000 7px, transparent 7.5px),
    linear-gradient(#000, #000);
  -webkit-mask-size:
    16px 8px,
    16px 8px,
    8px 16px,
    8px 16px,
    calc(100% - 14px) calc(100% - 14px);
  -webkit-mask-position:
    top left,
    bottom left,
    top left,
    top right,
    center;
  -webkit-mask-repeat: repeat-x, repeat-x, repeat-y, repeat-y, no-repeat;
}

.ar-print__photo {
  overflow: hidden;
  background: #2a2723;
}

.ar-print--wide .ar-print__photo {
  aspect-ratio: 4 / 3;
}

.ar-print--md .ar-print__photo {
  aspect-ratio: 5 / 4;
}

.ar-print--square .ar-print__photo,
.ar-print--sm .ar-print__photo {
  aspect-ratio: 1;
}

.ar-print--tall .ar-print__photo {
  aspect-ratio: 3 / 4;
}

.ar-print__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(0.12) contrast(1.05);
}

.ar-print__corner {
  position: absolute;
  width: 18px;
  height: 18px;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(135deg, #cbb08c 0%, var(--ar-corner) 55%, #9a7a58 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.ar-print__corner--tl {
  top: 4px;
  left: 4px;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.ar-print__corner--tr {
  top: 4px;
  right: 4px;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}

.ar-print__corner--bl {
  bottom: 6px;
  left: 4px;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}

.ar-print__corner--br {
  bottom: 6px;
  right: 4px;
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
}

.ar-page__footer {
  max-width: 480px;
  margin: clamp(28px, 5vw, 44px) auto 0;
  text-align: center;
  padding: 16px 18px;
  background: color-mix(in srgb, #fff8ec 75%, transparent);
  border: 1px solid rgba(59, 50, 40, 0.1);
}

.ar-page__msg {
  margin: 0;
  font-family: var(--book-font-body);
  font-size: 1.05rem;
}

.ar-page__sign {
  margin: 10px 0 0;
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  color: var(--book-muted);
}

@keyframes ar-in {
  from {
    opacity: 0;
    transform: rotate(var(--ar-rot, 0deg)) translateY(14px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: rotate(var(--ar-rot, 0deg)) translateY(0) scale(1);
  }
}

@media (max-width: 720px) {
  .ar-page__stage {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ar-print--wide,
  .ar-print--md,
  .ar-print--square,
  .ar-print--sm,
  .ar-print--tall {
    grid-column: span 1;
    max-width: none;
  }

  .ar-print:nth-child(3n + 1) {
    grid-column: span 2;
  }
}
</style>
