<template>
  <RomanceFormShell
    icon="✨"
    title="Toque especial"
    prompt="Já aplicamos o visual ideal para esta experiência. Quer adicionar mais animações?"
    flat
  >
    <EffectsStep :form="form" embedded />
    <p v-if="!form.effects.length" class="rom-field__hint">
      Nenhum efeito selecionado — a experiência ainda funciona, mas fica mais simples.
    </p>
    <p v-else class="rom-field__hint">
      {{ form.effects.length }} efeito{{ form.effects.length === 1 ? '' : 's' }} ativo{{ form.effects.length === 1 ? '' : 's' }}:
      {{ activeLabels }}
    </p>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeEffect } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import EffectsStep from '@/modules/tribute-wizard/steps/EffectsStep.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()

const effectLabels: Record<TributeEffect, string> = {
  confetti: 'Confete',
  hearts: 'Corações',
  petals: 'Pétalas',
  fireworks: 'Fogos',
  stars: 'Estrelas',
  snow: 'Neve',
}

const activeLabels = computed(() =>
  props.form.effects.map((item) => effectLabels[item as TributeEffect] ?? item).join(', '),
)
</script>

<style scoped>
.rom-field__hint {
  margin: 14px 0 0;
}
</style>
