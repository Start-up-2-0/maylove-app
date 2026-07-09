<template>
  <RichText v-if="isHtml" :text="text" :tag="tag" />
  <component :is="tag" v-else ref="root" class="typed">
    <span>{{ display }}</span><span v-if="active && started && !done" class="typed__caret" />
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { containsHtml } from '@/utils/richText'
import RichText from './RichText.vue'

const props = withDefaults(
  defineProps<{
    text: string
    active?: boolean
    speedMultiplier?: number
    tag?: string
  }>(),
  { active: false, speedMultiplier: 1, tag: 'p' },
)

const root = ref<HTMLElement | null>(null)
const shown = ref('')
const started = ref(false)
const done = ref(false)

// Conteúdo formatado (HTML) não é digitado — é exibido de uma vez.
const isHtml = computed(() => containsHtml(props.text))
const display = computed(() => (props.active ? shown.value : props.text))
const speedMs = computed(() => Math.round(42 * props.speedMultiplier))

let observer: IntersectionObserver | null = null
let timer: number | undefined

function reset() {
  window.clearInterval(timer)
  shown.value = ''
  started.value = false
  done.value = false
}

function typeOut() {
  if (started.value) return
  started.value = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = props.text
    done.value = true
    return
  }
  let i = 0
  timer = window.setInterval(() => {
    i += 1
    shown.value = props.text.slice(0, i)
    if (i >= props.text.length) {
      window.clearInterval(timer)
      done.value = true
    }
  }, speedMs.value)
}

function observe() {
  if (!props.active || !root.value) return
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
}

watch(
  () => [props.text, props.active],
  () => {
    observer?.disconnect()
    reset()
    if (props.active) observe()
  },
)

onMounted(observe)
onUnmounted(() => {
  observer?.disconnect()
  window.clearInterval(timer)
})
</script>

<style scoped>
.typed__caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 3px;
  vertical-align: text-bottom;
  background: var(--exp-primary);
  animation: typed-caret 0.9s step-end infinite;
}
@keyframes typed-caret {
  50% {
    opacity: 0;
  }
}
</style>
