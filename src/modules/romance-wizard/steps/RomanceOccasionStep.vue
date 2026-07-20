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
import { ROMANCE_TYPE_IDS } from '@/modules/romance-wizard/romanceWizardSteps'
import { listTemplateDefinitions } from '@/templates/registry'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
}>()

const emit = defineEmits<{ changed: [] }>()

const options = WIZARD_TRIBUTE_TYPE_OPTIONS.filter((item) =>
  ROMANCE_TYPE_IDS.includes(item.id as (typeof ROMANCE_TYPE_IDS)[number]),
)

const catalogTypes = ref<TributeType[]>([])
const applying = ref(false)

onMounted(async () => {
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
  <div class="rom-occasion">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">Passo 1</p>
      <h2 class="rom-step-intro__title">Qual é a ocasião?</h2>
      <p class="rom-step-intro__desc">
        Como no Love Cards e LoveTale — escolha o momento e nós preparamos o resto para você.
      </p>
    </header>

    <div class="rom-occasion__grid">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="rom-occasion-card"
        :class="{ 'rom-occasion-card--active': form.wizard_type_id === option.id }"
        @click="select(option)"
      >
        <span class="rom-occasion-card__glow" aria-hidden="true" />
        <span class="rom-occasion-card__icon">{{ option.icon }}</span>
        <strong class="rom-occasion-card__label">{{ option.label }}</strong>
        <span class="rom-occasion-card__desc">{{ option.description }}</span>
      </button>
    </div>

    <p v-if="applying" class="rom-occasion__status">
      <span class="ml-spinner ml-spinner--sm" />
      Preparando sugestões românticas...
    </p>
  </div>
</template>
