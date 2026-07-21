<template>
  <RomanceFormShell
    :title="stepTitle"
    :prompt="stepPrompt"
  >
    <div class="rom-form-stack">
      <label class="rom-field">
        <span class="rom-field__label">Seu nome</span>
        <input
          v-model="form.sender_name"
          class="rom-field__input"
          maxlength="80"
          placeholder="Ex.: Gustavo"
          autocomplete="off"
        />
      </label>

      <label class="rom-field">
        <span class="rom-field__label">Nome do(a) parceiro(a) *</span>
        <input
          v-model="form.honoree_name"
          class="rom-field__input"
          maxlength="120"
          placeholder="Ex.: Tay"
          autocomplete="off"
        />
      </label>

      <label v-if="showRelationshipDate" class="rom-field">
        <span class="rom-field__label">{{ relationshipDateLabel }}</span>
        <input
          v-model="relationshipDate"
          type="date"
          class="rom-field__input"
        />
        <span v-if="dateOptional" class="rom-field__hint">Opcional — aparece na prévia e na experiência.</span>
      </label>

      <RomanceRelationshipCounter
        v-if="showRelationshipDate"
        :config="form.special_date_config"
      />

      <label v-if="allowCountdown" class="rom-inline-toggle">
        <input v-model="countdownMode" type="checkbox" />
        <span>Contagem regressiva até a data</span>
      </label>
    </div>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import RomanceRelationshipCounter from '@/modules/romance-wizard/components/RomanceRelationshipCounter.vue'
import { getRomanceExperience, type RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))

const stepTitle = computed(() => getCoachStepTitle('recipient', experience.value?.label))
const stepPrompt = computed(() => getCoachPrompt('recipient', props.experienceId))

const showRelationshipDate = computed(() => experience.value?.id !== 'nossa-historia')

const dateOptional = computed(() => experience.value?.specialDateOptional ?? false)
const allowCountdown = computed(() => experience.value?.allowCountdown ?? false)

const relationshipDateLabel = computed(() =>
  dateOptional.value ? 'Data do início do relacionamento (opcional)' : 'Data do início do relacionamento *',
)

const relationshipDate = computed({
  get: () => props.form.special_date_config.date ?? '',
  set: (value: string) => {
    props.form.special_date_config.date = value
    if (value.trim()) {
      props.form.special_date_config.enabled = true
      if (!props.form.special_date_config.title?.trim()) {
        props.form.special_date_config.title = 'Nosso amor'
      }
      if (!props.form.special_date_config.kind) {
        props.form.special_date_config.kind = 'custom'
      }
      if (!props.form.special_date_config.counter_mode) {
        props.form.special_date_config.counter_mode = 'since'
      }
    } else if (dateOptional.value) {
      props.form.special_date_config.enabled = false
    }
  },
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
      if (!props.form.special_date_config.title?.trim()) {
        props.form.special_date_config.title = 'Nossa data especial'
      }
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
  margin-top: 4px;
  font-size: 0.88rem;
  color: var(--muted);
  cursor: pointer;
}
.rom-inline-toggle input {
  accent-color: var(--rom-accent, #e11d48);
}
</style>
