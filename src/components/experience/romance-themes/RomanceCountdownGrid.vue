<template>
  <div v-if="units.length" class="rom-countdown" :class="rootClass">
    <div v-for="unit in units" :key="unit.label" class="rom-countdown__cell">
      <span class="rom-countdown__value">{{ unit.value }}</span>
      <span class="rom-countdown__label">{{ unit.label }}</span>
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

const units = computed(() => {
  if (!targetDate.value) return []
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

  return [
    { value: years, label: 'Anos' },
    { value: months, label: 'Meses' },
    { value: days, label: 'Dias' },
    { value: hours, label: 'Horas' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Seg' },
  ]
})
</script>

<style scoped>
.rom-countdown {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.rom-countdown__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 10px 6px;
  border-radius: 12px;
  background: rgb(255 255 255 / 6%);
  border: 1px solid rgb(255 255 255 / 8%);
}
.rom-countdown__value {
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1;
  color: var(--rom-countdown-accent, #1db954);
}
.rom-countdown__label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 55%);
}
</style>
