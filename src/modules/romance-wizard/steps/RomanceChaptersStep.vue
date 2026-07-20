<template>
  <RomanceFormShell
    :icon="experience?.icon ?? '📖'"
    title="Capítulos da história"
    prompt="Adicione os marcos do relacionamento — data, título, texto e foto. Montamos a linha do tempo."
    flat
  >
    <StoryStep :form="form" :photos="photos" />
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import StoryStep from '@/modules/tribute-wizard/steps/StoryStep.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import {
  getRomanceExperience,
  type RomanceExperienceId,
} from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  photos: TributeMedia[]
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))
</script>

<style scoped>
:deep(.story-step .wiz-step-header) {
  display: none;
}
</style>
