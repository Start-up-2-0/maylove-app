<template>
  <div class="rom-recipient">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">{{ experience?.label ?? 'Romance' }}</p>
      <h2 class="rom-step-intro__title">{{ introTitle }}</h2>
      <p class="rom-step-intro__desc">{{ introDesc }}</p>
    </header>

    <section class="rom-panel">
      <div class="rom-couple__fields">
        <label class="rom-field">
          <span class="rom-field__label">Quem recebe o presente *</span>
          <input
            v-model="form.honoree_name"
            class="rom-field__input"
            maxlength="120"
            placeholder="Ex.: Maria"
            autocomplete="off"
          />
        </label>

        <label class="rom-field">
          <span class="rom-field__label">Quem envia</span>
          <input
            v-model="form.sender_name"
            class="rom-field__input"
            maxlength="80"
            placeholder="Ex.: João"
            autocomplete="off"
          />
        </label>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { getRomanceExperience, type RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))

const introTitle = computed(() => {
  switch (props.experienceId) {
    case 'carta-amor':
      return 'Para quem é esta carta?'
    case 'nossa-historia':
      return 'De quem é esta história?'
    case 'playlist-casal':
      return 'Quem são os protagonistas da playlist?'
    default:
      return 'Quem são os apaixonados?'
  }
})

const introDesc = computed(
  () =>
    experience.value?.description ??
    'Nomes de quem presenteia e de quem recebe — aparecem na abertura da experiência.',
)
</script>

<style scoped>
.rom-couple__fields {
  display: grid;
  gap: 16px;
}
@media (min-width: 640px) {
  .rom-couple__fields {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
