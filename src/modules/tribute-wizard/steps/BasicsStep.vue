<template>
  <div class="basics-step wiz-step-content">
    <WizardStepHeader
      title="Informações principais"
      description="Dê um nome e uma mensagem de coração à sua homenagem. Quem receber sentirá logo o carinho que você guarda."
    />

    <div class="wiz-card-stack">
      <section class="wiz-card">
        <h3 class="wiz-card__title">Identidade</h3>
        <p class="wiz-card__hint">Como essa homenagem será identificada.</p>
        <div class="wiz-field-grid">
          <label class="ml-field span-2">
            <span class="ml-label">Nome da homenagem</span>
            <input
              v-model="form.title"
              class="ml-input"
              maxlength="120"
              placeholder="Ex.: Para o amor da minha vida"
            />
          </label>
          <label class="ml-field span-2">
            <span class="ml-label">Pessoa homenageada *</span>
            <input
              v-model="form.honoree_name"
              class="ml-input"
              maxlength="120"
              placeholder="Para quem é essa homenagem?"
              required
            />
          </label>
        </div>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Modelo visual *</h3>
        <p class="wiz-card__hint">Escolha o estilo que mais combina com a ocasião.</p>
        <div class="tpl-grid">
          <button
            v-for="def in templates"
            :key="def.slug"
            type="button"
            class="tpl-card"
            :class="{
              'tpl-card--active': selectedSlug === def.slug,
              'tpl-card--recommended': recommendedSlug === def.slug && selectedSlug !== def.slug,
            }"
            :style="tplVars(def)"
            @click="selectTemplate(def)"
          >
            <span class="tpl-card__swatch" aria-hidden="true" />
            <strong class="tpl-card__name">
              {{ def.name }}
              <span v-if="recommendedSlug === def.slug" class="tpl-card__badge">Sugerido</span>
            </strong>
            <span class="tpl-card__flow">{{ layoutLabel(def) }}</span>
          </button>
        </div>
      </section>

      <section class="wiz-card">
        <h3 class="wiz-card__title">Foto de capa *</h3>
        <p class="wiz-card__hint">A imagem principal que abre a homenagem.</p>
        <PhotosStep
          :tribute-id="tributeId"
          :photos="photos"
          :max-photos="maxPhotos"
          :form="form"
          :definition="definition"
          compact
          @changed="$emit('media-changed')"
        />
      </section>

      <section v-if="supportsMusic" class="wiz-card">
        <h3 class="wiz-card__title">Música principal</h3>
        <p class="wiz-card__hint">Opcional — trilha sonora da homenagem.</p>
        <MusicStep
          :form="form"
          :supports-music="supportsMusic"
          :tribute-id="tributeId"
          compact
          @changed="$emit('media-changed')"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { listTemplates } from '@/api/catalog'
import { updateTribute } from '@/api/tributes'
import type { Template, TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { getWizardTypeFlowConfig, resolveDefaultPresentationId } from '@/modules/tribute-wizard/tributeTypeFlow'
import { WIZARD_TRIBUTE_TYPE_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import { listTemplateDefinitions } from '@/templates/registry'
import { EXPERIENCE_LAYOUT_LABELS, type TemplateDefinition } from '@/templates/types'
import { presentationForLayout } from '@/templates/presentations'
import { listStyles } from '@/templates/styles'
import { syncModulesFromPresentation } from '@/utils/tributeModules'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import PhotosStep from './PhotosStep.vue'
import MusicStep from './MusicStep.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  tributeTypeId?: string
  photos: TributeMedia[]
  definition: TemplateDefinition | null | undefined
}>()

defineEmits<{ 'media-changed': [] }>()

const allDefinitions = listTemplateDefinitions()
const catalogTemplates = ref<Template[]>([])

const categorySlug = computed(() => props.form.wizard_category_slug)

const recommendedSlug = computed(
  () => getWizardTypeFlowConfig(props.form.wizard_type_id).defaultTemplateSlug ?? '',
)

const compatibleSlugs = computed(
  () => new Set(catalogTemplates.value.map((item) => item.slug)),
)

const selectedSlug = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.slug ?? props.definition?.slug ?? ''
})

const templates = computed(() => {
  let defs = allDefinitions

  if (categorySlug.value) {
    const byCategory = allDefinitions.filter((def) => def.category === categorySlug.value)
    if (byCategory.length) defs = byCategory
  }

  if (compatibleSlugs.value.size > 0) {
    defs = defs.filter((def) => compatibleSlugs.value.has(def.slug))
  }

  const currentSlug = selectedSlug.value
  if (currentSlug && !defs.some((def) => def.slug === currentSlug)) {
    const current = allDefinitions.find((def) => def.slug === currentSlug)
    if (current) defs = [current, ...defs]
  }

  if (defs.length) return defs
  if (compatibleSlugs.value.size > 0) {
    return allDefinitions.filter((def) => compatibleSlugs.value.has(def.slug))
  }
  return allDefinitions.slice(0, 8)
})

const maxPhotos = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.max_photos ?? 50
})

const supportsMusic = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.supports_music ?? true
})

async function loadCatalogTemplates() {
  try {
    catalogTemplates.value = await listTemplates(props.tributeTypeId || undefined)
  } catch {
    catalogTemplates.value = []
  }
}

onMounted(loadCatalogTemplates)

watch(() => props.tributeTypeId, loadCatalogTemplates)

function layoutLabel(def: TemplateDefinition): string {
  return EXPERIENCE_LAYOUT_LABELS[def.layout ?? 'scroll']
}

function tplVars(def: TemplateDefinition) {
  return {
    '--tpl-c1': def.theme.primaryColor,
  } as Record<string, string>
}

async function selectTemplate(def: TemplateDefinition) {
  const catalog = catalogTemplates.value.find((item) => item.slug === def.slug)
  if (!catalog) return

  props.form.template_id = catalog.id
  if (!props.form.presentation) {
    const typeOption = WIZARD_TRIBUTE_TYPE_OPTIONS.find((item) => item.id === props.form.wizard_type_id)
    props.form.presentation = typeOption
      ? resolveDefaultPresentationId(typeOption, def)
      : presentationForLayout(def.layout)?.id ?? 'rolagem'
  }
  if (!props.form.style_id) {
    props.form.style_id = listStyles()[0]?.id ?? ''
  }
  props.form.color_primary = def.theme.primaryColor
  syncModulesFromPresentation(props.form.modules, props.form.presentation, def)

  await updateTribute(props.tributeId, {
    template_id: catalog.id,
    color_primary: def.theme.primaryColor,
    content_json: {
      presentation: props.form.presentation,
      style_id: props.form.style_id,
    },
  })
}
</script>

<style scoped>
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.tpl-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface-3);
  transition:
    border-color var(--dur) var(--ease),
    background var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}
.tpl-card:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
}
.tpl-card--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.tpl-card__swatch {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  background: var(--tpl-c1, var(--primary));
}
.tpl-card__name {
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tpl-card__badge {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--primary-softer);
  color: var(--primary-strong);
}
.tpl-card--recommended {
  border-color: color-mix(in srgb, var(--primary) 35%, var(--border-strong));
}
.tpl-card__flow {
  font-size: 0.74rem;
  color: var(--muted);
}
</style>
