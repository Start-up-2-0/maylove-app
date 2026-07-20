<template>
  <RomanceFormShell
    :icon="experience?.icon ?? '💕'"
    :title="experience?.label"
    prompt="Me conta: quem são os apaixonados? Os nomes aparecem na abertura da experiência."
  >
    <div class="rom-form-stack">
      <label class="rom-field">
        <span class="rom-field__label">Seu nome</span>
        <input
          v-model="form.sender_name"
          class="rom-field__input"
          maxlength="80"
          placeholder="Ex.: João"
          autocomplete="off"
        />
      </label>

      <label class="rom-field">
        <span class="rom-field__label">Nome do(a) parceiro(a) *</span>
        <input
          v-model="form.honoree_name"
          class="rom-field__input"
          maxlength="120"
          placeholder="Ex.: Maria"
          autocomplete="off"
        />
      </label>
    </div>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getRomanceExperience, type RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))
</script>
