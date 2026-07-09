<template>
  <section class="exp-section typewriter-section">
    <div ref="root" class="exp-container typewriter">
      <p v-if="eyebrow" v-reveal class="exp-eyebrow typewriter__eyebrow">{{ eyebrow }}</p>
      <RichText v-if="isHtml" v-reveal :text="fullText" class="typewriter__text typewriter__text--done" />
      <p v-else class="typewriter__text" :class="{ 'typewriter__text--done': done }">
        <span>{{ shown }}</span
        ><span v-if="!done && started" class="typewriter__caret" />
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'
import { containsHtml } from '@/utils/richText'
import RichText from '../shared/RichText.vue'

const props = defineProps<SectionComponentProps>()

const root = ref<HTMLElement | null>(null)
const shown = ref('')
const started = ref(false)
const done = ref(false)

const eyebrow = computed(() => (props.section.config?.eyebrow as string) || '')
const fullText = computed(
  () => (props.section.config?.text as string) || props.content.message || '',
)
const isHtml = computed(() => containsHtml(fullText.value))
const speedMs = computed(() => Math.round(42 * props.theme.speedMultiplier))

let observer: IntersectionObserver | null = null
let timer: number | undefined

function typeOut() {
  if (started.value || isHtml.value) return
  started.value = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = fullText.value
    done.value = true
    return
  }
  let i = 0
  timer = window.setInterval(() => {
    i += 1
    shown.value = fullText.value.slice(0, i)
    if (i >= fullText.value.length) {
      window.clearInterval(timer)
      done.value = true
    }
  }, speedMs.value)
}

onMounted(() => {
  if (!root.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        typeOut()
        observer?.disconnect()
      }
    },
    { threshold: 0.4 },
  )
  observer.observe(root.value)
})
onUnmounted(() => {
  observer?.disconnect()
  window.clearInterval(timer)
})
</script>

<style scoped>
.typewriter-section {
  text-align: center;
}
.typewriter__eyebrow {
  display: block;
  margin-bottom: 22px;
}
.typewriter__text {
  font-family: var(--exp-font-display);
  font-size: clamp(1.4rem, 4vw, 2.4rem);
  line-height: 1.45;
  color: var(--exp-ink);
  white-space: pre-wrap;
  min-height: 1.5em;
}
.typewriter__caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 3px;
  vertical-align: text-bottom;
  background: var(--exp-primary);
  animation: caret-blink 0.9s step-end infinite;
}
@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}
</style>
