<template>
  <div class="ltr" :class="{ 'ltr--preview': mode === 'preview' }">
    <article class="ltr__paper">
      <header class="ltr__head">
        <p v-if="content.subtitle" class="ltr__eyebrow exp-eyebrow">{{ content.subtitle }}</p>
        <h1 class="ltr__title">{{ content.title }}</h1>
        <p v-if="content.honoreeName" class="ltr__to">Para {{ content.honoreeName }}</p>
      </header>

      <div v-if="paragraphs.length || messageIsHtml" class="ltr__body">
        <template v-if="messageIsHtml">
          <RichText :text="content.message" class="ltr__para" />
          <p v-for="(para, i) in extraParagraphs" :key="i" class="ltr__para">{{ para }}</p>
        </template>
        <template v-else>
          <p v-for="(para, i) in paragraphs" :key="i" class="ltr__para">{{ para }}</p>
        </template>
      </div>

      <div v-if="content.photos.length" class="ltr__photos">
        <figure v-for="photo in photos" :key="photo.id" class="ltr__photo">
          <img :src="photo.url" :alt="content.title" loading="lazy" />
        </figure>
      </div>

      <footer class="ltr__foot">
        <RichText v-if="content.closingMessage" :text="content.closingMessage" class="ltr__closing" />
        <p class="ltr__sign">{{ content.signature || content.senderName }}</p>
        <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="content.title" />
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutComponentProps } from '@/templates/types'
import { containsHtml } from '@/utils/richText'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

const props = defineProps<LayoutComponentProps>()

const messageIsHtml = computed(() => containsHtml(props.content.message))
const extraParagraphs = computed(() => props.content.messages.filter(Boolean))

const paragraphs = computed<string[]>(() => {
  const base = (props.content.message || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const extra = props.content.messages.filter(Boolean)
  const all = [...base, ...extra]
  return all.length ? all : []
})

// Poucas fotos, para manter o clima minimalista de carta.
const photos = computed(() => props.content.photos.slice(0, 3))
</script>

<style scoped>
.ltr {
  display: grid;
  place-items: center;
  min-height: var(--exp-stage, 100svh);
  padding: clamp(28px, 7vw, 80px) clamp(16px, 5vw, 40px);
}
.ltr--preview {
  min-height: var(--exp-stage, 620px);
}
.ltr__paper {
  width: min(640px, 100%);
  padding: clamp(30px, 6vw, 64px) clamp(24px, 6vw, 60px);
  border-radius: 8px;
  background: var(--exp-surface, #fff);
  border: 1px solid var(--exp-border);
  box-shadow: 0 30px 80px -40px rgba(0, 0, 0, 0.45);
  animation: ltr-in 0.9s var(--exp-ease) both;
}
.ltr__head {
  text-align: center;
  margin-bottom: clamp(22px, 4vw, 34px);
}
.ltr__eyebrow {
  font-style: normal;
  margin-bottom: 12px;
}
.ltr__title {
  font-family: var(--exp-font-display);
  font-size: clamp(1.9rem, 5vw, 3rem);
  line-height: 1.15;
  color: var(--exp-ink, var(--exp-text));
}
.ltr__to {
  margin-top: 12px;
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.1rem;
  color: var(--exp-muted);
}
.ltr__body {
  text-align: center;
}
.ltr__para {
  font-family: var(--exp-font-display);
  font-size: clamp(1.05rem, 2.6vw, 1.35rem);
  line-height: 1.9;
  color: var(--exp-text);
  margin: 0 0 1.15rem;
}
.ltr__photos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin: clamp(20px, 4vw, 32px) 0;
}
.ltr__photo {
  width: min(180px, 42%);
  padding: 8px 8px 22px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 14px 30px -16px rgba(0, 0, 0, 0.5);
  transform: rotate(-2deg);
}
.ltr__photo:nth-child(even) {
  transform: rotate(2deg);
}
.ltr__photo img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 2px;
}
.ltr__foot {
  margin-top: clamp(18px, 4vw, 28px);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.ltr__closing {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.15rem;
  color: var(--exp-ink, var(--exp-text));
}
.ltr__sign {
  font-family: 'Caveat', cursive;
  font-size: 2rem;
  color: var(--exp-primary);
}
@keyframes ltr-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ltr__paper {
    animation: none;
  }
}
</style>
