<template>
  <div
    class="book"
    :class="[
      `book--${mode}`,
      tplClass,
      { 'book--preview': mode === 'preview' },
    ]"
    :style="themeStyle"
  >
    <div class="book__album" :class="{ 'book__album--binder': showBinder }">
      <section class="book__sheet book__sheet--cover" aria-label="Capa do álbum">
        <slot name="cover" :book="book" />
      </section>

      <section
        v-for="page in book.contentPages"
        :key="page.pageNo"
        class="book__sheet book__sheet--content"
        :aria-label="`Página ${page.pageNo}`"
      >
        <span v-if="showBinder" class="book__gutter" aria-hidden="true" />
        <slot name="page" :page="page" :book="book" />
      </section>

      <section class="book__sheet book__sheet--back" aria-label="Contracapa do álbum">
        <slot name="back" :book="book" :share-url="shareUrl" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookRenderMode, MemoryBookModel } from '../types'

const props = withDefaults(
  defineProps<{
    book: MemoryBookModel
    mode: BookRenderMode
    shareUrl?: string
    tplClass?: string
    showBinder?: boolean
    shellStyle?: Record<string, string>
  }>(),
  { showBinder: false },
)

const themeStyle = computed(() => ({
  '--book-accent': props.book.colorPrimary,
  ...props.shellStyle,
}))
</script>

<style scoped>
.book {
  --book-paper: #fffdf8;
  --book-ink: #2a2420;
  --book-muted: #7a6f66;
  --book-border: rgba(42, 36, 32, 0.12);
  --book-ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  min-height: var(--exp-stage, 100svh);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--book-accent) 5%, #faf8f5) 0%,
    var(--book-paper) 18%,
    color-mix(in srgb, var(--book-accent) 3%, #f5f2ec) 100%
  );
}

.book--preview {
  min-height: auto;
}

.book__album {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(20px, 4vw, 36px);
  width: min(920px, 100%);
  margin: 0 auto;
  padding: clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px);
}

.book--preview .book__album {
  max-height: clamp(400px, 64vh, 680px);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--book-accent) 40%, transparent) transparent;
}

.book__sheet {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--book-paper);
  border: 1px solid var(--book-border);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.65) inset,
    0 20px 48px -28px rgba(30, 24, 20, 0.35),
    0 4px 12px -6px rgba(30, 24, 20, 0.12);
}

.book__sheet--cover {
  min-height: clamp(280px, 48vh, 420px);
  display: flex;
  align-items: stretch;
}

.book__sheet--content {
  min-height: clamp(300px, 50vh, 480px);
}

.book__sheet--back {
  min-height: clamp(240px, 38vh, 360px);
  display: flex;
  align-items: stretch;
}

.book__album--binder .book__sheet--content {
  padding-left: 0;
}

.book__gutter {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 14px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06),
    rgba(255, 255, 255, 0.15) 45%,
    rgba(0, 0, 0, 0.04)
  );
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  pointer-events: none;
  z-index: 1;
}

@media (max-width: 640px) {
  .book {
    min-height: auto;
  }

  .book__album {
    gap: 16px;
    padding:
      max(10px, env(safe-area-inset-top))
      max(10px, env(safe-area-inset-right))
      max(16px, env(safe-area-inset-bottom))
      max(10px, env(safe-area-inset-left));
  }

  .book--preview .book__album {
    max-height: clamp(340px, 58vh, 520px);
  }

  .book__sheet {
    border-radius: 10px;
  }

  .book__sheet--cover {
    min-height: clamp(240px, 42vh, 360px);
  }

  .book__sheet--content {
    min-height: clamp(260px, 48vh, 400px);
  }

  .book__gutter {
    width: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .book--preview .book__album {
    scroll-behavior: auto;
  }
}
</style>
