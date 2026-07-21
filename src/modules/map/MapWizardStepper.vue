<template>
  <nav class="wiz-stepper" aria-label="Etapas">
    <div class="wiz-stepper__progress-row">
      <span class="wiz-stepper__progress-label">
        Etapa {{ currentIndex + 1 }} de {{ steps.length }}
      </span>
      <span class="wiz-stepper__progress-pct">{{ progressPercent }}%</span>
    </div>
    <div class="wizard-progress">
      <div class="wizard-progress__fill" :style="{ width: `${progressPercent}%` }" />
    </div>

    <div class="wizard-stepper-scroll flex gap-2 pb-1 mt-3">
      <button
        v-for="(step, index) in steps"
        :key="step"
        type="button"
        class="wizard-step-pill"
        :class="{
          active: currentStep === step,
          done: index < currentIndex,
        }"
        @click="$emit('go', step)"
      >
        <span class="wizard-step-pill__num">
          <svg
            v-if="index < currentIndex"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        {{ MAP_WIZARD_STEP_LABELS[step] }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MAP_WIZARD_STEP_LABELS, MAP_WIZARD_STEPS, type MapWizardStep } from './mapWizardSteps'

const props = withDefaults(
  defineProps<{
    currentStep: MapWizardStep
    steps?: MapWizardStep[]
  }>(),
  { steps: () => [...MAP_WIZARD_STEPS] },
)

defineEmits<{ go: [step: MapWizardStep] }>()

const steps = computed(() => props.steps)

const currentIndex = computed(() => steps.value.indexOf(props.currentStep))

const progressPercent = computed(() =>
  Math.round(((currentIndex.value + 1) / steps.value.length) * 100),
)
</script>

<style scoped>
.wiz-stepper {
  margin-bottom: 22px;
}
.wiz-stepper__progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.wiz-stepper__progress-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
}
.wiz-stepper__progress-pct {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary-strong);
}
</style>
