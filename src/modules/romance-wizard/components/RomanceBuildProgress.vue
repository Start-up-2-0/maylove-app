<template>
  <div class="rom-build-progress" aria-live="polite">
    <div class="rom-build-progress__head">
      <span class="rom-build-progress__badge">{{ headline }}</span>
      <span class="rom-build-progress__pct">{{ progressPercent }}%</span>
    </div>
    <p class="rom-build-progress__label">{{ progressText }}</p>
    <div class="rom-build-progress__track">
      <div class="rom-build-progress__fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <p v-if="currentStepLabel" class="rom-build-progress__step">{{ currentStepLabel }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ROMANCE_BUILD_HEADLINE,
  ROMANCE_BUILD_STEP_LABELS,
  buildProgressLabel,
} from '@/modules/romance-wizard/romanceBuildCopy'
import type { RomanceExperienceStepId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  currentStep: RomanceExperienceStepId
  steps: RomanceExperienceStepId[]
  headline?: string
}>()

const headline = computed(() => props.headline ?? ROMANCE_BUILD_HEADLINE)
const currentIndex = computed(() => props.steps.indexOf(props.currentStep))
const progressPercent = computed(() =>
  props.steps.length ? Math.round(((currentIndex.value + 1) / props.steps.length) * 100) : 0,
)
const progressText = computed(() =>
  buildProgressLabel(currentIndex.value + 1, props.steps.length),
)
const currentStepLabel = computed(() => ROMANCE_BUILD_STEP_LABELS[props.currentStep] ?? '')
</script>

<style scoped>
.rom-build-progress {
  margin-bottom: 24px;
}
.rom-build-progress__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.rom-build-progress__badge {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rom-accent, #e11d48);
}
.rom-build-progress__pct {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--rom-accent-strong, var(--primary-strong));
}
.rom-build-progress__label {
  margin: 0 0 8px;
  font-size: 0.88rem;
  color: var(--muted);
}
.rom-build-progress__track {
  height: 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 12%, transparent);
  overflow: hidden;
}
.rom-build-progress__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    var(--rom-accent, #e11d48),
    color-mix(in srgb, var(--rom-accent, #e11d48) 65%, #fda4af)
  );
  transition: width 0.4s ease;
}
.rom-build-progress__step {
  margin: 10px 0 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
}
</style>
