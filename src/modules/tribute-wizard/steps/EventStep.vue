<template>
  <div class="event-step">
    <WizardStepHeader
      title="Informações do evento"
      description="Data, local e mapa aparecem em um cartão de evento na homenagem."
    />

    <div class="ev-grid">
      <label class="ml-field">
        <span class="ml-field__label">Data</span>
        <input
          v-model="form.event_info.date"
          type="text"
          class="ml-input"
          placeholder="Ex.: 12 de dezembro de 2026, 16h"
        />
      </label>

      <label class="ml-field">
        <span class="ml-field__label">Local</span>
        <input
          v-model="form.event_info.location"
          type="text"
          class="ml-input"
          placeholder="Ex.: Espaço Villa Jardim, São Paulo"
        />
      </label>

      <label class="ml-field">
        <span class="ml-field__label">Link do mapa (opcional)</span>
        <input
          v-model="form.event_info.map_url"
          type="url"
          class="ml-input"
          placeholder="https://maps.google.com/..."
        />
        <span class="ml-field__hint">
          Cole o link do Google Maps. Um botão "Ver no mapa" será exibido.
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { useTributeWizard } from '@/composables/useTributeWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()
</script>

<style scoped>
.ev-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
}
</style>
