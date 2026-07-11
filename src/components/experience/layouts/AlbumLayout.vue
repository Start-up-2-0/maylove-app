<template>
  <div class="alb" :class="{ 'alb--preview': mode === 'preview' }">
    <div class="alb__book" :style="{ perspective: '2200px' }">
      <transition :name="dir === 'next' ? 'flip-next' : 'flip-prev'" mode="out-in">
        <section :key="index" class="alb__spread" :class="`alb__spread--${current.kind}`">
          <!-- Capa -->
          <template v-if="current.kind === 'cover'">
            <div class="alb__cover">
              <p class="exp-eyebrow">Álbum de memórias</p>
              <h1 class="alb__cover-title">{{ content.title }}</h1>
              <p v-if="content.subtitle" class="alb__cover-sub">{{ content.subtitle }}</p>
              <span class="alb__cover-rule" />
              <p class="alb__cover-hint">Folheie as páginas →</p>
            </div>
          </template>

          <!-- Contracapa -->
          <template v-else-if="current.kind === 'back'">
            <div class="alb__cover alb__cover--back">
              <RichText v-if="content.includeClosingMessage && content.closingMessage" :text="content.closingMessage" class="alb__closing" />
              <p class="alb__sign">{{ content.signature || content.senderName }}</p>
              <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="content.title" />
            </div>
          </template>

          <!-- Página de conteúdo -->
          <template v-else>
            <div class="alb__page alb__page--photo">
              <figure v-if="current.photo" class="alb__frame">
                <img :src="current.photo.url" :alt="current.title || 'Memória'" loading="lazy" />
              </figure>
              <div v-else class="alb__frame alb__frame--empty" />
            </div>
            <div class="alb__page alb__page--text">
              <span class="alb__num">{{ current.pageNo }}</span>
              <h2 v-if="current.title" class="alb__page-title">{{ current.title }}</h2>
              <RichText v-if="current.message" :text="current.message" class="alb__page-msg" />
            </div>
          </template>
        </section>
      </transition>
    </div>

    <nav class="alb__nav">
      <button class="alb__btn" :disabled="index === 0" aria-label="Página anterior" @click="go(-1)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <span class="alb__count">{{ index + 1 }} / {{ pages.length }}</span>
      <button class="alb__btn" :disabled="index === pages.length - 1" aria-label="Próxima página" @click="go(1)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExperienceMediaItem, LayoutComponentProps } from '@/templates/types'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

interface AlbumPage {
  kind: 'cover' | 'content' | 'back'
  photo?: ExperienceMediaItem
  title?: string
  message?: string
  pageNo?: number
}

const props = defineProps<LayoutComponentProps>()

const index = ref(0)
const dir = ref<'next' | 'prev'>('next')

const pages = computed<AlbumPage[]>(() => {
  const contentPages: AlbumPage[] = []
  const count = Math.max(props.content.photos.length, props.content.messages.length)
  for (let i = 0; i < count; i += 1) {
    contentPages.push({
      kind: 'content',
      photo: props.content.photos[i],
      title: props.content.timeline[i]?.title,
      message: props.content.messages[i] || props.content.timeline[i]?.description || '',
      pageNo: i + 1,
    })
  }
  if (!contentPages.length && props.content.includeOpeningMessage) {
    contentPages.push({ kind: 'content', message: props.content.message, pageNo: 1 })
  }
  return [{ kind: 'cover' }, ...contentPages, { kind: 'back' }]
})

const current = computed(() => pages.value[index.value])

function go(delta: number) {
  const next = index.value + delta
  if (next < 0 || next >= pages.value.length) return
  dir.value = delta > 0 ? 'next' : 'prev'
  index.value = next
}
</script>

<style scoped>
.alb {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  min-height: var(--exp-stage, 100svh);
  padding: clamp(24px, 6vw, 60px) clamp(16px, 5vw, 40px);
}
.alb--preview {
  min-height: var(--exp-stage, 620px);
}
.alb__book {
  width: min(880px, 100%);
}
.alb__spread {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: clamp(320px, 52vh, 460px);
  border-radius: 10px;
  overflow: hidden;
  background: var(--exp-surface, #fff);
  border: 1px solid var(--exp-border);
  box-shadow: 0 30px 70px -34px rgba(0, 0, 0, 0.5);
  transform-style: preserve-3d;
}
.alb__spread--cover,
.alb__spread--back {
  grid-template-columns: 1fr;
}

.alb__cover {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  padding: clamp(30px, 6vw, 60px);
  background:
    radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--exp-primary) 16%, transparent), transparent 60%),
    var(--exp-surface, #fff);
}
.alb__cover-title {
  font-size: clamp(2rem, 6vw, 3.4rem);
}
.alb__cover-sub {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--exp-muted);
}
.alb__cover-rule {
  width: 70px;
  height: 2px;
  background: var(--exp-primary);
  border-radius: 2px;
}
.alb__cover-hint {
  font-size: 0.85rem;
  color: var(--exp-muted);
}
.alb__closing {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.4rem;
  color: var(--exp-ink);
  max-width: 40ch;
}
.alb__sign {
  font-family: 'Caveat', cursive;
  font-size: 2rem;
  color: var(--exp-primary);
}

.alb__page {
  padding: clamp(20px, 3vw, 34px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.alb__page--photo {
  background: color-mix(in srgb, var(--exp-primary) 6%, var(--exp-surface, #fff));
  border-right: 1px solid var(--exp-border);
}
.alb__frame {
  padding: 12px 12px 30px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 16px 34px -18px rgba(0, 0, 0, 0.5);
  transform: rotate(-1.5deg);
}
.alb__frame img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 2px;
}
.alb__frame--empty {
  aspect-ratio: 4 / 3;
  background: color-mix(in srgb, var(--exp-primary) 10%, transparent);
}
.alb__num {
  font-family: var(--exp-font-display);
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  color: var(--exp-primary);
  margin-bottom: 10px;
}
.alb__page-title {
  font-size: clamp(1.3rem, 3vw, 1.9rem);
  margin-bottom: 12px;
}
.alb__page-msg {
  font-family: var(--exp-font-display);
  font-size: clamp(1.02rem, 2.4vw, 1.25rem);
  line-height: 1.8;
  color: var(--exp-text);
}

.alb__nav {
  display: flex;
  align-items: center;
  gap: 18px;
}
.alb__btn {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid var(--exp-border);
  color: var(--exp-primary);
  background: var(--exp-surface, #fff);
  cursor: pointer;
  transition: transform 0.2s var(--exp-ease), background 0.2s var(--exp-ease);
}
.alb__btn:hover:not(:disabled) {
  transform: scale(1.08);
  background: color-mix(in srgb, var(--exp-primary) 12%, var(--exp-surface, #fff));
}
.alb__btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.alb__count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--exp-muted);
  min-width: 64px;
  text-align: center;
}

/* Virar de página (3D) */
.flip-next-enter-active,
.flip-prev-enter-active {
  transition: transform 0.6s var(--exp-ease), opacity 0.6s var(--exp-ease);
  transform-origin: left center;
}
.flip-next-leave-active,
.flip-prev-leave-active {
  transition: transform 0.6s var(--exp-ease), opacity 0.6s var(--exp-ease);
  transform-origin: left center;
}
.flip-next-enter-from {
  transform: rotateY(-90deg);
  opacity: 0;
}
.flip-next-leave-to {
  transform: rotateY(75deg);
  opacity: 0;
}
.flip-prev-enter-from {
  transform: rotateY(90deg);
  opacity: 0;
}
.flip-prev-leave-to {
  transform: rotateY(-75deg);
  opacity: 0;
}

@media (max-width: 640px) {
  .alb__spread:not(.alb__spread--cover):not(.alb__spread--back) {
    grid-template-columns: 1fr;
  }
  .alb__page--photo {
    border-right: none;
    border-bottom: 1px solid var(--exp-border);
  }
}
@media (prefers-reduced-motion: reduce) {
  .flip-next-enter-active,
  .flip-prev-enter-active,
  .flip-next-leave-active,
  .flip-prev-leave-active {
    transition: opacity 0.3s ease;
    transform: none !important;
  }
}
</style>
