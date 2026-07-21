<template>
  <div class="personalization-step wiz-step-content">
    <WizardStepHeader
      title="Personalização"
      description="Escolha como a homenagem será exibida e configure paleta, fontes e efeitos visuais."
    />

    <div class="wiz-card-stack">
      <section class="wiz-card">
        <h3 class="wiz-card__title">Apresentação</h3>
        <p class="wiz-card__hint">Como a homenagem será exibida e navegada.</p>
        <PresentationStep :form="form" :definition="definition" embedded />
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Visual e efeitos</h3>
        <p class="wiz-card__hint">Estilo, cores, fontes e animações da página.</p>
        <AppearanceStep :form="form" :definition="definition" embedded />
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Efeitos especiais</h3>
        <p class="wiz-card__hint">Animações que aparecem na página pública.</p>
        <EffectsStep :form="form" embedded />
      </section>
    </div>
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
