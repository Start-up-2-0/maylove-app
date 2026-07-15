<template>
  <figure
    class="pf"
    :class="[`pf--${frameStyle}`, { 'pf--compact': compact }]"
  >
    <div class="pf__photo">
      <img :src="url" :alt="title || 'Memória'" loading="lazy" draggable="false" />
    </div>
    <figcaption v-if="showCaption" class="pf__cap">
      <p v-if="title" class="pf__title">{{ title }}</p>
      <RichText v-if="caption" :text="caption" class="pf__desc" />
      <p v-else-if="dateLabel && !title" class="pf__date">{{ dateLabel }}</p>
      <p v-if="dateLabel && title" class="pf__date">{{ dateLabel }}</p>
    </figcaption>
    <slot />
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/experience/shared/RichText.vue'
import { normalizeFrameStyle, type BookFrameStyle } from '../frameStyles'

const props = withDefaults(
  defineProps<{
    url: string
    title?: string | null
    caption?: string | null
    memoryDate?: string | null
    frameStyle?: BookFrameStyle | string | null
    /** Mantido por compatibilidade; molduras ficam sempre retas. */
    rotation?: number | string | null
    compact?: boolean
  }>(),
  {
    title: null,
    caption: null,
    memoryDate: null,
    frameStyle: 'classic',
    rotation: null,
    compact: false,
  },
)

const frameStyle = computed(() => normalizeFrameStyle(props.frameStyle))

const dateLabel = computed(() => props.memoryDate?.trim() || '')

const showCaption = computed(
  () => Boolean(props.title?.trim() || props.caption?.trim() || dateLabel.value),
)
</script>

<style scoped>
.pf {
  --pf-frame: #f7f4ef;
  --pf-ink: #1c2430;
  --pf-muted: color-mix(in srgb, var(--pf-ink) 55%, transparent);
  --pf-shadow: 0 14px 28px -16px rgba(28, 36, 48, 0.45);
  --pf-pad: 10px 10px 0;
  --pf-cap-pad: 12px 10px 16px;
  --pf-radius: 2px;

  margin: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--pf-frame);
  color: var(--pf-ink);
  padding: var(--pf-pad);
  border-radius: var(--pf-radius);
  box-shadow: var(--pf-shadow);
  transition: box-shadow 180ms ease;
}

.pf--compact {
  --pf-pad: 8px 8px 0;
  --pf-cap-pad: 8px 8px 12px;
}

.pf--classic {
  --pf-frame: #fbfaf7;
  --pf-ink: #222831;
  --pf-shadow: 0 16px 32px -18px rgba(40, 28, 20, 0.42);
}

.pf--cream {
  --pf-frame: #f3e8d4;
  --pf-ink: #3b2f24;
  --pf-shadow: 0 14px 28px -16px rgba(90, 60, 30, 0.35);
}

.pf--charcoal {
  --pf-frame: #2a2e35;
  --pf-ink: #f2eee6;
  --pf-shadow: 0 16px 34px -14px rgba(0, 0, 0, 0.55);
}

.pf--kraft {
  --pf-frame: #d2b48c;
  --pf-ink: #3a2a1a;
  --pf-shadow: 0 14px 28px -14px rgba(70, 45, 20, 0.4);
  background-image:
    radial-gradient(rgba(90, 60, 30, 0.08) 0.6px, transparent 0.7px),
    linear-gradient(180deg, color-mix(in srgb, #e8d5b5 70%, transparent), transparent 45%);
  background-size: 5px 5px, auto;
}

.pf--blush {
  --pf-frame: #f7e4ea;
  --pf-ink: #5a2d3d;
  --pf-shadow: 0 14px 28px -16px rgba(180, 70, 110, 0.35);
}

.pf--ink {
  --pf-frame: #f8fafc;
  --pf-ink: #123047;
  --pf-shadow: 0 12px 26px -14px rgba(18, 48, 71, 0.4);
  outline: 2px solid color-mix(in srgb, #1d4f73 55%, transparent);
  outline-offset: -6px;
}

.pf__photo {
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--pf-ink) 6%, transparent);
  /* Sem aspect-ratio fixo: a moldura acompanha a proporção da foto. */
  line-height: 0;
}

.pf__photo img {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  object-position: center;
}

.pf__cap {
  padding: var(--pf-cap-pad);
  min-height: 3.2rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pf__title {
  margin: 0;
  font-family: var(--book-font-display, Georgia, 'Times New Roman', serif);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.pf__desc {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--pf-muted);
}

.pf__desc :deep(p) {
  margin: 0;
}

.pf__date {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--pf-muted);
}

@media (prefers-reduced-motion: reduce) {
  .pf {
    transition: none;
  }
}
</style>
