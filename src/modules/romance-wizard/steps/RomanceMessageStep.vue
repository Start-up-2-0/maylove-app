<template>
  <div class="rom-message">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">{{ experience?.label ?? 'Romance' }}</p>
      <h2 class="rom-step-intro__title">{{ introTitle }}</h2>
      <p class="rom-step-intro__desc">{{ introDesc }}</p>
    </header>

    <section class="rom-panel">
      <RichTextEditor v-model="form.message" :placeholder="placeholder" />
      <p class="rom-field__hint">Escreva do coração — a plataforma cuida da tipografia e animação.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import RichTextEditor from '@/components/wizard/RichTextEditor.vue'
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
    ? 'A carta que prepara o momento da pergunta especial.'
    : 'O texto principal da experiência — como uma carta de amor digital.',
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
