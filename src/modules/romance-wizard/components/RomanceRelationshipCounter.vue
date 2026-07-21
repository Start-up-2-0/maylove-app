<template>
  <p v-if="show" class="rom-rel-counter">{{ label }}</p>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { TributeSpecialDateConfig } from '@/api/types'

const props = withDefaults(
  defineProps<{
    config?: TributeSpecialDateConfig | null
    placeholder?: string
  }>(),
  {
    config: null,
    placeholder: '❤️ Defina a data do relacionamento',
  },
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

const show = computed(() => Boolean(props.config?.date?.trim()) || Boolean(props.placeholder))

const label = computed(() => {
  const cfg = props.config
  if (!cfg?.date?.trim()) return props.placeholder

  const target = parseDate(cfg.date, cfg.time)
  if (!target) return '❤️ Data especial'

  const diffMs =
    cfg.counter_mode === 'countdown'
      ? Math.max(0, target.getTime() - now.value)
      : Math.max(0, now.value - target.getTime())

  const parts = diffToParts(diffMs)
  return `❤️ ${parts.years} anos • ${parts.months} mês${parts.months === 1 ? '' : 'es'} • ${parts.days} dia${parts.days === 1 ? '' : 's'} • ${parts.hours}h • ${parts.minutes}m • ${parts.seconds}s de puro amor`
})

function parseDate(date: string, time?: string | null): Date | null {
  const iso = time?.trim() ? `${date}T${time}` : `${date}T00:00:00`
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function diffToParts(diffMs: number) {
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
}
</script>

<style scoped>
.rom-rel-counter {
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 10%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 22%, var(--border));
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--rom-muted, #9f1239);
  text-align: center;
}
</style>
