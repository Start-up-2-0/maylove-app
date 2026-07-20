<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Informações do mapa"
      description="Defina título, nomes do casal e estilo visual da jornada."
    />

    <form class="basics-form" @submit.prevent>
      <label class="ml-field">
        <span>Título</span>
        <input v-model="form.title" class="ml-input" maxlength="120" required />
      </label>
      <label class="ml-field">
        <span>Nomes do casal</span>
        <input
          v-model="form.couple_names"
          class="ml-input"
          maxlength="120"
          placeholder="Ana & João"
        />
      </label>
      <label class="ml-field">
        <span>Subtítulo</span>
        <input
          v-model="form.subtitle"
          class="ml-input"
          maxlength="200"
          placeholder="Onde a história de vocês aconteceu"
        />
      </label>

      <fieldset class="basics-fieldset">
        <legend>Estilo do mapa</legend>
        <div class="style-options">
          <label
            v-for="option in styleOptions"
            :key="option.value"
            class="style-option"
            :class="{ 'style-option--active': form.map_style === option.value }"
          >
            <input v-model="form.map_style" type="radio" :value="option.value" />
            <strong>{{ option.label }}</strong>
            <small>{{ option.hint }}</small>
          </label>
        </div>
      </fieldset>

      <label class="ml-check">
        <input v-model="form.show_route" type="checkbox" />
        <span>Mostrar rota entre os locais na página pública</span>
      </label>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { useMapWizard } from '@/composables/useMapWizard'
import type { MapStyle } from '@/api/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

defineProps<{
  form: ReturnType<typeof useMapWizard>['form']
}>()

const styleOptions: Array<{ value: MapStyle; label: string; hint: string }> = [
  { value: 'romantic', label: 'Romântico', hint: 'Rosa suave e trilha em destaque' },
  { value: 'default', label: 'Clássico', hint: 'Visual limpo e equilibrado' },
  { value: 'minimal', label: 'Minimal', hint: 'Menos ornamentos, foco nos locais' },
  { value: 'vintage', label: 'Vintage', hint: 'Tom nostálgico e acolhedor' },
]
</script>

<style scoped>
.basics-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
}

.basics-fieldset {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  margin: 0;
}

.basics-fieldset legend {
  padding: 0 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--muted);
}

.style-options {
  display: grid;
  gap: 10px;
}

.style-option {
  display: grid;
  gap: 2px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.style-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.style-option strong {
  font-size: 0.92rem;
}

.style-option small {
  font-size: 0.8rem;
  color: var(--muted);
}

.style-option--active {
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 55%, #fff);
}
</style>
