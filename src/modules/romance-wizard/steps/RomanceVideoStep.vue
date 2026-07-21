<template>
  <RomanceFormShell :title="stepTitle" :prompt="stepPrompt">
    <label class="rom-field">
      <span class="rom-field__label">URL do vídeo (YouTube)</span>
      <input
        v-model="form.video_url"
        class="rom-field__input"
        type="url"
        placeholder="https://www.youtube.com/watch?v=..."
        autocomplete="off"
      />
      <span class="rom-field__hint">Opcional, mas recomendado para tornar o pedido inesquecível.</span>
    </label>
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

const stepTitle = computed(() => getCoachStepTitle('video', 'Vídeo especial'))
const stepPrompt = computed(() => getCoachPrompt('video', props.experienceId))
</script>
