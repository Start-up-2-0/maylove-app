<template>
  <RomanceFormShell
    :icon="experience?.icon ?? '💕'"
    :title="experience?.label"
    prompt="Me conta: quem são os apaixonados? Você também escolhe o título que aparece na página."
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

      <label class="rom-field">
        <span class="rom-field__label">Título da página *</span>
        <input
          v-model="form.title"
          class="rom-field__input"
          maxlength="120"
          :placeholder="titlePlaceholder"
          autocomplete="off"
        />
        <span class="rom-field__hint">Aparece no topo da experiência e na prévia — edite como quiser.</span>
      </label>
    </div>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { defaultRomanceTitle, isLegacyGenericTitle } from '@/modules/romance-wizard/romanceCopy'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getRomanceExperience, type RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))

const titlePlaceholder = computed(() =>
  defaultRomanceTitle(props.form.wizard_type_id, props.experienceId),
)

onMounted(() => {
  if (!props.form.title?.trim() || isLegacyGenericTitle(props.form.title)) {
    props.form.title = defaultRomanceTitle(props.form.wizard_type_id, props.experienceId)
  }
})
</script>
