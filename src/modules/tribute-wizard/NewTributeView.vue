<template>
  <div class="new-launcher">
    <span class="ml-spinner" />
    <p>Preparando sua homenagem...</p>
    <p v-if="error" class="new-launcher__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listTemplates, listTributeTypes } from '@/api/catalog'
import { createTribute } from '@/api/tributes'
import { resolveApiError } from '@/api/errors'
import { listTemplateDefinitions } from '@/templates/registry'
import { WIZARD_TRIBUTE_TYPE_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import { presentationForLayout } from '@/templates/presentations'
import { listStyles } from '@/templates/styles'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  try {
    const [types, templates] = await Promise.all([listTributeTypes(), listTemplates()])
    const defaultOption = WIZARD_TRIBUTE_TYPE_OPTIONS[0]
    const definitions = listTemplateDefinitions()
    const categoryDefs = definitions.filter((def) => def.category === defaultOption.categorySlug)
    const def = categoryDefs[0] ?? definitions[0]
    if (!def) throw new Error('Catálogo indisponível')

    const template = templates.find((item) => item.slug === def.slug) ?? templates[0]
    const type =
      types.find((item) => defaultOption.typeSlugs.includes(item.slug)) ?? types[0]
    if (!template || !type) throw new Error('Catálogo indisponível')

    const tribute = await createTribute(type.id, template.id)
    const presentation = presentationForLayout(def.layout)?.id ?? 'scroll-classic'
    const styleId = listStyles()[0]?.id ?? ''

    const { updateTribute } = await import('@/api/tributes')
    await updateTribute(tribute.id, {
      content_json: {
        presentation,
        style_id: styleId,
        wizard_category_slug: defaultOption.categorySlug,
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
