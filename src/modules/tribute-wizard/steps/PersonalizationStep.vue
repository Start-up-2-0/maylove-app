<template>
  <div class="personalization-step">
    <WizardStepHeader
      title="Personalização"
      description="Configure paleta, fontes, fundo, animações, efeitos visuais e estilo da página."
    />

    <section class="ps-section">
      <h3 class="ps-section__title">Apresentação</h3>
      <PresentationStep :form="form" :definition="definition" embedded />
    </section>

    <section class="ps-section">
      <h3 class="ps-section__title">Visual e efeitos</h3>
      <AppearanceStep :form="form" :definition="definition" embedded />
    </section>

    <section class="ps-section">
      <h3 class="ps-section__title">Efeitos especiais</h3>
      <EffectsStep :form="form" embedded />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import PresentationStep from './PresentationStep.vue'
import AppearanceStep from './AppearanceStep.vue'
import EffectsStep from './EffectsStep.vue'

defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  definition: TemplateDefinition | null | undefined
}>()
</script>

<style scoped>
.ps-section {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.ps-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.ps-section__title {
  font-size: 0.94rem;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--ink);
}
</style>
