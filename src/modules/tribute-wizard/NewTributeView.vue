<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listTemplates, listTributeTypes } from '@/api/catalog'
import { createTribute, updateTribute } from '@/api/tributes'
import { resolveApiError } from '@/api/errors'
import { listTemplateDefinitions } from '@/templates/registry'
import { listStyles } from '@/templates/styles'
import { WIZARD_TRIBUTE_TYPE_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import {
  pickTemplateDefinitionForType,
  resolveDefaultPresentationId,
} from '@/modules/tribute-wizard/tributeTypeFlow'
import {
  resolveCompatibleTemplate,
  resolveTributeTypeForWizardOption,
} from '@/modules/tribute-wizard/tributeCatalogResolve'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  try {
    const defaultOption = WIZARD_TRIBUTE_TYPE_OPTIONS[0]
    const definitions = listTemplateDefinitions()
    const def = pickTemplateDefinitionForType(defaultOption, definitions)
    if (!def) throw new Error('Catálogo indisponível')

    const types = await listTributeTypes()
    const type = resolveTributeTypeForWizardOption(types, defaultOption, definitions)
    if (!type) throw new Error('Catálogo indisponível')

    const templates = await listTemplates(type.id)
    const template = resolveCompatibleTemplate(templates, def)
    if (!template) throw new Error('Nenhum template compatível com este tipo.')

    const tribute = await createTribute(type.id, template.id)
    const presentation = resolveDefaultPresentationId(defaultOption, def)
    const styleId = listStyles()[0]?.id ?? ''

    await updateTribute(tribute.id, {
      color_primary: def.theme.primaryColor,
      content_json: {
        presentation,
        style_id: styleId,
        wizard_category_slug: defaultOption.categorySlug,
        effects: def.effects?.length ? def.effects : undefined,
      },
    })

    await router.replace({
      path: `/dashboard/tributes/${tribute.id}/edit`,
      query: { step: 'type' },
    })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível iniciar a homenagem.')
  }
})
</script>

<template>
  <div class="new-launcher">
    <span class="ml-spinner" />
    <p>Preparando sua homenagem...</p>
    <p v-if="error" class="new-launcher__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.new-launcher {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 50vh;
  color: var(--muted);
}
.new-launcher__error {
  color: var(--error);
  font-size: 0.9rem;
}
</style>
