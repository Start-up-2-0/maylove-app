<template>
  <RomanceFormShell :title="stepTitle" :prompt="stepPrompt">
    <div class="rom-form-stack">
      <label class="rom-field">
        <span class="rom-field__label">A pergunta *</span>
        <textarea
          v-model="form.question"
          class="rom-field__input rom-field__textarea"
          maxlength="300"
          :placeholder="questionPlaceholder"
          rows="3"
        />
        <span class="rom-field__hint">
          Aparece no momento principal do pedido · {{ form.question.length }}/300
        </span>
      </label>

      <label class="rom-field">
        <span class="rom-field__label">Mensagem depois do “sim” *</span>
        <textarea
          v-model="form.celebration"
          class="rom-field__input rom-field__textarea"
          maxlength="300"
          placeholder="Ex.: Este é o começo do nosso próximo capítulo."
          rows="4"
        />
        <span class="rom-field__hint">
          Surge junto da celebração · {{ form.celebration.length }}/300
        </span>
      </label>

      <div class="rom-proposal-note" role="note">
        <span aria-hidden="true">✨</span>
        <p>Na prévia, avance até o final da história para conferir a pergunta e a celebração.</p>
      </div>
    </div>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const stepTitle = computed(() =>
  getCoachStepTitle(
    'proposal',
    props.experienceId === 'pedido-casamento' ? 'O pedido de casamento' : 'O pedido de namoro',
  ),
)
const stepPrompt = computed(() => getCoachPrompt('proposal', props.experienceId))
const questionPlaceholder = computed(() =>
  props.experienceId === 'pedido-casamento'
    ? 'Ex.: Você aceita casar comigo?'
    : 'Ex.: Quer namorar comigo?',
)
</script>

<style scoped>
.rom-field__textarea {
  min-height: 92px;
  resize: vertical;
  line-height: 1.55;
}
.rom-proposal-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 18%, var(--border));
  border-radius: 14px;
  background: var(--rom-accent-soft, var(--primary-softer));
  color: var(--muted);
  font-size: 0.86rem;
}
.rom-proposal-note p { margin: 0; }
</style>
