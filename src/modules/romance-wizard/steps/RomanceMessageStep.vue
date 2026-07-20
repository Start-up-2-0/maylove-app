<template>
  <RomanceFormShell
    :icon="experience?.icon ?? '💌'"
    :title="introTitle"
    :prompt="introDesc"
    flat
  >
    <RichTextEditor v-model="form.message" :placeholder="placeholder" />
    <p class="rom-field__hint">A plataforma cuida da tipografia, animação e abertura.</p>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import RichTextEditor from '@/components/wizard/RichTextEditor.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import {
  getRomanceExperience,
  type RomanceExperienceId,
} from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const experience = computed(() => getRomanceExperience(props.experienceId))

const introTitle = computed(() =>
  props.experienceId === 'carta-amor' ? 'Escreva a carta' : 'Sua mensagem',
)

const introDesc = computed(() =>
  props.experienceId === 'pedido-casamento' || props.experienceId === 'pedido-namoro'
    ? 'Escreva a carta que prepara o momento da pergunta especial.'
    : 'Escreva do coração — este é o texto principal da experiência.',
)

const placeholder = computed(() =>
  props.experienceId === 'pedido-namoro'
    ? 'Conte o que sente e prepare o convite...'
    : props.experienceId === 'pedido-casamento'
      ? 'Descreva a jornada de vocês até este momento...'
      : 'Escreva do coração...',
)

watch(
  () => props.experienceId,
  (id) => {
    if (id === 'carta-amor') props.form.include_opening_message = true
  },
  { immediate: true },
)
</script>

<style scoped>
.rom-field__hint {
  margin: 12px 0 0;
}
</style>
