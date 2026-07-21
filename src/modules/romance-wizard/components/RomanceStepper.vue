<template>
  <nav class="rom-stepper" aria-label="Etapas da experiência">
    <div class="rom-stepper__head">
      <span class="rom-stepper__label">Passo {{ currentIndex + 1 }} de {{ steps.length }}</span>
      <span class="rom-stepper__pct">{{ progressPercent }}%</span>
    </div>
    <div class="rom-stepper__track">
      <div class="rom-stepper__fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <ol class="rom-stepper__list">
      <li
        v-for="(step, index) in steps"
        :key="step"
        class="rom-stepper__item"
        :class="{
          'rom-stepper__item--active': currentStep === step,
          'rom-stepper__item--done': index < currentIndex,
        }"
      >
        <button
          type="button"
          class="rom-stepper__btn"
          :disabled="!canNavigateTo(index)"
          @click="$emit('go', step)"
        >
          <span class="rom-stepper__num">
            <svg
              v-if="index < currentIndex"
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="rom-stepper__text">{{ stepLabels[step] ?? step }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ROMANCE_EXPERIENCE_STEP_LABELS,
  type RomanceExperienceStepId,
} from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  currentStep: RomanceExperienceStepId
  steps: RomanceExperienceStepId[]
}>()

defineEmits<{ go: [step: RomanceExperienceStepId] }>()

const stepLabels = ROMANCE_EXPERIENCE_STEP_LABELS
const currentIndex = computed(() => props.steps.indexOf(props.currentStep))
const progressPercent = computed(() =>
  props.steps.length ? Math.round(((currentIndex.value + 1) / props.steps.length) * 100) : 0,
)

/** Permite voltar a passos anteriores; o passo atual também é clicável (no-op no pai). */
function canNavigateTo(index: number) {
  return index <= currentIndex.value
}
</script>

<style scoped>
.rom-stepper {
  margin-bottom: 28px;
}
.rom-stepper__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.82rem;
  font-weight: 600;
}
.rom-stepper__label {
  color: var(--rom-muted, var(--muted));
}
.rom-stepper__pct {
  color: var(--rom-accent, var(--primary-strong));
}
.rom-stepper__track {
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--rom-accent, var(--primary)) 12%, transparent);
  overflow: hidden;
}
.rom-stepper__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    var(--rom-accent, var(--primary)),
    color-mix(in srgb, var(--rom-accent, var(--primary)) 70%, #fff)
  );
  transition: width 0.35s ease;
}
.rom-stepper__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}
.rom-stepper__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--muted);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}
.rom-stepper__btn:hover:not(:disabled) {
  border-color: var(--rom-accent, var(--primary));
  color: var(--ink);
}
.rom-stepper__btn:disabled {
  opacity: 0.72;
  cursor: default;
}
.rom-stepper__item--active .rom-stepper__btn {
  border-color: var(--rom-accent, var(--primary));
  background: var(--rom-accent-soft, var(--primary-softer));
  color: var(--rom-accent-strong, var(--primary-strong));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--rom-accent, var(--primary)) 18%, transparent);
}
.rom-stepper__item--done .rom-stepper__btn {
  border-color: color-mix(in srgb, var(--rom-accent, var(--primary)) 35%, var(--border));
  color: var(--ink);
}
.rom-stepper__num {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  font-size: 0.72rem;
  background: color-mix(in srgb, var(--rom-accent, var(--primary)) 10%, var(--surface));
}
.rom-stepper__item--active .rom-stepper__num {
  background: var(--rom-accent, var(--primary));
  color: #fff;
}
</style>
