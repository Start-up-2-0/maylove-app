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
        <span class="rom-field__hint">{{ form.title.length }}/120</span>
      </label>

      <label v-if="isLetter" class="rom-field">
        <span class="rom-field__label">Saudação</span>
        <input
          v-model="form.subtitle"
          class="rom-field__input"
          maxlength="160"
          placeholder="Ex.: Meu amor,"
          autocomplete="off"
        />
        <span class="rom-field__hint">Opcional · {{ form.subtitle.length }}/160</span>
      </label>

      <label class="rom-field">
        <span class="rom-field__label">Sua mensagem especial *</span>
        <RichTextEditor v-model="form.message" :placeholder="messagePlaceholder" />
      </label>

      <label v-if="isLetter" class="rom-field">
        <span class="rom-field__label">Assinatura</span>
        <input
          v-model="form.signature"
          class="rom-field__input"
          maxlength="120"
          :placeholder="signaturePlaceholder"
          autocomplete="off"
        />
        <span class="rom-field__hint">
          Opcional · se ficar vazia, usamos seu nome · {{ form.signature.length }}/120
        </span>
      </label>
    </div>
    <p class="rom-field__hint">
      {{ isLetter
        ? 'A saudação, o corpo e a assinatura aparecem na leitura da carta. Confira a abertura na prévia ao lado.'
        : 'A plataforma cuida da tipografia, animação e abertura.' }}
    </p>
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
const isLetter = computed(() => props.experienceId === 'carta-amor')
const signaturePlaceholder = computed(() => props.form.sender_name?.trim() || 'Ex.: Com amor, Gustavo')

const titlePlaceholder = computed(() =>
  defaultRomanceTitle(props.form.wizard_type_id, props.experienceId),
)

const messagePlaceholder = computed(() =>
  props.experienceId === 'carta-amor'
    ? 'Escreva o que você sente, uma lembrança especial e aquilo que deseja dizer sem pressa...'
    : props.experienceId === 'pedido-namoro'
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
