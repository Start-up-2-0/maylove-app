<template>
  <div class="rom-chapters">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">{{ experience?.label ?? 'Romance' }}</p>
      <h2 class="rom-step-intro__title">Capítulos da história</h2>
      <p class="rom-step-intro__desc">
        Adicione os marcos do relacionamento — data, título, texto e foto. A plataforma monta a linha do tempo.
      </p>
    </header>

    <section class="rom-panel">
      <StoryStep :form="form" :photos="photos" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import StoryStep from '@/modules/tribute-wizard/steps/StoryStep.vue'
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
