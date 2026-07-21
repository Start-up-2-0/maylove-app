<template>
  <section v-if="targetDate" class="exp-section countdown-section" :class="`countdown-section--${displayFormat}`">
    <div class="exp-container countdown" v-reveal>
      <p v-if="eyebrow" class="exp-eyebrow countdown__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="blockTitle" class="countdown__heading">{{ blockTitle }}</h2>
      <p v-if="description" class="countdown__description">{{ description }}</p>

      <p v-if="showDateOnly" class="countdown__date-only">{{ formattedDate }}</p>

      <div v-else class="countdown__grid">
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
import { defaultSpecialDateTitle, formatSpecialDateLabel } from '@/utils/specialDate'

const props = defineProps<SectionComponentProps>()

const now = ref(Date.now())
let timer: number | undefined

const wizardConfig = computed(() => props.content.specialDateConfig)

const mode = computed(() => {
  if (wizardConfig.value?.enabled) {
    return wizardConfig.value.counterMode === 'countdown' ? 'countdown' : 'countup'
  }
  return (props.section.config?.mode as string) || 'countup'
})

const displayFormat = computed(
  () => wizardConfig.value?.displayFormat ?? (props.section.config?.format as string) ?? 'card',
)

const showDateOnly = computed(
  () => wizardConfig.value?.counterMode === 'none' || props.section.config?.mode === 'date-only',
)

const blockTitle = computed(() => {
  if (wizardConfig.value?.enabled) return defaultSpecialDateTitle(wizardConfig.value)
  return (props.section.config?.title as string) || ''
})

const eyebrow = computed(() => {
  if (wizardConfig.value?.enabled) {
    return mode.value === 'countup' ? 'Desde o evento' : 'Contagem regressiva'
  }
  return (
    (props.section.config?.eyebrow as string) ||
    (mode.value === 'countup' ? 'Juntos há' : 'Contagem regressiva')
  )
})

const description = computed(
  () => wizardConfig.value?.description || (props.section.config?.description as string) || '',
)

const formattedDate = computed(() =>
  wizardConfig.value ? formatSpecialDateLabel(wizardConfig.value) : '',
)

const caption = computed(() => {
  if (wizardConfig.value?.enabled && wizardConfig.value.counterMode !== 'none') {
    return wizardConfig.value.counterMode === 'countdown'
      ? formattedDate.value
        ? `Até ${formattedDate.value}`
        : ''
      : formattedDate.value
        ? `Desde ${formattedDate.value}`
        : ''
  }
  return (props.section.config?.caption as string) || ''
})

const targetDate = computed(() => {
  if (!props.content.specialDate) return null
  const parsed = new Date(props.content.specialDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
})

const units = computed(() => {
  if (!targetDate.value || showDateOnly.value) return []
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
  if (showDateOnly.value) return
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})

onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.countdown-section {
  text-align: center;
}
.countdown-section--inline {
  text-align: left;
}
.countdown__eyebrow {
  display: block;
  margin-bottom: 18px;
}
.countdown__heading {
  font-family: var(--exp-font-display);
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 600;
  color: var(--exp-ink);
  margin-bottom: 10px;
}
.countdown__description {
  max-width: 560px;
  margin: 0 auto 20px;
  color: var(--exp-muted);
  line-height: 1.5;
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
.countdown__caption,
.countdown__date-only {
  margin-top: 24px;
  color: var(--exp-muted);
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: 1.05rem;
}
.countdown__date-only {
  font-style: normal;
  font-weight: 600;
  color: var(--exp-primary);
}
</style>
