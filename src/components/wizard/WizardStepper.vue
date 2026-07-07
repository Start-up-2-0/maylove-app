<template>
  <nav class="wizard-stepper mb-5">
    <FwbProgress
      class="mb-3"
      :progress="progressPercent"
      color="purple"
      size="sm"
      label="Progresso"
      label-position="outside"
    />
    <div class="wizard-stepper-scroll flex gap-2 pb-1">
      <button
        v-for="step in steps"
        :key="step"
        type="button"
        class="wizard-step-pill"
        :class="{
          active: currentStep === step,
          done: stepIndex(step) < stepIndex(currentStep),
        }"
        @click="$emit('go', step)"
      >
        {{ WIZARD_STEP_LABELS[step] }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FwbProgress } from 'flowbite-vue'
import { WIZARD_STEP_LABELS, WIZARD_STEPS, type WizardStep } from '@/api/types'

const props = defineProps<{
  currentStep: WizardStep
}>()

defineEmits<{ go: [step: WizardStep] }>()

const steps = WIZARD_STEPS

const progressPercent = computed(() => {
  const index = steps.indexOf(props.currentStep)
  return Math.round(((index + 1) / steps.length) * 100)
})

function stepIndex(step: WizardStep): number {
  return steps.indexOf(step)
}
</script>
