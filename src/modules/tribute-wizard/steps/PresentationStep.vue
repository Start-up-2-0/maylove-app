<template>
  <div class="pres-step">
    <WizardStepHeader
      v-if="!embedded"
      title="Estilo de apresentação"
      description="Defina como a homenagem será exibida e como o visitante vai interagir com ela. O mesmo modelo pode virar uma carta, um slider, uma timeline e muito mais."
    />

    <div class="pres-grid">
      <button
        type="button"
        class="pres-card pres-card--default"
        :class="{ 'pres-card--active': !form.presentation }"
        @click="select('')"
      >
        <span class="pres-card__emoji">✨</span>
        <strong class="pres-card__label">Padrão do modelo</strong>
        <span class="pres-card__desc">
          Usa a experiência original: {{ defaultLayoutLabel }}.
        </span>
        <span class="pres-card__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>

      <button
        v-for="pres in presentations"
        :key="pres.id"
        type="button"
        class="pres-card"
        :class="{ 'pres-card--active': form.presentation === pres.id }"
        @click="select(pres.id)"
      >
        <span class="pres-card__emoji">{{ pres.emoji }}</span>
        <strong class="pres-card__label">{{ pres.label }}</strong>
        <span class="pres-card__desc">{{ pres.description }}</span>
        <ul class="pres-card__highlights">
          <li v-for="(hl, i) in pres.highlights" :key="i">{{ hl }}</li>
        </ul>
        <span class="pres-card__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { listPresentations } from '@/templates/presentations'
import { EXPERIENCE_LAYOUT_LABELS, type TemplateDefinition } from '@/templates/types'
import { syncModulesFromPresentation } from '@/utils/tributeModules'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = withDefaults(
  defineProps<{
    form: ReturnType<typeof useTributeWizard>['form']
    definition?: TemplateDefinition | null
    embedded?: boolean
  }>(),
  { embedded: false, definition: null },
)

const presentations = listPresentations()

const defaultLayoutLabel = computed(
  () => EXPERIENCE_LAYOUT_LABELS[props.definition?.layout ?? 'scroll'],
)

function select(id: string) {
  props.form.presentation = id
  syncModulesFromPresentation(props.form.modules, id, props.definition)
}
</script>

<style scoped>
.pres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.pres-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 18px 16px;
  text-align: left;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.pres-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.pres-card--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.pres-card__emoji {
  font-size: 1.9rem;
  line-height: 1;
}
.pres-card__label {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink);
}
.pres-card__desc {
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--muted);
}
.pres-card__highlights {
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pres-card__highlights li {
  position: relative;
  padding-left: 16px;
  font-size: 0.8rem;
  color: var(--text);
}
.pres-card__highlights li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--primary);
}
.pres-card__check {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}
.pres-card--active .pres-card__check {
  opacity: 1;
  transform: scale(1);
}
.pres-card--default {
  justify-content: center;
}
</style>
