<template>
  <RomanceFormShell :title="stepTitle" :prompt="stepPrompt" flat>
    <SpecialDateStep :form="form" />
    <label v-if="allowCountdown" class="rom-inline-toggle">
      <input v-model="countdownMode" type="checkbox" />
      <span>Usar contagem regressiva (até a data)</span>
    </label>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import SpecialDateStep from '@/modules/tribute-wizard/steps/SpecialDateStep.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import {
  getRomanceExperience,
  type RomanceExperienceId,
} from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))
const allowCountdown = computed(() => experience.value?.allowCountdown ?? false)
const isOptional = computed(() => experience.value?.specialDateOptional ?? false)

const stepTitle = computed(() => getCoachStepTitle('special-date', 'Data especial'))
const stepPrompt = computed(() => {
  const base = getCoachPrompt('special-date', props.experienceId)
  if (isOptional.value && !experience.value?.enableSpecialDateByDefault) {
    return `${base} Marque o toggle abaixo ou clique em Continuar para pular.`
  }
  return base
})

const countdownMode = computed({
  get: () => props.form.special_date_config.counter_mode === 'countdown',
  set: (value: boolean) => {
    props.form.special_date_config.enabled = true
    props.form.special_date_config.counter_mode = value ? 'countdown' : 'since'
  },
})

watch(
  () => props.experienceId,
  () => {
    if (experience.value?.enableSpecialDateByDefault) {
      props.form.special_date_config.enabled = true
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.rom-inline-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  font-size: 0.88rem;
  color: var(--muted);
  cursor: pointer;
}
.rom-inline-toggle input {
  accent-color: var(--rom-accent, #e11d48);
}
:deep(.special-date-step .wiz-step-header) {
  display: none;
}
</style>
