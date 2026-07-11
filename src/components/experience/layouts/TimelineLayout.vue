<template>
  <div class="tl" :class="{ 'tl--preview': mode === 'preview' }">
    <header class="tl__hero">
      <p v-if="content.senderName" class="exp-eyebrow">{{ content.senderName }}</p>
      <h1 class="tl__hero-title">{{ content.title }}</h1>
      <p v-if="content.subtitle" class="tl__hero-sub">{{ content.subtitle }}</p>
      <span class="tl__hero-hint" aria-hidden="true" />
    </header>

    <div ref="track" class="tl__track">
      <span class="tl__line" aria-hidden="true">
        <span class="tl__line-fill" :style="{ height: `${fill}%` }" />
      </span>

      <article
        v-for="(item, i) in items"
        :key="i"
        v-reveal="i * 60"
        class="tl__item"
        :class="i % 2 === 0 ? 'tl__item--left' : 'tl__item--right'"
      >
        <span class="tl__node" />
        <div class="tl__card">
          <span v-if="item.date" class="tl__date">{{ item.date }}</span>
          <figure v-if="item.photo" class="tl__photo">
            <img :src="item.photo.url" :alt="item.title || 'Momento'" loading="lazy" />
          </figure>
          <h3 v-if="item.title" class="tl__title">{{ item.title }}</h3>
          <RichText v-if="item.text" :text="item.text" class="tl__text" />
        </div>
      </article>
    </div>

    <footer v-if="content.includeClosingMessage" class="tl__foot">
      <RichText v-if="content.closingMessage" :text="content.closingMessage" class="tl__closing" />
      <p class="tl__sign">{{ content.signature || content.senderName }}</p>
      <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="content.title" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ExperienceMediaItem, LayoutComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

interface TimelineEntry {
  date?: string
  title?: string
  text?: string
  photo?: ExperienceMediaItem
}

const props = defineProps<LayoutComponentProps>()

const track = ref<HTMLElement | null>(null)
const fill = ref(0)

const items = computed<TimelineEntry[]>(() => {
  if (props.content.timeline.length) {
    return props.content.timeline.map((item, i) => ({
      date: item.date,
      title: item.title,
      text: item.description,
      photo: item.photoUrl ? { id: `t${i}`, url: item.photoUrl, type: 'photo' } : props.content.photos[i],
    }))
  }
  const msgs = props.content.messages.length
    ? props.content.messages
    : props.content.includeOpeningMessage
      ? [props.content.message]
      : []
  return msgs.filter(Boolean).map((msg, i) => ({ title: `Momento ${i + 1}`, text: msg, photo: props.content.photos[i] }))
})

function onScroll() {
  const el = track.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const viewCenter = window.innerHeight * 0.6
  const progress = (viewCenter - rect.top) / rect.height
  fill.value = Math.max(0, Math.min(100, progress * 100))
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<style scoped>
.tl {
  padding-bottom: clamp(40px, 8vw, 90px);
}
.tl__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: clamp(60px, 12vw, 130px) clamp(20px, 5vw, 40px) clamp(30px, 6vw, 60px);
}
.tl__hero-title {
  font-size: clamp(2.2rem, 7vw, 4rem);
}
.tl__hero-sub {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: clamp(1.1rem, 3vw, 1.6rem);
  color: var(--exp-muted);
  max-width: 50ch;
}
.tl__hero-hint {
  margin-top: 8px;
  width: 2px;
  height: 46px;
  background: linear-gradient(var(--exp-primary), transparent);
}

.tl__track {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px clamp(16px, 5vw, 30px) 40px;
}
.tl__line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  background: color-mix(in srgb, var(--exp-primary) 18%, transparent);
  border-radius: 2px;
}
.tl__line-fill {
  display: block;
  width: 100%;
  background: var(--exp-primary);
  border-radius: 2px;
  transition: height 0.15s linear;
}
.tl__item {
  position: relative;
  width: 50%;
  padding: 0 34px 46px;
  box-sizing: border-box;
}
.tl__item--left {
  left: 0;
  text-align: right;
}
.tl__item--right {
  left: 50%;
  text-align: left;
}
.tl__node {
  position: absolute;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--exp-primary);
  border: 3px solid var(--exp-bg);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--exp-primary) 30%, transparent);
  z-index: 2;
}
.tl__item--left .tl__node {
  right: -8px;
}
.tl__item--right .tl__node {
  left: -8px;
}
.tl__card {
  display: inline-block;
  text-align: left;
  max-width: 380px;
  padding: 18px 20px;
  border-radius: 14px;
  background: var(--exp-surface, #fff);
  border: 1px solid var(--exp-border);
  box-shadow: 0 20px 44px -26px rgba(0, 0, 0, 0.4);
}
.tl__date {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--exp-primary);
  margin-bottom: 10px;
}
.tl__photo {
  margin: 0 0 12px;
  border-radius: 10px;
  overflow: hidden;
}
.tl__photo img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
.tl__title {
  font-size: 1.25rem;
  margin-bottom: 8px;
}
.tl__text {
  font-family: var(--exp-font-display);
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--exp-text);
}
.tl__foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: clamp(20px, 5vw, 40px) 20px;
}
.tl__closing {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  color: var(--exp-ink);
  max-width: 44ch;
}
.tl__sign {
  font-family: 'Caveat', cursive;
  font-size: 2rem;
  color: var(--exp-primary);
}

@media (max-width: 640px) {
  .tl__line {
    left: 14px;
  }
  .tl__item {
    width: 100%;
    left: 0 !important;
    text-align: left;
    padding: 0 0 34px 40px;
  }
  .tl__item--left {
    text-align: left;
  }
  .tl__item--left .tl__node,
  .tl__item--right .tl__node {
    left: 7px;
    right: auto;
  }
}
</style>
