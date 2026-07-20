<template>
  <div class="modules-step wiz-step-content">
    <WizardStepHeader
      title="Recursos extras"
      description="Selecione quais módulos ficarão ativos na sua homenagem."
    />

    <section class="wiz-card">
      <h3 class="wiz-card__title">Módulos disponíveis</h3>
      <p class="wiz-card__hint">Ative os recursos que deseja incluir na homenagem.</p>

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
</template>

<script setup lang="ts">
import type { TributeModulesConfig } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { TRIBUTE_MODULE_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()

const moduleOptions = TRIBUTE_MODULE_OPTIONS

function toggle(id: keyof TributeModulesConfig) {
  props.form.modules[id] = !props.form.modules[id]
}
</script>

<style scoped>
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
