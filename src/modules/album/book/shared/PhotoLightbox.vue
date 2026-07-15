<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="lb"
      role="dialog"
      aria-modal="true"
      :aria-label="current?.title || 'Visualizar foto'"
      @keydown.esc.prevent="close"
      @keydown.left.prevent="prev"
      @keydown.right.prevent="next"
    >
      <button type="button" class="lb__backdrop" aria-label="Fechar" @click="close" />

      <div class="lb__stage" tabindex="0" ref="stageRef">
        <button
          v-if="photos.length > 1"
          type="button"
          class="lb__nav lb__nav--prev"
          aria-label="Anterior"
          @click="prev"
        >
          ‹
        </button>

        <figure class="lb__figure">
          <img
            v-if="current"
            :src="current.url"
            :alt="current.title || 'Foto'"
            class="lb__img"
            draggable="false"
          />
          <figcaption v-if="hasMeta" class="lb__meta">
            <p v-if="current?.title" class="lb__title">{{ current.title }}</p>
            <p v-if="current?.caption" class="lb__caption">{{ current.caption }}</p>
            <p v-if="metaLine" class="lb__line">{{ metaLine }}</p>
          </figcaption>
        </figure>

        <button
          v-if="photos.length > 1"
          type="button"
          class="lb__nav lb__nav--next"
          aria-label="Próxima"
          @click="next"
        >
          ›
        </button>

        <button type="button" class="lb__close" aria-label="Fechar" @click="close">×</button>
        <p class="lb__counter">{{ index + 1 }} / {{ photos.length }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

export interface LightboxPhoto {
  id: string
  url: string
  title?: string | null
  caption?: string | null
  memoryDate?: string | null
  placeName?: string | null
}

const props = defineProps<{
  photos: LightboxPhoto[]
  index: number
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:index': [value: number]
}>()

const stageRef = ref<HTMLElement | null>(null)

const current = computed(() => props.photos[props.index] ?? null)

const hasMeta = computed(
  () =>
    Boolean(
      current.value?.title?.trim() ||
        current.value?.caption?.trim() ||
        current.value?.memoryDate?.trim() ||
        current.value?.placeName?.trim(),
    ),
)

const metaLine = computed(() =>
  [current.value?.memoryDate, current.value?.placeName].filter(Boolean).join(' · '),
)

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    stageRef.value?.focus()
  },
)

function close() {
  emit('close')
}

function prev() {
  if (props.photos.length < 2) return
  const nextIndex = (props.index - 1 + props.photos.length) % props.photos.length
  emit('update:index', nextIndex)
}

function next() {
  if (props.photos.length < 2) return
  const nextIndex = (props.index + 1) % props.photos.length
  emit('update:index', nextIndex)
}
</script>

<style scoped>
.lb {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
}

.lb__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(12, 10, 9, 0.86);
  backdrop-filter: blur(10px);
  cursor: zoom-out;
}

.lb__stage {
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  max-height: min(92vh, 960px);
  outline: none;
}

.lb__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.lb__img {
  display: block;
  max-width: 100%;
  max-height: min(78vh, 820px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 30px 80px -36px rgba(0, 0, 0, 0.7);
  background: rgba(255, 255, 255, 0.03);
}

.lb__meta {
  max-width: 40rem;
  text-align: center;
  color: #f6f1ea;
  padding: 0 12px 8px;
}

.lb__title {
  margin: 0 0 6px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(1.25rem, 3vw, 1.7rem);
  font-weight: 500;
}

.lb__caption {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(246, 241, 234, 0.82);
}

.lb__line {
  margin: 10px 0 0;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(246, 241, 234, 0.55);
}

.lb__nav,
.lb__close {
  position: absolute;
  border: 0;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 160ms ease;
}

.lb__nav:hover,
.lb__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lb__nav {
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  font-size: 1.8rem;
  line-height: 1;
}

.lb__nav--prev {
  left: 0;
}

.lb__nav--next {
  right: 0;
}

.lb__close {
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  font-size: 1.5rem;
}

.lb__counter {
  position: absolute;
  top: 10px;
  left: 10px;
  margin: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
}

@media (max-width: 720px) {
  .lb__nav {
    top: auto;
    bottom: 8px;
    transform: none;
  }

  .lb__nav--prev {
    left: calc(50% - 56px);
  }

  .lb__nav--next {
    right: calc(50% - 56px);
    left: auto;
  }

  .lb__img {
    max-height: min(68vh, 640px);
  }
}
</style>
