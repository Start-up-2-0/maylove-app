<template>
  <div
    class="book"
    :class="[
      `book--${mode}`,
      tplClass,
      { 'book--opened': opened, 'book--preview': mode === 'preview' },
    ]"
    :style="themeStyle"
  >
    <div
      class="book__stage"
      tabindex="0"
      ref="stageRef"
      @keydown.left.prevent="go(-1)"
      @keydown.right.prevent="go(1)"
    >
      <div class="book__shadow book__shadow--left" aria-hidden="true" />
      <div class="book__shadow book__shadow--right" aria-hidden="true" />
      <div v-if="showBinder && current.kind === 'content'" class="book__binder" aria-hidden="true" />

      <transition :name="flipName" mode="out-in">
        <article
          :key="index"
          class="book__spread"
          :class="{
            'book__spread--cover': current.kind === 'cover',
            'book__spread--back': current.kind === 'back',
            'book__spread--content': current.kind === 'content',
          }"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <slot v-if="current.kind === 'cover'" name="cover" :book="book" />
          <slot v-else-if="current.kind === 'back'" name="back" :book="book" :share-url="shareUrl" />
          <slot v-else name="page" :page="current" :book="book" />
        </article>
      </transition>
    </div>

    <nav class="book__nav" aria-label="Navegação do livro">
      <button class="book__btn" :disabled="index === 0" aria-label="Página anterior" @click="go(-1)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <span class="book__count">{{ index + 1 }} / {{ pages.length }}</span>
      <button
        class="book__btn"
        :disabled="index === pages.length - 1"
        aria-label="Próxima página"
        @click="go(1)"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { BookRenderMode, MemoryBookModel, MemoryBookPage } from '../types'

const props = withDefaults(
  defineProps<{
    book: MemoryBookModel
    mode: BookRenderMode
    shareUrl?: string
    tplClass?: string
    showBinder?: boolean
  }>(),
  { showBinder: false },
)

const index = ref(0)
const dir = ref<'next' | 'prev'>('next')
const opened = ref(false)
const stageRef = ref<HTMLElement | null>(null)
const touchStartX = ref(0)

const themeStyle = computed(() => ({
  '--book-accent': props.book.colorPrimary,
}))

const pages = computed<MemoryBookPage[]>(() => [
  { kind: 'cover' },
  ...props.book.contentPages,
  { kind: 'back' },
])

const current = computed(() => pages.value[index.value] ?? { kind: 'cover' as const })

const flipName = computed(() => (dir.value === 'next' ? 'book-flip-next' : 'book-flip-prev'))

onMounted(() => {
  window.setTimeout(() => {
    opened.value = true
  }, 120)
  stageRef.value?.focus()
})

function go(delta: number) {
  const next = index.value + delta
  if (next < 0 || next >= pages.value.length) return
  dir.value = delta > 0 ? 'next' : 'prev'
  index.value = next
}

function onTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0]?.clientX ?? 0
}

function onTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX ?? 0
  const delta = endX - touchStartX.value
  if (Math.abs(delta) < 48) return
  go(delta < 0 ? 1 : -1)
}
</script>

<style scoped>
.book {
  --book-paper: #fffdf8;
  --book-ink: #2a2420;
  --book-muted: #7a6f66;
  --book-border: rgba(42, 36, 32, 0.12);
  --book-ease: cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  min-height: var(--exp-stage, 100svh);
  padding: clamp(20px, 5vw, 48px) clamp(12px, 4vw, 32px);
  outline: none;
}

.book--preview {
  min-height: var(--exp-stage, 620px);
}

.book__stage {
  position: relative;
  width: min(920px, 100%);
  perspective: 2400px;
  transform: scale(0.94);
  opacity: 0.4;
  transition: transform 0.9s var(--book-ease), opacity 0.9s var(--book-ease);
}

.book--opened .book__stage {
  transform: scale(1);
  opacity: 1;
}

.book__binder {
  position: absolute;
  top: 8%;
  bottom: 8%;
  left: 50%;
  width: 14px;
  margin-left: -7px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.12));
  z-index: 2;
  pointer-events: none;
}

.book__shadow {
  position: absolute;
  top: 6%;
  bottom: 6%;
  width: 18%;
  pointer-events: none;
  z-index: 0;
  filter: blur(18px);
  opacity: 0.35;
}

.book__shadow--left {
  left: -4%;
  background: radial-gradient(ellipse at left, rgba(0, 0, 0, 0.35), transparent 70%);
}

.book__shadow--right {
  right: -4%;
  background: radial-gradient(ellipse at right, rgba(0, 0, 0, 0.28), transparent 70%);
}

.book__spread {
  position: relative;
  z-index: 1;
  min-height: clamp(340px, 54vh, 500px);
  border-radius: 12px;
  overflow: hidden;
  background: var(--book-paper);
  border: 1px solid var(--book-border);
  box-shadow:
    0 2px 0 rgba(255, 255, 255, 0.6) inset,
    0 28px 60px -28px rgba(0, 0, 0, 0.45);
  transform-style: preserve-3d;
}

.book__spread--cover,
.book__spread--back {
  display: flex;
  align-items: center;
  justify-content: center;
}

.book__nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.book__btn {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid var(--book-border);
  color: var(--book-accent);
  background: var(--book-paper);
  cursor: pointer;
  transition: transform 0.2s var(--book-ease), background 0.2s var(--book-ease);
}

.book__btn:hover:not(:disabled) {
  transform: scale(1.06);
  background: color-mix(in srgb, var(--book-accent) 10%, var(--book-paper));
}

.book__btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.book__count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--book-muted);
  min-width: 72px;
  text-align: center;
}

.book-flip-next-enter-active,
.book-flip-prev-enter-active {
  transition: transform 0.65s var(--book-ease), opacity 0.65s var(--book-ease);
  transform-origin: left center;
}

.book-flip-next-leave-active,
.book-flip-prev-leave-active {
  transition: transform 0.65s var(--book-ease), opacity 0.65s var(--book-ease);
  transform-origin: left center;
}

.book-flip-next-enter-from {
  transform: rotateY(-88deg);
  opacity: 0;
}

.book-flip-next-leave-to {
  transform: rotateY(72deg);
  opacity: 0;
}

.book-flip-prev-enter-from {
  transform: rotateY(88deg);
  opacity: 0;
}

.book-flip-prev-leave-to {
  transform: rotateY(-72deg);
  opacity: 0;
}

@media (max-width: 640px) {
  .book {
    gap: 12px;
    min-height: auto;
    padding:
      max(10px, env(safe-area-inset-top))
      max(8px, env(safe-area-inset-right))
      max(10px, env(safe-area-inset-bottom))
      max(8px, env(safe-area-inset-left));
  }

  .book--preview {
    min-height: auto;
  }

  .book__stage {
    width: 100%;
    transform: none;
    opacity: 1;
  }

  .book--opened .book__stage {
    transform: none;
  }

  .book__spread {
    min-height: clamp(300px, 62svh, 460px);
    border-radius: 10px;
  }

  .book__shadow {
    display: none;
  }

  .book__binder {
    display: none;
  }

  .book__nav {
    gap: 12px;
    width: 100%;
    justify-content: center;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .book__btn {
    width: 42px;
    height: 42px;
  }

  .book__count {
    font-size: 0.82rem;
    min-width: 60px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .book__stage {
    transform: none !important;
    opacity: 1 !important;
    transition: none;
  }

  .book-flip-next-enter-active,
  .book-flip-prev-enter-active,
  .book-flip-next-leave-active,
  .book-flip-prev-leave-active {
    transition: opacity 0.25s ease;
    transform: none !important;
  }
}
</style>
