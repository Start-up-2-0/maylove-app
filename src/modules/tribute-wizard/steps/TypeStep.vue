<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listTemplates, listTributeTypes } from '@/api/catalog'
import type { TributeType } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import {
  WIZARD_TRIBUTE_TYPE_OPTIONS,
  type WizardTributeTypeOption,
} from '@/modules/tribute-wizard/tributeWizardSteps'
import { applyTypeDefaults } from '@/modules/tribute-wizard/tributeTypeFlow'
import { resolveTributeTypeForWizardOption } from '@/modules/tribute-wizard/tributeCatalogResolve'
import { listTemplateDefinitions } from '@/templates/registry'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  tributeTypes?: TributeType[]
}>()

const emit = defineEmits<{ changed: [] }>()

const options = WIZARD_TRIBUTE_TYPE_OPTIONS
const catalogTypes = ref<TributeType[]>(props.tributeTypes ?? [])
const applying = ref(false)

onMounted(async () => {
  if (catalogTypes.value.length) return
  try {
    catalogTypes.value = await listTributeTypes()
  } catch {
    catalogTypes.value = []
  }
})

function resolveApiType(option: WizardTributeTypeOption): TributeType | null {
  return resolveTributeTypeForWizardOption(
    catalogTypes.value,
    option,
    listTemplateDefinitions(),
  )
}

async function select(option: WizardTributeTypeOption) {
  const apiType = resolveApiType(option)
  if (!apiType) return

  applying.value = true
  try {
    const templates = await listTemplates(apiType.id)
    const applied = await applyTypeDefaults({
      form: props.form,
      tributeId: props.tributeId,
      option,
      apiType,
      definitions: listTemplateDefinitions(),
      templates,
    })
    if (applied) emit('changed')
  } finally {
    applying.value = false
  }
}
</script>

<template>
  <div class="type-step wiz-step-content">
    <WizardStepHeader
      title="Tipo de homenagem"
      description="A escolha define sugestões de conteúdo, templates e personalizações para a sua memória."
    />

    <section class="wiz-card">
      <h3 class="wiz-card__title">Para quem é essa homenagem?</h3>
      <p class="wiz-card__hint">Selecione o tipo que melhor representa o momento.</p>

      <div class="type-grid">
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          class="type-card"
          :class="{ 'type-card--active': form.wizard_type_id === option.id }"
          @click="select(option)"
        >
          <span class="type-card__icon" aria-hidden="true">{{ option.icon }}</span>
          <strong class="type-card__label">{{ option.label }}</strong>
          <span class="type-card__desc">{{ option.description }}</span>
          <span v-if="form.wizard_type_id === option.id" class="type-card__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <p v-if="applying" class="type-step__status">
        <span class="ml-spinner ml-spinner--sm" />
        Aplicando sugestões...
      </p>
    </section>
  </div>
</template>

<style scoped>
.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 10px;
}
.type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 14px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface-3);
  transition:
    border-color var(--dur) var(--ease),
    background var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.type-card:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
}
.type-card--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.type-card__icon {
  font-size: 1.5rem;
  line-height: 1;
}
.type-card__label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.3;
}
.type-card__desc {
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.35;
}
.type-card__check {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
}
.type-step__status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.88rem;
  color: var(--muted);
}
</style>
