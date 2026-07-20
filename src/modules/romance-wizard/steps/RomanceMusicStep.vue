<template>
  <div class="rom-music">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">{{ experience?.label ?? 'Romance' }}</p>
      <h2 class="rom-step-intro__title">Trilha sonora</h2>
      <p class="rom-step-intro__desc">
        Escolha a música que embala a experiência — ela entra automaticamente na abertura.
      </p>
    </header>

    <section class="rom-panel">
      <MusicStep
        :form="form"
        :supports-music="true"
        :tribute-id="tributeId"
        compact
        @changed="$emit('media-changed')"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import MusicStep from '@/modules/tribute-wizard/steps/MusicStep.vue'
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
