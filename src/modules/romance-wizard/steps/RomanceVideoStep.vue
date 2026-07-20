<template>
  <div class="rom-video">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">{{ experience?.label ?? 'Romance' }}</p>
      <h2 class="rom-step-intro__title">Vídeo especial</h2>
      <p class="rom-step-intro__desc">
        Cole o link de um vídeo do YouTube — ele entra na experiência antes da pergunta.
      </p>
    </header>

    <section class="rom-panel">
      <label class="rom-field rom-field--wide">
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import {
  getRomanceExperience,
  type RomanceExperienceId,
} from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))
</script>
