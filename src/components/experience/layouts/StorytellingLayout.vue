<template>
  <div
    class="st"
    :class="{ 'st--preview': mode === 'preview' }"
    tabindex="0"
    @keydown.right.prevent="go(1)"
    @keydown.left.prevent="go(-1)"
    @keydown.space.prevent="go(1)"
  >
    <div class="st__progress">
      <span class="st__progress-bar" :style="{ width: `${((index + 1) / chapters.length) * 100}%` }" />
    </div>

    <transition :name="dir === 'next' ? 'st-next' : 'st-prev'" mode="out-in">
      <section :key="index" class="st__chapter" :class="`st__chapter--${current.kind}`">
        <div v-if="current.photo" class="st__bg" :style="bgStyle(current.photo.url)" />
        <div class="st__scrim" />
        <div class="st__inner">
          <p v-if="current.eyebrow" class="st__eyebrow">{{ current.eyebrow }}</p>
          <h1 v-if="current.title" class="st__title">{{ current.title }}</h1>
          <RichText v-if="current.text" :text="current.text" class="st__text" />
          <p v-if="current.kind === 'end'" class="st__sign">{{ content.signature || content.senderName }}</p>
          <ShareBar
            v-if="current.kind === 'end' && mode === 'full' && shareUrl"
            :url="shareUrl"
            :text="content.title"
          />
        </div>
      </section>
    </transition>

    <div class="st__dots">
      <button
        v-for="(_, i) in chapters"
        :key="i"
        class="st__dot"
        :class="{ 'is-active': i === index }"
        :aria-label="`Capítulo ${i + 1}`"
        @click="jump(i)"
      />
    </div>

    <button v-if="index > 0" class="st__arrow st__arrow--prev" aria-label="Capítulo anterior" @click="go(-1)">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <button v-if="index < chapters.length - 1" class="st__arrow st__arrow--next" aria-label="Próximo capítulo" @click="go(1)">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'
import type { ExperienceMediaItem, LayoutComponentProps } from '@/templates/types'
import { htmlToPlain } from '@/utils/richText'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

interface Chapter {
  kind: 'intro' | 'scene' | 'end'
  eyebrow?: string
  title?: string
  text?: string
  photo?: ExperienceMediaItem
}

const props = defineProps<LayoutComponentProps>()

const index = ref(0)
const dir = ref<'next' | 'prev'>('next')

const chapters = computed<Chapter[]>(() => {
  const list: Chapter[] = []
  list.push({
    kind: 'intro',
    eyebrow: props.content.senderName || 'Nossa história',
    title: props.content.title,
    text: props.content.subtitle,
    photo: props.content.photos[0],
  })

  if (props.content.timeline.length) {
    props.content.timeline.forEach((item, i) => {
      list.push({
        kind: 'scene',
        eyebrow: item.date || `Capítulo ${i + 1}`,
        title: item.title,
        text: item.description,
        photo: props.content.photos[i + 1] ?? props.content.photos[i] ?? props.content.photos[0],
      })
    })
  } else if (props.content.includeOpeningMessage) {
    const msgs = props.content.messages.length ? props.content.messages : [props.content.message]
    msgs.filter(Boolean).forEach((msg, i) => {
      list.push({
        kind: 'scene',
        eyebrow: `Capítulo ${i + 1}`,
        text: msg,
        photo: props.content.photos[i + 1] ?? props.content.photos[i],
      })
    })
  }

  if (props.content.includeClosingMessage) {
    list.push({
      kind: 'end',
      eyebrow: 'Para sempre',
      title: htmlToPlain(props.content.closingMessage),
      photo: props.content.photos[props.content.photos.length - 1],
    })
  }
  return list
})

const current = computed(() => chapters.value[index.value])

function bgStyle(url: string): CSSProperties {
  return { backgroundImage: `url("${url}")` }
}

function go(delta: number) {
  const next = index.value + delta
  if (next < 0 || next >= chapters.value.length) return
  dir.value = delta > 0 ? 'next' : 'prev'
  index.value = next
}
function jump(i: number) {
  dir.value = i > index.value ? 'next' : 'prev'
  index.value = i
}
</script>

<style scoped>
.st {
  position: relative;
  height: var(--exp-stage, 100svh);
  overflow: hidden;
  outline: none;
  background: #000;
}
.st--preview {
  height: var(--exp-stage, 620px);
}
.st__progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  z-index: 5;
  background: rgba(255, 255, 255, 0.18);
}
.st__progress-bar {
  display: block;
  height: 100%;
  background: var(--exp-primary);
  transition: width 0.6s var(--exp-ease);
}
.st__chapter {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  padding: clamp(30px, 8vw, 90px);
}
.st__bg {
  position: absolute;
  inset: -4%;
  background-size: cover;
  background-position: center;
  animation: st-kenburns 14s ease-out forwards;
  z-index: 0;
}
.st__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(120% 90% at 50% 40%, transparent 0%, rgba(0, 0, 0, 0.35) 100%),
    linear-gradient(180deg, color-mix(in srgb, var(--exp-primary) 30%, rgba(0, 0, 0, 0.55)) 0%, rgba(0, 0, 0, 0.72) 100%);
}
.st__inner {
  position: relative;
  z-index: 2;
  max-width: 760px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.st__eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--exp-accent) 60%, #fff);
}
.st__title {
  color: #fff;
  font-size: clamp(2rem, 7vw, 4.4rem);
  text-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
}
.st__text {
  font-family: var(--exp-font-display);
  font-size: clamp(1.1rem, 3vw, 1.7rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
  max-width: 60ch;
}
.st__sign {
  font-family: 'Caveat', cursive;
  font-size: 2.3rem;
  color: color-mix(in srgb, var(--exp-accent) 70%, #fff);
}
.st__dots {
  position: absolute;
  right: clamp(14px, 3vw, 26px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.st__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.35);
  transition: transform 0.2s var(--exp-ease), background 0.2s var(--exp-ease);
}
.st__dot.is-active {
  background: #fff;
  transform: scale(1.5);
}
.st__arrow {
  position: absolute;
  bottom: clamp(18px, 4vw, 34px);
  z-index: 5;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: transform 0.2s var(--exp-ease), background 0.2s var(--exp-ease);
}
.st__arrow:hover {
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.24);
}
.st__arrow--prev {
  left: clamp(14px, 4vw, 34px);
}
.st__arrow--next {
  right: clamp(14px, 4vw, 34px);
}

@keyframes st-kenburns {
  from { transform: scale(1.12) translate(1%, 1%); }
  to { transform: scale(1) translate(-1%, -1%); }
}

.st-next-enter-active,
.st-prev-enter-active {
  transition: opacity 0.7s var(--exp-ease), transform 0.7s var(--exp-ease);
}
.st-next-leave-active,
.st-prev-leave-active {
  transition: opacity 0.5s var(--exp-ease), transform 0.5s var(--exp-ease);
}
.st-next-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(1.02);
}
.st-next-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.99);
}
.st-prev-enter-from {
  opacity: 0;
  transform: translateY(-40px) scale(1.02);
}
.st-prev-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.99);
}

@media (prefers-reduced-motion: reduce) {
  .st__bg { animation: none; }
  .st-next-enter-active,
  .st-prev-enter-active,
  .st-next-leave-active,
  .st-prev-leave-active {
    transition: opacity 0.3s ease;
    transform: none !important;
  }
}
</style>
