<template>
  <div class="effects-step">
    <WizardStepHeader
      title="Efeitos visuais"
      description="Selecione animações que aparecerão na página pública."
    />

    <div class="effects-grid">
      <button
        v-for="effect in TRIBUTE_EFFECTS"
        :key="effect"
        type="button"
        class="effect-card"
        :class="{ 'effect-card--active': isActive(effect) }"
        :aria-pressed="isActive(effect)"
        @click="toggle(effect)"
      >
        <span class="effect-card__emoji">{{ effectMeta[effect].emoji }}</span>
        <span class="effect-card__label">{{ effectMeta[effect].label }}</span>
        <span class="effect-card__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TRIBUTE_EFFECTS, type TributeEffect } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()

const effectMeta: Record<TributeEffect, { label: string; emoji: string }> = {
  confetti: { label: 'Confete', emoji: '🎉' },
  hearts: { label: 'Corações', emoji: '💕' },
  petals: { label: 'Pétalas', emoji: '🌸' },
  fireworks: { label: 'Fogos', emoji: '🎆' },
  stars: { label: 'Estrelas', emoji: '✨' },
  snow: { label: 'Neve', emoji: '❄️' },
}

function isActive(effect: TributeEffect): boolean {
  return props.form.effects.includes(effect)
}

function toggle(effect: TributeEffect) {
  const index = props.form.effects.indexOf(effect)
  if (index === -1) {
    props.form.effects.push(effect)
  } else {
    props.form.effects.splice(index, 1)
  }
}
</script>

<style scoped>
.effects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.effect-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 22px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    background var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.effect-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.effect-card--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.effect-card__emoji {
  font-size: 1.8rem;
  line-height: 1;
}
.effect-card__label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
}
.effect-card__check {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.effect-card--active .effect-card__check {
  opacity: 1;
  transform: scale(1);
}
</style>
