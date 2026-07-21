<template>
  <div class="modules-step wiz-step-content">
    <WizardStepHeader
      title="Recursos extras"
      description="Recursos opcionais além do estilo de apresentação escolhido."
    />

    <div class="wiz-card-stack">
      <section class="wiz-card mod-derived">
        <h3 class="wiz-card__title">Incluído na apresentação</h3>
        <p class="wiz-card__hint">
          Estes recursos vêm automaticamente do estilo
          <strong>{{ presentationLabel }}</strong> — configure-o em Personalização.
        </p>
        <ul class="mod-derived__list">
          <li v-for="(item, index) in derivedModules" :key="index">{{ item }}</li>
        </ul>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Add-ons opcionais</h3>
        <p class="wiz-card__hint">Ative recursos extras que não dependem do estilo de apresentação.</p>

        <div class="mod-grid">
          <button
            v-for="mod in moduleOptions"
            :key="mod.id"
            type="button"
            class="mod-card"
            :class="{
              'mod-card--active': form.modules[mod.id],
              'mod-card--disabled': Boolean(mod.badge),
            }"
            :disabled="Boolean(mod.badge)"
            @click="toggle(mod.id)"
          >
            <span class="mod-card__icon" aria-hidden="true">{{ mod.icon }}</span>
            <div class="mod-card__body">
              <strong class="mod-card__label">
                {{ mod.label }}
                <span v-if="mod.badge" class="mod-card__badge">{{ mod.badge }}</span>
              </strong>
              <span class="mod-card__desc">{{ mod.description }}</span>
            </div>
            <span class="mod-card__switch" :class="{ 'mod-card__switch--on': form.modules[mod.id] }" />
          </button>
        </div>

        <p class="mod-hint">
          Módulos marcados como "Em breve" estarão disponíveis em atualizações futuras.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeModulesConfig } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { TRIBUTE_ADDON_MODULE_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import { resolvePresentationSchema } from '@/templates/presentationSchema'
import type { TemplateDefinition } from '@/templates/types'
import { describeDerivedModules } from '@/utils/tributeModules'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  definition?: TemplateDefinition | null
}>()

const moduleOptions = TRIBUTE_ADDON_MODULE_OPTIONS

const presentationLabel = computed(
  () => resolvePresentationSchema(props.form.presentation, props.definition).presentationLabel,
)

const derivedModules = computed(() =>
  describeDerivedModules(props.form.presentation, props.definition),
)

function toggle(id: keyof TributeModulesConfig) {
  props.form.modules[id] = !props.form.modules[id]
}
</script>

<style scoped>
.mod-derived__list {
  margin: 0;
  padding: 0 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text);
}
.mod-derived__list li::marker {
  color: var(--primary);
}
.mod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}
.mod-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface-3);
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.mod-card:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--primary);
}
.mod-card--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.mod-card--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.mod-card__icon {
  font-size: 1.5rem;
  line-height: 1;
  flex-shrink: 0;
}
.mod-card__body {
  flex: 1;
  min-width: 0;
}
.mod-card__label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.94rem;
  color: var(--ink);
}
.mod-card__badge {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted);
}
.mod-card__desc {
  display: block;
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 4px;
  line-height: 1.35;
}
.mod-card__switch {
  width: 36px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--border-strong);
  position: relative;
  transition: background var(--dur) var(--ease);
}
.mod-card__switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #fff;
  transition: transform var(--dur) var(--ease);
}
.mod-card__switch--on {
  background: var(--primary);
}
.mod-card__switch--on::after {
  transform: translateX(16px);
}
.mod-hint {
  margin-top: 16px;
  font-size: 0.82rem;
  color: var(--muted);
}
</style>
