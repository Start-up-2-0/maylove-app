<template>
  <div
    class="book"
    :class="[
      `book--${mode}`,
      tplClass,
      { 'book--preview': mode === 'preview' },
      { 'book--open': opened },
      { 'book--closed': !opened },
    ]"
    :style="themeStyle"
  >
    <div
      ref="albumRef"
      class="book__album"
      :class="{ 'book__album--binder': showBinder && opened }"
    >
      <section
        class="book__sheet book__sheet--cover"
        :class="{ 'book__sheet--cover-closed': !opened }"
        aria-label="Capa do álbum"
      >
        <button
          v-if="!opened"
          type="button"
          class="book__cover-btn"
          aria-expanded="false"
          aria-controls="book-pages"
          @click="openAlbum"
        >
          <slot name="cover" :book="book" :opened="opened" />
        </button>
        <div v-else class="book__cover-open">
          <slot name="cover" :book="book" :opened="opened" />
          <button type="button" class="book__close-btn" @click="closeAlbum">
            Fechar álbum
          </button>
        </div>
      </section>

      <div v-if="opened" id="book-pages" class="book__pages" ref="pagesRef">
        <section
          v-for="page in book.contentPages"
          :key="page.pageNo"
          class="book__sheet book__sheet--content"
          :class="{ 'book__sheet--spread': page.layout === 'double-spread' }"
          :aria-label="`Página ${page.pageNo}`"
        >
          <span v-if="showBinder" class="book__gutter" aria-hidden="true" />
          <slot name="page" :page="page" :book="book" />
        </section>

        <section
          v-if="showBackCover"
          class="book__sheet book__sheet--back"
          aria-label="Contracapa do álbum"
        >
          <slot name="back" :book="book" :share-url="shareUrl" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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

const opened = ref(props.mode === 'preview')
const pagesRef = ref<HTMLElement | null>(null)
const albumRef = ref<HTMLElement | null>(null)

const themeStyle = computed(() => ({
  '--book-accent': props.book.colorPrimary,
  ...props.shellStyle,
}))

/** Evita folha branca vazia quando não há mensagem, assinatura nem compartilhar */
const showBackCover = computed(() => {
  const hasClosing = Boolean(props.book.closingMessage?.trim())
  const hasSignature = Boolean(props.book.signature?.trim())
  const hasShare = props.mode === 'full' && Boolean(props.shareUrl?.trim())
  return hasClosing || hasSignature || hasShare
})

onMounted(() => {
  if (props.mode === 'preview') opened.value = true
})

watch(
  () => props.mode,
  (mode) => {
    if (mode === 'preview') opened.value = true
  },
)

async function openAlbum() {
  opened.value = true
  await nextTick()
  pagesRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function closeAlbum() {
  opened.value = false
  nextTick(() => {
    if (albumRef.value) {
      albumRef.value.scrollTop = 0
    }
    if (props.mode === 'full') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
}
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

.book--closed .book__album {
  justify-content: center;
  min-height: inherit;
}

.book--preview .book__album {
  max-height: clamp(400px, 64vh, 680px);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--book-accent) 40%, transparent) transparent;
}

.book__pages {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: inherit;
  width: 100%;
  animation: book-pages-in 420ms var(--book-ease) both;
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

.book--closed .book__sheet--cover-closed {
  min-height: clamp(360px, 62vh, 560px);
  max-width: min(560px, 100%);
  margin-inline: auto;
  cursor: pointer;
  transition:
    transform 280ms var(--book-ease),
    box-shadow 280ms var(--book-ease);
}

.book--closed .book__sheet--cover-closed:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.65) inset,
    0 28px 56px -24px rgba(30, 24, 20, 0.42),
    0 8px 18px -8px rgba(30, 24, 20, 0.18);
}

.book__cover-btn {
  display: block;
  width: 100%;
  min-height: inherit;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: inherit;
  cursor: pointer;
}

.book__cover-open {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: inherit;
}

.book__close-btn {
  align-self: center;
  margin: 0 0 18px;
  padding: 8px 16px;
  border: 1px solid color-mix(in srgb, var(--book-accent) 35%, var(--book-border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--book-paper) 88%, #fff);
  color: var(--book-ink);
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    background 180ms var(--book-ease),
    border-color 180ms var(--book-ease);
}

.book__close-btn:hover {
  background: color-mix(in srgb, var(--book-accent) 10%, var(--book-paper));
  border-color: var(--book-accent);
}

.book__sheet--content {
  min-height: auto;
  background: var(--book-paper-alt);
}

.book__sheet--spread {
  width: min(1080px, 100%);
  max-width: none;
}

@media (min-width: 960px) {
  .book__sheet--spread {
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.65) inset,
      12px 0 28px -24px rgba(30, 24, 20, 0.28),
      -12px 0 28px -24px rgba(30, 24, 20, 0.28),
      0 20px 48px -28px rgba(30, 24, 20, 0.35);
  }
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

@keyframes book-pages-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .book--closed .book__sheet--cover-closed {
    min-height: clamp(300px, 58vh, 460px);
  }

  .book__sheet--content {
    min-height: auto;
  }

  .book__gutter {
    width: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .book--preview .book__album {
    scroll-behavior: auto;
  }

  .book__pages {
    animation: none;
  }

  .book--closed .book__sheet--cover-closed,
  .book--closed .book__sheet--cover-closed:hover {
    transition: none;
    transform: none;
  }
}
</style>
