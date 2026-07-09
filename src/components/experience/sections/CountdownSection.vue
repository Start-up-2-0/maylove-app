<template>
  <section v-if="targetDate" class="exp-section countdown-section">
    <div class="exp-container countdown" v-reveal>
      <p v-if="title" class="exp-eyebrow countdown__eyebrow">{{ title }}</p>
      <div class="countdown__grid">
        <div v-for="unit in units" :key="unit.label" class="countdown__unit">
          <span class="countdown__value">{{ unit.value }}</span>
          <span class="countdown__label">{{ unit.label }}</span>
        </div>
      </div>
      <p v-if="caption" class="countdown__caption">{{ caption }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'

const props = defineProps<SectionComponentProps>()

const now = ref(Date.now())
let timer: number | undefined

const mode = computed(() => (props.section.config?.mode as string) || 'countup')
const title = computed(
  () => (props.section.config?.title as string) || (mode.value === 'countup' ? 'Juntos há' : 'Contagem regressiva'),
)
const caption = computed(() => (props.section.config?.caption as string) || '')

const targetDate = computed(() => {
  if (!props.content.specialDate) return null
  const parsed = new Date(props.content.specialDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
})

const units = computed(() => {
  if (!targetDate.value) return []
  const diffMs =
    mode.value === 'countup'
      ? now.value - targetDate.value.getTime()
      : targetDate.value.getTime() - now.value
  const total = Math.max(0, Math.floor(diffMs / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [
    { label: 'dias', value: String(days) },
    { label: 'horas', value: String(hours).padStart(2, '0') },
    { label: 'min', value: String(minutes).padStart(2, '0') },
    { label: 'seg', value: String(seconds).padStart(2, '0') },
  ]
})

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})
onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.countdown-section {
  text-align: center;
}
.countdown__eyebrow {
  display: block;
  margin-bottom: 26px;
}
.countdown__grid {
  display: flex;
  justify-content: center;
  gap: clamp(10px, 2.5vw, 22px);
  flex-wrap: wrap;
}
.countdown__unit {
  min-width: 84px;
  padding: 20px 12px;
  border-radius: 18px;
  background: var(--exp-surface);
  border: 1px solid var(--exp-border);
  box-shadow: 0 20px 44px -30px rgba(0, 0, 0, 0.4);
}
.countdown__value {
  display: block;
  font-family: var(--exp-font-display);
  font-size: clamp(2rem, 6vw, 3.2rem);
  font-weight: 600;
  color: var(--exp-primary);
  line-height: 1;
}
.countdown__label {
  display: block;
  margin-top: 8px;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--exp-muted);
}
.countdown__caption {
  margin-top: 24px;
  color: var(--exp-muted);
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.05rem;
}
</style>
