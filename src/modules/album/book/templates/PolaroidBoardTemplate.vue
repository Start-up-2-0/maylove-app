<template>
  <div class="pb-board" :class="[`pb-board--${mode}`]" :style="boardStyle">
    <header class="pb-board__header">
      <p v-if="eyebrow" class="pb-board__eyebrow">{{ eyebrow }}</p>
      <h1 class="pb-board__title">{{ book.title }}</h1>
      <p v-if="book.subtitle" class="pb-board__subtitle">{{ book.subtitle }}</p>
    </header>

    <div v-if="shots.length" class="pb-board__stage" role="list" aria-label="Quadro de polaroids">
      <figure
        v-for="shot in shots"
        :key="shot.id"
        class="pb-polaroid"
        :class="[`pb-polaroid--decor-${shot.decor}`, `pb-polaroid--size-${shot.size}`]"
        :style="shot.style"
        role="listitem"
      >
        <span class="pb-polaroid__attach" aria-hidden="true" />
        <div class="pb-polaroid__frame">
          <img :src="shot.url" :alt="shot.title || 'Memória'" loading="lazy" />
        </div>
        <figcaption v-if="shot.caption" class="pb-polaroid__caption">{{ shot.caption }}</figcaption>
      </figure>
    </div>

    <p v-else class="pb-board__empty">Adicione fotos na fototeca para colar no quadro.</p>

    <footer v-if="showFooter" class="pb-board__footer">
      <RichText v-if="book.closingMessage" :text="book.closingMessage" class="pb-board__msg" />
      <p v-if="book.signature" class="pb-board__sign">{{ book.signature }}</p>
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

type Decor = 'tape-amber' | 'tape-mint' | 'tape-rose' | 'pin-red' | 'pin-blue' | 'corners' | 'clip'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const theme = computed(() => getBookTheme(normalizePresentationId(props.book.presentation)))
const bookConfig = computed(() => normalizeBookConfig(props.book.bookConfig))

const boardStyle = computed(() =>
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
    'Coladas com carinho',
)

const DECORS: Decor[] = [
  'tape-amber',
  'pin-red',
  'tape-mint',
  'corners',
  'pin-blue',
  'tape-rose',
  'clip',
  'tape-amber',
]

const ROTATIONS = [-8, 5, -3, 7, -6, 4, -9, 6, -2, 8, -5, 3]
const SIZES = ['md', 'sm', 'md', 'lg', 'sm', 'md'] as const

const shots = computed(() => {
  const photos = props.book.contentPages.flatMap((page) => page.photos)
  return photos.map((photo, index) => {
    const rot = ROTATIONS[index % ROTATIONS.length]
    const size = SIZES[index % SIZES.length]
    const decor = DECORS[index % DECORS.length]
    const delay = Math.min(index * 45, 600)
    return {
      id: photo.id,
      url: photo.url,
      title: photo.title,
      caption: photo.title || photo.caption || photo.memoryDate,
      decor,
      size,
      style: {
        '--pb-rot': `${rot}deg`,
        '--pb-delay': `${delay}ms`,
        zIndex: String(10 + (index % 7)),
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
.pb-board {
  --pb-cork: var(--book-paper);
  --pb-cork-dark: var(--book-paper-alt);
  width: 100%;
  min-height: var(--exp-stage, 100svh);
  padding: clamp(20px, 4vw, 36px) clamp(14px, 3vw, 28px) clamp(36px, 6vw, 56px);
  color: var(--book-ink);
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.18), transparent 42%),
    radial-gradient(circle at 82% 70%, rgba(0, 0, 0, 0.12), transparent 48%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 11px,
      rgba(0, 0, 0, 0.03) 11px,
      rgba(0, 0, 0, 0.03) 12px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 11px,
      rgba(0, 0, 0, 0.025) 11px,
      rgba(0, 0, 0, 0.025) 12px
    ),
    linear-gradient(145deg, var(--pb-cork) 0%, var(--pb-cork-dark) 100%);
  box-shadow: inset 0 0 0 10px rgba(62, 44, 28, 0.18), inset 0 0 0 14px rgba(255, 245, 220, 0.12);
}

.pb-board--preview {
  min-height: auto;
}

.pb-board__header {
  text-align: center;
  margin-bottom: clamp(18px, 4vw, 28px);
}

.pb-board__eyebrow {
  margin: 0 0 6px;
  font-family: var(--book-font-body);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--book-muted);
}

.pb-board__title {
  margin: 0;
  font-family: var(--book-font-display);
  font-size: clamp(2.2rem, 7vw, 3.4rem);
  font-weight: 700;
  line-height: 1;
  color: #2a2118;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
}

.pb-board__subtitle {
  margin: 8px 0 0;
  font-family: var(--book-font-display);
  font-size: clamp(1.05rem, 2.8vw, 1.35rem);
  color: var(--book-muted);
}

.pb-board__stage {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: clamp(10px, 2.5vw, 22px) clamp(8px, 2vw, 18px);
  padding: clamp(8px, 2vw, 16px);
  max-width: 1100px;
  margin: 0 auto;
}

.pb-board__empty {
  text-align: center;
  color: var(--book-muted);
  font-family: var(--book-font-display);
  font-size: 1.2rem;
  padding: 48px 16px;
}

.pb-polaroid {
  position: relative;
  width: min(42vw, 168px);
  margin: 6px;
  padding: 10px 10px 28px;
  background: #f7f4ee;
  border-radius: 2px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 14px 28px -12px rgba(0, 0, 0, 0.45),
    0 4px 10px -4px rgba(0, 0, 0, 0.25);
  transform: rotate(var(--pb-rot, 0deg));
  animation: pb-drop 520ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
  animation-delay: var(--pb-delay, 0ms);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.pb-polaroid:hover {
  transform: rotate(0deg) translateY(-4px) scale(1.03);
  z-index: 40 !important;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 22px 36px -14px rgba(0, 0, 0, 0.5);
}

.pb-polaroid--size-sm {
  width: min(36vw, 132px);
  padding-bottom: 22px;
}

.pb-polaroid--size-lg {
  width: min(48vw, 196px);
  padding-bottom: 34px;
}

.pb-polaroid__frame {
  aspect-ratio: 1;
  overflow: hidden;
  background: #1a1a1a;
}

.pb-polaroid__frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pb-polaroid__caption {
  margin-top: 8px;
  min-height: 1.1em;
  font-family: var(--book-font-display);
  font-size: 0.95rem;
  line-height: 1.15;
  text-align: center;
  color: #3a342c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pb-polaroid__attach {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}

/* Washi tapes */
.pb-polaroid--decor-tape-amber .pb-polaroid__attach,
.pb-polaroid--decor-tape-mint .pb-polaroid__attach,
.pb-polaroid--decor-tape-rose .pb-polaroid__attach {
  top: -10px;
  left: 50%;
  width: 54%;
  height: 18px;
  transform: translateX(-50%) rotate(-2deg);
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  opacity: 0.92;
}

.pb-polaroid--decor-tape-amber .pb-polaroid__attach {
  background: repeating-linear-gradient(
    90deg,
    #e8b84a 0 8px,
    #f0c85c 8px 16px
  );
}

.pb-polaroid--decor-tape-mint .pb-polaroid__attach {
  background: repeating-linear-gradient(
    90deg,
    #7ec8a4 0 7px,
    #95d4b4 7px 14px
  );
  transform: translateX(-50%) rotate(3deg);
}

.pb-polaroid--decor-tape-rose .pb-polaroid__attach {
  background: repeating-linear-gradient(
    90deg,
    #e89aaa 0 6px,
    #f0b0bc 6px 12px
  );
  left: 18%;
  transform: rotate(-8deg);
}

/* Pins */
.pb-polaroid--decor-pin-red .pb-polaroid__attach,
.pb-polaroid--decor-pin-blue .pb-polaroid__attach {
  top: -6px;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.pb-polaroid--decor-pin-red .pb-polaroid__attach {
  background: radial-gradient(circle at 35% 30%, #ff7a7a, #c62828);
}

.pb-polaroid--decor-pin-blue .pb-polaroid__attach {
  background: radial-gradient(circle at 35% 30%, #7eb6ff, #1565c0);
  left: 22%;
}

/* Photo corners */
.pb-polaroid--decor-corners .pb-polaroid__attach {
  inset: 6px;
  background:
    linear-gradient(135deg, #d4b896 50%, transparent 50%) 0 0 / 16px 16px no-repeat,
    linear-gradient(-135deg, #d4b896 50%, transparent 50%) 100% 0 / 16px 16px no-repeat,
    linear-gradient(45deg, #d4b896 50%, transparent 50%) 0 100% / 16px 16px no-repeat,
    linear-gradient(-45deg, #d4b896 50%, transparent 50%) 100% 100% / 16px 16px no-repeat;
  opacity: 0.9;
}

/* Binder clip */
.pb-polaroid--decor-clip .pb-polaroid__attach {
  top: -14px;
  left: 50%;
  width: 22px;
  height: 28px;
  transform: translateX(-50%);
  border: 2.5px solid #2b2b2b;
  border-bottom: 0;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(#555, #2b2b2b);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.pb-polaroid--decor-clip .pb-polaroid__attach::after {
  content: '';
  position: absolute;
  left: 3px;
  right: 3px;
  bottom: -8px;
  height: 10px;
  border: 2px solid #2b2b2b;
  border-top: 0;
  border-radius: 0 0 3px 3px;
  background: #3a3a3a;
}

.pb-board__footer {
  max-width: 520px;
  margin: clamp(28px, 5vw, 44px) auto 0;
  text-align: center;
  padding: 18px;
  background: color-mix(in srgb, #fff8ec 82%, transparent);
  border-radius: 4px;
  box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.35);
}

.pb-board__msg {
  font-family: var(--book-font-display);
  font-size: 1.15rem;
  margin: 0;
}

.pb-board__sign {
  margin: 10px 0 0;
  font-family: var(--book-font-display);
  font-size: 1.3rem;
  color: var(--book-muted);
}

@keyframes pb-drop {
  from {
    opacity: 0;
    transform: rotate(var(--pb-rot, 0deg)) translateY(-18px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: rotate(var(--pb-rot, 0deg)) translateY(0) scale(1);
  }
}

@media (max-width: 640px) {
  .pb-polaroid {
    width: min(44vw, 148px);
  }
}
</style>
