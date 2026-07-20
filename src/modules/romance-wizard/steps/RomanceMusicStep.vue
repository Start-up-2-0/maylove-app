<template>
  <RomanceFormShell
    :icon="experience?.icon ?? '🎵'"
    title="Trilha sonora"
    prompt="Escolha a música que embala a experiência — ela entra na abertura automaticamente."
    flat
  >
    <MusicStep
      :form="form"
      :supports-music="true"
      :tribute-id="tributeId"
      compact
      @changed="$emit('media-changed')"
    />
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import MusicStep from '@/modules/tribute-wizard/steps/MusicStep.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import {
  getRomanceExperience,
  type RomanceExperienceId,
} from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  experienceId?: RomanceExperienceId | null
}>()

defineEmits<{ 'media-changed': [] }>()

const experience = computed(() => getRomanceExperience(props.experienceId))
</script>
