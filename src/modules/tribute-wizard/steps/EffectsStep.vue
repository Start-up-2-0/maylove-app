<template>
  <div class="effects-step">
    <WizardStepHeader
      title="Efeitos visuais"
      description="Selecione animações que aparecerão na página pública."
    />

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
      <label
        v-for="effect in TRIBUTE_EFFECTS"
        :key="effect"
        class="rounded-xl border p-4 cursor-pointer transition-colors"
        :class="
          form.effects.includes(effect)
            ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
        "
      >
        <FwbCheckbox v-model="form.effects" :value="effect" :label="effectLabel(effect)" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FwbCheckbox } from 'flowbite-vue'
import { TRIBUTE_EFFECTS, type TributeEffect } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()

function effectLabel(effect: TributeEffect): string {
  return (
    ({
      confetti: 'Confete',
      hearts: 'Corações',
      petals: 'Pétalas',
      fireworks: 'Fogos',
      stars: 'Estrelas',
      snow: 'Neve',
    }) as Record<TributeEffect, string>
  )[effect]
}
</script>
