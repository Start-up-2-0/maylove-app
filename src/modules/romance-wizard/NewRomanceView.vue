<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { listTemplates, listTributeTypes } from '@/api/catalog'
import { createTribute, updateTribute } from '@/api/tributes'
import { resolveApiError } from '@/api/errors'
import { listTemplateDefinitions } from '@/templates/registry'
import { listStyles } from '@/templates/styles'
import {
  WIZARD_TRIBUTE_TYPE_OPTIONS,
  type WizardTributeTypeOption,
} from '@/modules/tribute-wizard/tributeWizardSteps'
import {
  pickTemplateDefinitionForType,
  resolveDefaultPresentationId,
} from '@/modules/tribute-wizard/tributeTypeFlow'
import {
  resolveCompatibleTemplate,
  resolveTributeTypeForWizardOption,
} from '@/modules/tribute-wizard/tributeCatalogResolve'
import { ROMANCE_TYPE_IDS } from '@/modules/romance-wizard/romanceWizardSteps'
import '@/modules/romance-wizard/styles/romance-wizard.css'

const router = useRouter()
const creating = ref(false)
const error = ref('')

const options = WIZARD_TRIBUTE_TYPE_OPTIONS.filter((item) =>
  ROMANCE_TYPE_IDS.includes(item.id as (typeof ROMANCE_TYPE_IDS)[number]),
)

async function startWith(option: WizardTributeTypeOption) {
  if (creating.value) return
  creating.value = true
  error.value = ''
  try {
    const definitions = listTemplateDefinitions()
    const def = pickTemplateDefinitionForType(option, definitions)
    if (!def) throw new Error('Catálogo indisponível')

    const types = await listTributeTypes()
    const type = resolveTributeTypeForWizardOption(types, option, definitions)
    if (!type) throw new Error('Catálogo indisponível')

    const templates = await listTemplates(type.id)
    const template = resolveCompatibleTemplate(templates, def)
    if (!template) throw new Error('Nenhum template compatível.')

    const tribute = await createTribute(type.id, template.id)
    const presentation = resolveDefaultPresentationId(option, def)
    const styleId = listStyles()[0]?.id ?? ''

    await updateTribute(tribute.id, {
      color_primary: def.theme.primaryColor,
      content_json: {
        presentation,
        style_id: styleId,
        wizard_category_slug: option.categorySlug,
        wizard_type_id: option.id,
        effects: def.effects?.length ? def.effects : undefined,
      },
    })

    await router.replace({
      path: `/dashboard/romances/${tribute.id}/edit`,
      query: { step: 'couple' },
    })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível iniciar o romance.')
    creating.value = false
  }
}
</script>

<template>
  <div class="romance-wizard romance-launcher">
    <div class="romance-launcher__hero">
      <p class="romance-launcher__eyebrow">MayLov Romance</p>
      <h1 class="romance-launcher__title">Crie um presente digital que emociona</h1>
      <p class="romance-launcher__sub">
        Inspirado em experiências como Love Cards e LoveTale — pronto em poucos minutos, com link e QR Code para compartilhar.
      </p>
    </div>

    <section class="romance-launcher__cards">
      <h2 class="romance-launcher__cards-title">Escolha a ocasião para começar</h2>
      <div class="romance-launcher__grid">
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          class="rom-occasion-card"
          :disabled="creating"
          @click="startWith(option)"
        >
          <span class="rom-occasion-card__icon">{{ option.icon }}</span>
          <strong class="rom-occasion-card__label">{{ option.label }}</strong>
          <span class="rom-occasion-card__desc">{{ option.description }}</span>
        </button>
      </div>
      <p v-if="creating" class="romance-launcher__status">
        <span class="ml-spinner ml-spinner--sm" />
        Preparando seu romance...
      </p>
      <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>
    </section>
  </div>
</template>
