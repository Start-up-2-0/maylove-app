<template>
  <div class="pslider">
    <div class="pslider__stage">
      <button
        v-if="photos.length > 1"
        class="pslider__nav pslider__nav--prev"
        aria-label="Anterior"
        @click="prev"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="pslider__frame">
        <transition :name="transitionName" mode="out-in">
          <img
            :key="active"
            :src="photos[active].url"
            class="pslider__img"
            :alt="`Recordação ${active + 1} de ${photos.length}`"
            loading="lazy"
          />
        </transition>
      </div>

      <button
        v-if="photos.length > 1"
        class="pslider__nav pslider__nav--next"
        aria-label="Próxima"
        @click="next"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div v-if="photos.length > 1" class="pslider__dots">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="pslider__dot"
        :class="{ 'pslider__dot--active': index === active }"
        :aria-label="`Foto ${index + 1}`"
        @click="go(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ExperienceMediaItem } from '@/templates/types'

const props = withDefaults(
  defineProps<{
    photos: ExperienceMediaItem[]
    autoplay?: boolean
  }>(),
  { autoplay: true },
)

const active = ref(0)
const forward = ref(true)
const transitionName = computed(() => (forward.value ? 'pslide-next' : 'pslide-prev'))

let timer: number | undefined

function go(index: number) {
  forward.value = index > active.value
  active.value = (index + props.photos.length) % props.photos.length
}
function next() {
  forward.value = true
  active.value = (active.value + 1) % props.photos.length
}
function prev() {
  forward.value = false
  active.value = (active.value - 1 + props.photos.length) % props.photos.length
}

onMounted(() => {
  if (props.autoplay && props.photos.length > 1) {
    timer = window.setInterval(next, 4500)
  }
})
onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.pslider__stage {
  display: flex;
  align-items: center;
  gap: 14px;
}
.pslider__frame {
  flex: 1;
  aspect-ratio: 3 / 2;
  border-radius: 20px;
  overflow: hidden;
  background: var(--exp-surface);
  box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.45);
}
.pslider__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pslider__nav {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  color: var(--exp-ink);
  background: var(--exp-surface);
  border: 1px solid var(--exp-border);
  transition: transform 0.18s ease, color 0.18s ease;
}
.pslider__nav:hover {
  color: var(--exp-primary);
  transform: scale(1.06);
}
.pslider__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}
.pslider__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--exp-primary) 30%, transparent);
  transition: width 0.2s ease, background 0.2s ease;
}
.pslider__dot--active {
  width: 22px;
  background: var(--exp-primary);
}

.pslide-next-enter-active,
.pslide-next-leave-active,
.pslide-prev-enter-active,
.pslide-prev-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.pslide-next-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.pslide-next-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.pslide-prev-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}
.pslide-prev-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

@media (max-width: 520px) {
  .pslider__nav {
    width: 38px;
    height: 38px;
  }
}
</style>
