<template>
  <header ref="root" class="hero" :class="`hero--${variant}`">
    <div v-if="bgImage" class="hero__bg" :style="bgStyle" />
    <div class="hero__overlay" />

    <div class="hero__content">
      <p v-if="eyebrow" v-reveal class="exp-eyebrow hero__eyebrow">{{ eyebrow }}</p>
      <h1 v-reveal="120" class="hero__title">{{ content.title }}</h1>
      <TypewriterText
        v-if="content.subtitle && typing"
        class="hero__subtitle"
        tag="p"
        :text="content.subtitle"
        :active="true"
        :speed-multiplier="theme.speedMultiplier"
      />
      <p v-else-if="content.subtitle" v-reveal="240" class="hero__subtitle">{{ content.subtitle }}</p>
      <p v-if="dateLabel" v-reveal="320" class="hero__date">{{ dateLabel }}</p>
    </div>

    <div class="hero__scroll" aria-hidden="true">
      <span class="hero__scroll-dot" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'
import TypewriterText from '../shared/TypewriterText.vue'

const props = defineProps<SectionComponentProps>()

const root = ref<HTMLElement | null>(null)
const offset = ref(0)
const typing = computed(() => props.content.textStyle === 'typewriter')

const variant = computed(() => (props.section.config?.variant as string) || 'fullscreen')
const useParallax = computed(() => props.section.config?.parallax !== false)
const eyebrow = computed(() => (props.section.config?.eyebrow as string) || props.content.senderName || '')

const bgImage = computed(() => {
  if (props.section.config?.background === 'gradient') return null
  return props.content.photos[0]?.url || null
})

const bgStyle = computed(() => ({
  backgroundImage: `url("${bgImage.value}")`,
  transform: useParallax.value ? `scale(1.08) translateY(${offset.value}px)` : 'scale(1.05)',
}))

const dateLabel = computed(() => {
  if (props.content.specialDateConfig?.enabled) return ''
  if (!props.content.specialDate) return ''
  const parsed = new Date(props.content.specialDate)
  if (Number.isNaN(parsed.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed)
})

function onScroll() {
  if (!useParallax.value || !root.value) return
  const rect = root.value.getBoundingClientRect()
  offset.value = Math.max(0, -rect.top) * 0.25
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  padding: clamp(60px, 12vw, 120px) clamp(20px, 5vw, 48px);
}
.hero--fullscreen {
  min-height: var(--exp-hero-min, 100vh);
}
.hero--card {
  min-height: var(--exp-hero-card-min, 62vh);
}
.hero__bg {
  position: absolute;
  inset: -6% 0;
  background-size: cover;
  background-position: center;
  will-change: transform;
  z-index: 0;
}
.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(120% 80% at 50% 20%, transparent 0%, color-mix(in srgb, var(--exp-primary) 30%, transparent) 120%),
    linear-gradient(180deg, color-mix(in srgb, var(--exp-primary) 22%, transparent) 0%, color-mix(in srgb, #000 55%, transparent) 100%);
}
.hero__content {
  position: relative;
  z-index: 2;
  max-width: 820px;
  color: #fff;
}
.hero__eyebrow {
  color: #fff;
  opacity: 0.85;
  margin-bottom: 18px;
}
.hero__title {
  color: #fff;
  font-size: clamp(2.4rem, 8vw, 5rem);
  font-weight: 600;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.35);
}
.hero__subtitle {
  margin-top: 18px;
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: clamp(1.1rem, 3vw, 1.7rem);
  color: rgba(255, 255, 255, 0.92);
}
.hero__date {
  margin-top: 22px;
  display: inline-block;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
}
.hero__scroll {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  width: 26px;
  height: 42px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: center;
  padding-top: 7px;
}
.hero__scroll-dot {
  width: 4px;
  height: 8px;
  border-radius: 999px;
  background: #fff;
  animation: hero-scroll 1.6s ease-in-out infinite;
}
@keyframes hero-scroll {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(12px);
    opacity: 0;
  }
}
/* Sem foto: usa gradiente da marca */
.hero:not(:has(.hero__bg)) .hero__overlay {
  background: var(--exp-bg);
}
.hero:not(:has(.hero__bg)) .hero__title,
.hero:not(:has(.hero__bg)) .hero__subtitle {
  color: var(--exp-ink);
  text-shadow: none;
}
.hero:not(:has(.hero__bg)) .hero__eyebrow {
  color: var(--exp-primary);
}
@media (prefers-reduced-motion: reduce) {
  .hero__scroll-dot {
    animation: none;
  }
}
</style>
