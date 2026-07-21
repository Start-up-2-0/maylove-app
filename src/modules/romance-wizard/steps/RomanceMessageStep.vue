<template>
  <RomanceFormShell :title="stepTitle" :prompt="stepPrompt" flat>
    <div class="rom-form-stack">
      <label class="rom-field">
        <span class="rom-field__label">Título da mensagem</span>
        <input
          v-model="form.title"
          class="rom-field__input"
          maxlength="120"
          :placeholder="titlePlaceholder"
          autocomplete="off"
        />
      </label>

      <label class="rom-field">
        <span class="rom-field__label">Sua mensagem especial *</span>
        <RichTextEditor v-model="form.message" :placeholder="messagePlaceholder" />
      </label>
    </div>
    <p class="rom-field__hint">A plataforma cuida da tipografia, animação e abertura.</p>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import RichTextEditor from '@/components/wizard/RichTextEditor.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { defaultRomanceTitle, isLegacyGenericTitle } from '@/modules/romance-wizard/romanceCopy'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const stepTitle = computed(() =>
  getCoachStepTitle('message', props.experienceId === 'carta-amor' ? 'Escreva a carta' : 'Mensagem especial'),
)
const stepPrompt = computed(() => getCoachPrompt('message', props.experienceId))

const titlePlaceholder = computed(() =>
  defaultRomanceTitle(props.form.wizard_type_id, props.experienceId),
)

const messagePlaceholder = computed(() =>
  props.experienceId === 'pedido-namoro'
    ? 'Conta a história de vocês — como se conheceram, o que torna esse amor tão especial...'
    : props.experienceId === 'pedido-casamento'
      ? 'Descreva a jornada de vocês até este momento...'
      : 'Conta a história de vocês — como se conheceram, o que torna esse amor tão especial...',
)

onMounted(() => {
  if (!props.form.title?.trim() || isLegacyGenericTitle(props.form.title)) {
    props.form.title = defaultRomanceTitle(props.form.wizard_type_id, props.experienceId)
  }
})

watch(
  () => props.experienceId,
  (id) => {
    if (id === 'carta-amor') props.form.include_opening_message = true
  },
  { immediate: true },
)
</script>

<style scoped>
.rom-field__hint {
  margin: 12px 0 0;
}
</style>
