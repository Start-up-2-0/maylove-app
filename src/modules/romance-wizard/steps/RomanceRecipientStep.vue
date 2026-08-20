<template>
  <RomanceFormShell
    :title="stepTitle"
    :prompt="stepPrompt"
  >
    <div class="rom-form-stack">
      <div v-if="experience?.id === 'nossa-historia'" class="rom-story-date-note" role="note">
        <span aria-hidden="true">📖</span>
        <span>As datas e lugares serão adicionados separadamente em cada capítulo da história.</span>
      </div>
      <label class="rom-field">
        <span class="rom-field__label">Seu nome</span>
        <input
          v-model="form.sender_name"
          class="rom-field__input"
          maxlength="80"
          placeholder="Ex.: Gustavo"
          autocomplete="off"
        />
        <span class="rom-field__hint">Opcional · {{ form.sender_name.length }}/80</span>
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
        <span class="rom-field__hint">{{ form.honoree_name.length }}/120</span>
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
        <input v-model="countdownMode" type="checkbox" :disabled="selectedDateIsPast" />
        <span>Contagem regressiva até a data futura</span>
      </label>
      <p v-if="showRelationshipDate && relationshipDate" class="rom-date-behavior">
        {{ dateBehaviorHint }}
      </p>
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
const selectedDateIsPast = computed(() => {
  if (!relationshipDate.value) return false
  const target = new Date(`${relationshipDate.value}T23:59:59`)
  return !Number.isNaN(target.getTime()) && target.getTime() < Date.now()
})
const dateBehaviorHint = computed(() =>
  selectedDateIsPast.value
    ? 'Como a data já passou, a página mostrará quanto tempo se passou desde esse momento.'
    : countdownMode.value
      ? 'A página mostrará quanto falta e mudará automaticamente para tempo decorrido depois da data.'
      : 'A página mostrará a data escolhida e o tempo decorrido quando ela chegar.',
)

const relationshipDateLabel = computed(() => {
  if (experience.value?.id === 'pedido-namoro') return 'Data do pedido *'
  if (experience.value?.id === 'pedido-casamento') return 'Data do pedido ou cerimônia *'
  return dateOptional.value
    ? 'Data do início do relacionamento (opcional)'
    : 'Data do início do relacionamento *'
})

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

watch(selectedDateIsPast, (isPast) => {
  if (isPast && props.form.special_date_config.counter_mode === 'countdown') {
    props.form.special_date_config.counter_mode = 'since'
  }
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
.rom-inline-toggle input:disabled { opacity: 0.55; cursor: not-allowed; }
.rom-date-behavior {
  margin: 0;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.45;
}
.rom-story-date-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.45;
}
</style>
