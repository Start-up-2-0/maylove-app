<template>
  <RomanceFormShell :title="stepTitle" :prompt="stepPrompt" flat>
    <StoryStep :form="form" :photos="photos" chapter-mode />
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import StoryStep from '@/modules/tribute-wizard/steps/StoryStep.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  photos: TributeMedia[]
  experienceId?: RomanceExperienceId | null
}>()

const stepTitle = computed(() => getCoachStepTitle('chapters', 'Capítulos da história'))
const stepPrompt = computed(() => getCoachPrompt('chapters', props.experienceId))
</script>

<style scoped>
:deep(.story-step .wiz-step-header) {
  display: none;
}
</style>
