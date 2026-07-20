<template>
  <div class="special-date-step">
    <WizardStepHeader
      title="Data especial"
      description="Destaque um momento importante com contador regressivo ou contador desde o evento."
    />

    <label class="sd-toggle ml-field">
      <input v-model="form.special_date_config.enabled" type="checkbox" class="sd-toggle__input" />
      <span class="sd-toggle__box" />
      <span>
        <strong>Incluir data especial</strong>
        <span class="sd-toggle__hint">Essa data poderá aparecer em diferentes áreas da homenagem.</span>
      </span>
    </label>

    <div v-if="form.special_date_config.enabled" class="sd-body ml-fade-up">
      <div class="sd-kinds">
        <button
          v-for="kind in kindOptions"
          :key="kind.id"
          type="button"
          class="sd-kind"
          :class="{ 'sd-kind--active': form.special_date_config.kind === kind.id }"
          @click="form.special_date_config.kind = kind.id"
        >
          <span aria-hidden="true">{{ kind.icon }}</span>
          {{ kind.label }}
        </button>
      </div>

      <div class="sd-grid">
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
            rows="3"
            maxlength="500"
            placeholder="Conte um pouco sobre esse momento..."
          />
        </label>
      </div>

      <section class="sd-section">
        <h3 class="sd-section__title">Exibição do contador</h3>
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

      <section class="sd-section">
        <h3 class="sd-section__title">Formato de exibição</h3>
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

      <div v-if="previewLabel" class="sd-preview">
        <span class="sd-preview__label">Prévia</span>
        <p class="sd-preview__text">{{ previewLabel }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpecialDateCounterMode, SpecialDateDisplayFormat } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { SPECIAL_DATE_KIND_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
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

const previewLabel = computed(() => {
  const cfg = props.form.special_date_config
  if (!cfg.enabled || !cfg.title?.trim()) return ''
  const kind = kindOptions.find((item) => item.id === cfg.kind)?.label ?? 'Data especial'
  const date = cfg.date ? new Date(`${cfg.date}T12:00:00`).toLocaleDateString('pt-BR') : ''
  const mode =
    cfg.counter_mode === 'countdown'
      ? ' — contagem regressiva'
      : cfg.counter_mode === 'since'
        ? ' — desde o evento'
        : ''
  return `${cfg.title.trim()} · ${kind}${date ? ` · ${date}` : ''}${mode}`
})
</script>

<style scoped>
.sd-toggle {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-3);
  cursor: pointer;
  margin-bottom: 20px;
}
.sd-toggle__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.sd-toggle__box {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  border-radius: 6px;
  border: 2px solid var(--border-strong);
  background: var(--surface);
}
.sd-toggle__input:checked + .sd-toggle__box {
  background: var(--primary);
  border-color: var(--primary);
}
.sd-toggle__hint {
  display: block;
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 2px;
}
.sd-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sd-kinds {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sd-kind {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-size: 0.86rem;
  font-weight: 600;
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
}
.sd-kind--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  color: var(--primary-strong);
}
.sd-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.span-2 {
  grid-column: span 2;
}
.sd-section__title {
  font-size: 0.94rem;
  font-weight: 600;
  margin-bottom: 10px;
}
.sd-counter-modes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.sd-mode {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  font-size: 0.82rem;
  color: var(--muted);
}
.sd-mode strong {
  font-size: 0.9rem;
  color: var(--ink);
}
.sd-mode--active {
  border-color: var(--primary);
  background: var(--primary-softer);
}
.sd-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sd-format {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-size: 0.86rem;
  font-weight: 600;
}
.sd-format--active {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}
.sd-preview {
  padding: 16px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-softer), var(--surface));
  border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--border));
}
.sd-preview__label {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.sd-preview__text {
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--ink);
}
@media (max-width: 640px) {
  .sd-grid {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: span 1;
  }
}
</style>
