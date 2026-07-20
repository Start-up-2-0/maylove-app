<template>
  <div class="special-date-step wiz-step-content">
    <WizardStepHeader
      title="Data especial"
      description="Destaque um momento importante com contador regressivo ou contador desde o evento."
    />

    <label class="sd-toggle">
      <input v-model="form.special_date_config.enabled" type="checkbox" class="sd-toggle__input" />
      <span class="sd-toggle__box" aria-hidden="true">
        <svg v-if="form.special_date_config.enabled" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="sd-toggle__copy">
        <strong>Incluir data especial</strong>
        <span class="sd-toggle__hint">Essa data poderá aparecer em diferentes áreas da homenagem.</span>
      </span>
    </label>

    <div v-if="form.special_date_config.enabled" class="wiz-card-stack ml-fade-up">
      <section class="wiz-card">
        <h3 class="wiz-card__title">Tipo de momento</h3>
        <p class="wiz-card__hint">Escolha o que melhor representa essa data.</p>
        <div class="sd-kinds">
          <button
            v-for="kind in kindOptions"
            :key="kind.id"
            type="button"
            class="sd-kind"
            :class="{ 'sd-kind--active': form.special_date_config.kind === kind.id }"
            @click="form.special_date_config.kind = kind.id"
          >
            <span class="sd-kind__icon" aria-hidden="true">{{ kind.icon }}</span>
            <span class="sd-kind__label">{{ kind.label }}</span>
          </button>
        </div>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Detalhes</h3>
        <div class="wiz-field-grid">
          <label class="ml-field">
            <span class="ml-label">Data *</span>
            <input v-model="form.special_date_config.date" type="date" class="ml-input" />
          </label>
          <label class="ml-field">
            <span class="ml-label">Hora (opcional)</span>
            <input v-model="form.special_date_config.time" type="time" class="ml-input" />
          </label>
          <label class="ml-field span-2">
            <span class="ml-label">Título *</span>
            <input
              v-model="form.special_date_config.title"
              class="ml-input"
              maxlength="120"
              placeholder="Ex.: Nosso primeiro beijo"
            />
          </label>
          <label class="ml-field span-2">
            <span class="ml-label">Descrição</span>
            <textarea
              v-model="form.special_date_config.description"
              class="ml-input ml-textarea"
              rows="4"
              maxlength="500"
              placeholder="Conte um pouco sobre esse momento..."
            />
          </label>
        </div>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Exibição do contador</h3>
        <div class="sd-counter-modes">
          <button
            v-for="mode in counterModes"
            :key="mode.id"
            type="button"
            class="sd-mode"
            :class="{ 'sd-mode--active': form.special_date_config.counter_mode === mode.id }"
            @click="form.special_date_config.counter_mode = mode.id"
          >
            <strong>{{ mode.label }}</strong>
            <span>{{ mode.description }}</span>
          </button>
        </div>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Formato na página</h3>
        <p class="wiz-card__hint">A prévia completa fica na etapa Revisão.</p>
        <div class="sd-formats">
          <button
            v-for="fmt in displayFormats"
            :key="fmt.id"
            type="button"
            class="sd-format"
            :class="{ 'sd-format--active': form.special_date_config.display_format === fmt.id }"
            @click="form.special_date_config.display_format = fmt.id"
          >
            {{ fmt.label }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SpecialDateCounterMode, SpecialDateDisplayFormat } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { SPECIAL_DATE_KIND_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()

const kindOptions = SPECIAL_DATE_KIND_OPTIONS

const counterModes: Array<{
  id: SpecialDateCounterMode
  label: string
  description: string
}> = [
  { id: 'since', label: 'Desde o evento', description: 'Mostra quanto tempo faz.' },
  { id: 'countdown', label: 'Contagem regressiva', description: 'Mostra quanto falta.' },
  { id: 'none', label: 'Somente a data', description: 'Exibe sem contador.' },
]

const displayFormats: Array<{ id: SpecialDateDisplayFormat; label: string }> = [
  { id: 'card', label: 'Cartão' },
  { id: 'hero', label: 'Destaque' },
  { id: 'compact', label: 'Compacto' },
  { id: 'inline', label: 'Inline' },
]
</script>

<style scoped>
.sd-toggle {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--primary-softer);
  cursor: pointer;
  margin-bottom: 24px;
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.sd-toggle:hover {
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
}
.sd-toggle__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.sd-toggle__box {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 2px;
  border-radius: 7px;
  border: 2px solid var(--border-strong);
  background: var(--surface);
  color: #fff;
  transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.sd-toggle__input:checked + .sd-toggle__box {
  background: var(--primary);
  border-color: var(--primary);
}
.sd-toggle__copy strong {
  display: block;
  font-size: 0.98rem;
  color: var(--ink);
}
.sd-toggle__hint {
  display: block;
  font-size: 0.86rem;
  color: var(--muted);
  margin-top: 4px;
  line-height: 1.4;
}
.sd-kinds {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 10px;
}
.sd-kind {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface-3);
  transition:
    border-color var(--dur) var(--ease),
    background var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}
.sd-kind:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
}
.sd-kind--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.sd-kind__icon {
  font-size: 1.35rem;
  line-height: 1;
}
.sd-kind__label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.3;
}
.sd-counter-modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.sd-mode {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface-3);
  font-size: 0.84rem;
  color: var(--muted);
  line-height: 1.4;
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
}
.sd-mode strong {
  font-size: 0.94rem;
  color: var(--ink);
}
.sd-mode--active {
  border-color: var(--primary);
  background: var(--primary-softer);
}
.sd-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.sd-format {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1.5px solid var(--border-strong);
  background: var(--surface-3);
  font-size: 0.88rem;
  font-weight: 600;
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease), color var(--dur) var(--ease);
}
.sd-format--active {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}
@media (max-width: 720px) {
  .sd-counter-modes {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .sd-kinds {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
