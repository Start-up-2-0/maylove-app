<template>
  <div
    class="bouquet-display"
    :style="{ width: `${stageSize}px`, height: `${stageSize}px` }"
    aria-label="Buquê digital"
  >
    <div
      class="bouquet-display__glow"
      :style="{ background: `radial-gradient(circle at 50% 50%, ${wrapGlow}, transparent 65%)` }"
      aria-hidden="true"
    />

    <img
      :src="BOUQUET_GREENERY_IMAGE"
      alt=""
      class="bouquet-display__greenery"
      draggable="false"
      aria-hidden="true"
    />

    <img
      v-for="(stem, index) in layeredStems"
      :key="`${stem.id}-${index}`"
      :src="stem.image"
      :alt="stem.label"
      class="bouquet-display__flower"
      :style="stem.style"
      draggable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { BouquetWrapColor } from '@/api/types'
import {
  BOUQUET_GREENERY_IMAGE,
  getFlower,
  getWrapGlow,
} from '@/modules/bouquet/bouquetCatalog'
import {
  getStemLayouts,
  resolvePreviewSize,
  stemPixelSize,
  stemRotation,
  type BouquetPreviewSize,
} from '@/modules/bouquet/bouquetLayout'

const props = withDefaults(
  defineProps<{
    stems: string[]
    wrapColor?: BouquetWrapColor
    size?: BouquetPreviewSize
  }>(),
  {
    wrapColor: 'blush',
    size: 'lg',
  },
)

const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

function updateViewport() {
  viewportWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', updateViewport))
onUnmounted(() => window.removeEventListener('resize', updateViewport))

const resolvedSize = computed(() => resolvePreviewSize(props.size, viewportWidth.value))
const stageSize = computed(() => {
  const sizes = { sm: 240, md: 360, lg: 460 }
  return sizes[resolvedSize.value]
})

const wrapGlow = computed(() => getWrapGlow(props.wrapColor))

const layeredStems = computed(() => {
  const layouts = getStemLayouts(props.stems.length)
  return props.stems.map((id, index) => {
    const flower = getFlower(id)
    const layout = layouts[index]
    if (!flower || !layout) return null

    const px = stemPixelSize(stageSize.value, layout.scale)
    const rotate = stemRotation(index)

    return {
      id,
      label: flower.label,
      image: flower.image,
      style: {
        width: `${px}px`,
        height: `${px}px`,
        left: `calc(${layout.x * 100}% - ${px / 2}px)`,
        top: `calc(${layout.y * 100}% - ${px / 2}px)`,
        transform: `rotate(${rotate}deg)`,
        zIndex: String(20 + index),
      },
    }
  }).filter(Boolean) as Array<{
    id: string
    label: string
    image: string
    style: Record<string, string>
  }>
})
</script>

<style scoped>
.bouquet-display {
  position: relative;
  margin: 0 auto;
}

.bouquet-display__glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0.4;
  pointer-events: none;
}

.bouquet-display__greenery {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 18px hsl(120 30% 20% / 0.18));
}

.bouquet-display__flower {
  position: absolute;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px hsl(15 30% 25% / 0.22));
}
</style>
