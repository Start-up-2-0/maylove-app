<template>
  <div class="rom-special-date">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">{{ experience?.label ?? 'Romance' }}</p>
      <h2 class="rom-step-intro__title">Data especial</h2>
      <p class="rom-step-intro__desc">
        Marque o dia que importa — contador de tempo juntos ou contagem regressiva na experiência.
      </p>
    </header>

    <section class="rom-panel">
      <SpecialDateStep :form="form" />
      <label v-if="allowCountdown" class="rom-inline-toggle">
        <input v-model="countdownMode" type="checkbox" />
        <span>Usar contagem regressiva (até a data)</span>
      </label>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import SpecialDateStep from '@/modules/tribute-wizard/steps/SpecialDateStep.vue'
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
</style>
