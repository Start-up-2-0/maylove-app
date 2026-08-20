<template>
  <div
    v-if="units.length"
    class="rom-countdown"
    :class="rootClass"
    role="timer"
    :aria-label="accessibleLabel"
  >
    <div v-for="unit in units" :key="unit.label" class="rom-countdown__cell">
      <span class="rom-countdown__value">{{ unit.value }}</span>
      <span class="rom-countdown__label">{{ unit.label }}</span>
    </div>
    <div class="rom-countdown__cell rom-countdown__cell--clock">
      <span class="rom-countdown__value">{{ clockValue }}</span>
      <span class="rom-countdown__label">Horas · Min · Seg</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ExperienceContent } from '@/templates/types'
import { resolveSpecialDateCounterState } from '@/utils/specialDate'

const props = withDefaults(
  defineProps<{
    content: ExperienceContent
    rootClass?: string
  }>(),
  { rootClass: '' },
)

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const targetDate = computed(() => {
  if (!props.content.specialDate) return null
  const parsed = new Date(props.content.specialDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
})

const counterParts = computed(() => {
  if (!targetDate.value) return null
  const mode = props.content.specialDateConfig?.counterMode ?? 'since'
  const diffMs = resolveSpecialDateCounterState(
    targetDate.value.getTime(),
    mode,
    now.value,
  ).diffMs

  const totalSeconds = Math.floor(diffMs / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)
  const days = totalDays % 30
  const months = Math.floor(totalDays / 30) % 12
  const years = Math.floor(totalDays / 365)

  return { years, months, days, hours, minutes, seconds }
})

const units = computed(() => {
  if (!counterParts.value) return []
  return [
    { value: counterParts.value.years, label: 'Anos' },
    { value: counterParts.value.months, label: 'Meses' },
    { value: counterParts.value.days, label: 'Dias' },
  ]
})

const clockValue = computed(() => {
  if (!counterParts.value) return '00:00:00'
  return [counterParts.value.hours, counterParts.value.minutes, counterParts.value.seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
})

const accessibleLabel = computed(() => {
  const [years, months, days] = units.value
  return `${years?.value ?? 0} anos, ${months?.value ?? 0} meses, ${days?.value ?? 0} dias e ${clockValue.value}`
})
</script>

<style scoped>
.rom-countdown {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(110px, 1.35fr);
  gap: 8px;
  width: min(100%, 660px);
  margin-inline: auto;
}
.rom-countdown__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 6px;
  border-radius: 10px;
  background: rgb(255 255 255 / 4%);
  border: 1px solid rgb(255 255 255 / 7%);
}
.rom-countdown__value {
  font-size: clamp(1rem, 4cqi, 1.2rem);
  font-weight: 800;
  line-height: 1;
  color: var(--rom-countdown-accent, #1db954);
}
.rom-countdown__cell--clock .rom-countdown__value {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
.rom-countdown__label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 55%);
}
@container (max-width: 420px) {
  .rom-countdown { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .rom-countdown__cell--clock { grid-column:1 / -1; flex-direction:row; gap:8px; }
}
</style>
