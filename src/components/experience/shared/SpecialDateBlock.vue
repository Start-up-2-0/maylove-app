<template>
  <section
    v-if="targetDate"
    class="special-date-block"
    :class="blockClasses"
  >
    <div class="special-date-block__shell" v-reveal>
      <div class="special-date-block__panel">
        <p v-if="eyebrow" class="exp-eyebrow special-date-block__eyebrow">{{ eyebrow }}</p>
        <h2 v-if="title" class="special-date-block__title">{{ title }}</h2>
        <p v-if="description" class="special-date-block__description">{{ description }}</p>

        <p v-if="showDateOnly" class="special-date-block__date-only">{{ formattedDate }}</p>

        <div v-else-if="showCounter" class="special-date-block__grid" role="timer" aria-live="polite">
          <div v-for="unit in units" :key="unit.label" class="special-date-block__unit">
            <span class="special-date-block__value">{{ unit.value }}</span>
            <span class="special-date-block__label">{{ unit.label }}</span>
          </div>
        </div>

        <p v-if="counterCaption" class="special-date-block__caption">{{ counterCaption }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ExperienceContent, ResolvedTheme } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'
import {
  defaultSpecialDateTitle,
  formatSpecialDateLabel,
  type ResolvedSpecialDateConfig,
} from '@/utils/specialDate'

const props = withDefaults(
  defineProps<{
    content: ExperienceContent
    theme: ResolvedTheme
    placement?: 'default' | 'after-cover'
  }>(),
  { placement: 'default' },
)

const now = ref(Date.now())
let timer: number | undefined

const config = computed(() => props.content.specialDateConfig)

const targetDate = computed(() => {
  if (!props.content.specialDate) return null
  const parsed = new Date(props.content.specialDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
})

const displayFormat = computed(() => config.value?.displayFormat ?? 'card')
const counterMode = computed(() => config.value?.counterMode ?? 'since')
const showCounter = computed(() => counterMode.value !== 'none')
const showDateOnly = computed(() => counterMode.value === 'none')

const blockClasses = computed(() => [
  `special-date-block--${displayFormat.value}`,
  `special-date-block--mode-${counterMode.value}`,
  {
    'special-date-block--dark': props.theme.mode === 'dark',
    'special-date-block--after-cover': props.placement === 'after-cover',
  },
])

const title = computed(() => {
  const cfg = config.value
  if (!cfg) return ''
  return defaultSpecialDateTitle(cfg)
})

const description = computed(() => config.value?.description ?? '')
const formattedDate = computed(() => formatSpecialDateLabel(config.value as ResolvedSpecialDateConfig))

const eyebrow = computed(() => {
  if (displayFormat.value === 'inline') return ''
  return counterMode.value === 'countdown' ? 'Contagem regressiva' : 'Desde o evento'
})

const counterCaption = computed(() => {
  if (counterMode.value === 'none') return ''
  if (counterMode.value === 'countdown') return formattedDate.value ? `Até ${formattedDate.value}` : ''
  return formattedDate.value ? `Desde ${formattedDate.value}` : ''
})

const units = computed(() => {
  if (!targetDate.value || !showCounter.value) return []
  const diffMs =
    counterMode.value === 'since'
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
  if (!showCounter.value) return
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})

onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.special-date-block {
  position: relative;
  z-index: 4;
  padding: clamp(36px, 6vw, 72px) 0;
  background: var(--exp-bg);
}

/* Transição suave logo após a capa fullscreen */
.special-date-block--after-cover {
  margin-top: clamp(-36px, -4vw, -18px);
  padding-top: clamp(28px, 4vw, 48px);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--exp-primary) 10%, transparent) 0%, transparent 42%),
    var(--exp-bg);
}

.special-date-block__shell {
  width: min(920px, calc(100% - 40px));
  margin-inline: auto;
}

.special-date-block__panel {
  padding: clamp(24px, 4vw, 40px);
  border-radius: 24px;
  border: 1px solid var(--exp-border);
  background: var(--exp-surface);
  box-shadow: 0 24px 60px -36px rgba(20, 10, 16, 0.35);
  text-align: center;
}

/* --- Formato: cartão (padrão) --- */
.special-date-block--card .special-date-block__panel {
  border-color: color-mix(in srgb, var(--exp-primary) 18%, var(--exp-border));
}

/* --- Formato: destaque --- */
.special-date-block--hero .special-date-block__shell {
  width: min(1040px, calc(100% - 32px));
}

.special-date-block--hero .special-date-block__panel {
  padding: clamp(36px, 6vw, 56px);
  border-radius: 28px;
  background:
    radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--exp-primary) 14%, transparent), transparent),
    var(--exp-surface);
  box-shadow:
    0 30px 80px -40px color-mix(in srgb, var(--exp-primary) 35%, transparent),
    0 24px 60px -36px rgba(20, 10, 16, 0.35);
}

.special-date-block--hero.special-date-block--after-cover {
  margin-top: clamp(-52px, -6vw, -28px);
}

.special-date-block--hero .special-date-block__title {
  font-size: clamp(2rem, 6vw, 3.6rem);
}

/* --- Formato: compacto --- */
.special-date-block--compact {
  padding: clamp(24px, 4vw, 40px) 0;
}

.special-date-block--compact .special-date-block__panel {
  padding: 18px 20px;
  border-radius: 18px;
}

.special-date-block--compact .special-date-block__grid {
  margin-top: 16px;
  gap: 10px;
}

.special-date-block--compact .special-date-block__unit {
  min-width: 68px;
  padding: 12px 8px;
  border-radius: 12px;
}

.special-date-block--compact .special-date-block__value {
  font-size: clamp(1.5rem, 4.5vw, 2.1rem);
}

/* --- Formato: inline --- */
.special-date-block--inline {
  padding: 20px 0;
}

.special-date-block--inline .special-date-block__panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  padding: 16px 20px;
  border-radius: 16px;
  text-align: left;
}

.special-date-block--inline .special-date-block__eyebrow {
  margin: 0;
  flex: 0 0 auto;
}

.special-date-block--inline .special-date-block__title {
  margin: 0;
  font-size: 1.15rem;
  flex: 1 1 180px;
}

.special-date-block--inline .special-date-block__description,
.special-date-block--inline .special-date-block__caption {
  flex: 1 1 100%;
  margin: 0;
}

.special-date-block--inline .special-date-block__grid {
  margin: 0;
  margin-left: auto;
  gap: 8px;
}

.special-date-block--inline .special-date-block__unit {
  min-width: 58px;
  padding: 8px 6px;
  border-radius: 10px;
}

.special-date-block--inline .special-date-block__value {
  font-size: 1.25rem;
}

.special-date-block--inline .special-date-block__label {
  font-size: 0.62rem;
  margin-top: 4px;
}

.special-date-block__eyebrow {
  display: block;
  margin-bottom: 12px;
}

.special-date-block__title {
  font-family: var(--exp-font-display);
  font-size: clamp(1.7rem, 4.8vw, 2.8rem);
  font-weight: 600;
  color: var(--exp-ink);
  line-height: 1.12;
}

.special-date-block__description {
  margin-top: 12px;
  color: var(--exp-muted);
  font-size: 1rem;
  line-height: 1.55;
  max-width: 56ch;
  margin-inline: auto;
}

.special-date-block--inline .special-date-block__description {
  margin-inline: 0;
  max-width: none;
}

.special-date-block__grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: clamp(10px, 2.2vw, 18px);
  margin-top: 24px;
}

.special-date-block__unit {
  min-width: 82px;
  padding: 18px 12px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--exp-primary) 6%, var(--exp-bg));
  border: 1px solid color-mix(in srgb, var(--exp-primary) 16%, var(--exp-border));
}

.special-date-block__value {
  display: block;
  font-family: var(--exp-font-display);
  font-size: clamp(1.9rem, 5.5vw, 3rem);
  font-weight: 600;
  color: var(--exp-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.special-date-block__label {
  display: block;
  margin-top: 8px;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--exp-muted);
}

.special-date-block__caption,
.special-date-block__date-only {
  margin-top: 18px;
  color: var(--exp-muted);
  font-size: 0.98rem;
}

.special-date-block__caption {
  font-family: var(--exp-font-display);
  font-style: italic;
}

.special-date-block__date-only {
  font-weight: 600;
  color: var(--exp-primary);
  font-size: 1.1rem;
}

@media (max-width: 640px) {
  .special-date-block--inline .special-date-block__panel {
    flex-direction: column;
    align-items: flex-start;
  }

  .special-date-block--inline .special-date-block__grid {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
