<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Informações principais"
      description="Dê um nome e uma mensagem de coração à sua homenagem. Quem receber sentirá logo o carinho que você guarda."
    />

    <section class="bs-section">
      <h3 class="bs-section__title">Identidade</h3>
      <div class="bs-grid">
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

    <section class="bs-section">
      <h3 class="bs-section__title">Modelo visual *</h3>
      <p class="bs-section__hint">Escolha o estilo que mais combina com a ocasião.</p>
      <div class="tpl-grid">
        <button
          v-for="def in templates"
          :key="def.slug"
          type="button"
          class="tpl-card"
          :class="{ 'tpl-card--active': selectedSlug === def.slug }"
          :style="tplVars(def)"
          @click="selectTemplate(def)"
        >
          <span class="tpl-card__swatch" aria-hidden="true" />
          <strong class="tpl-card__name">{{ def.name }}</strong>
          <span class="tpl-card__flow">{{ layoutLabel(def) }}</span>
        </button>
      </div>
    </section>

    <section class="bs-section">
      <h3 class="bs-section__title">Foto de capa *</h3>
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

    <section class="bs-section">
      <h3 class="bs-section__title">Mensagem inicial *</h3>
      <label class="ml-field">
        <span class="ml-label">Que palavras você quer que abram essa homenagem?</span>
        <textarea
          v-model="form.message"
          class="ml-input ml-textarea"
          rows="5"
          maxlength="2048"
          placeholder="Escreva com o coração..."
        />
        <span class="ml-hint">{{ (form.message ?? '').length }}/2048</span>
      </label>
    </section>

    <section v-if="supportsMusic" class="bs-section">
      <h3 class="bs-section__title">Música principal</h3>
      <MusicStep
        :form="form"
        :supports-music="supportsMusic"
        :tribute-id="tributeId"
        compact
        @changed="$emit('media-changed')"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listTemplates } from '@/api/catalog'
import { updateTribute } from '@/api/tributes'
import type { Template, TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { listTemplateDefinitions } from '@/templates/registry'
import { EXPERIENCE_LAYOUT_LABELS, type TemplateDefinition } from '@/templates/types'
import { presentationForLayout } from '@/templates/presentations'
import { listStyles } from '@/templates/styles'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import PhotosStep from './PhotosStep.vue'
import MusicStep from './MusicStep.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  photos: TributeMedia[]
  definition: TemplateDefinition | null | undefined
}>()

defineEmits<{ 'media-changed': [] }>()

const allDefinitions = listTemplateDefinitions()
const catalogTemplates = ref<Template[]>([])

const categorySlug = computed(() => props.form.wizard_category_slug)

const templates = computed(() => {
  if (!categorySlug.value) return allDefinitions.slice(0, 8)
  const filtered = allDefinitions.filter((def) => def.category === categorySlug.value)
  return filtered.length ? filtered : allDefinitions.slice(0, 8)
})

const selectedSlug = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.slug ?? props.definition?.slug ?? ''
})

const maxPhotos = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.max_photos ?? 50
})

const supportsMusic = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.supports_music ?? true
})

onMounted(async () => {
  try {
    catalogTemplates.value = await listTemplates()
  } catch {
    catalogTemplates.value = []
  }
})

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
    props.form.presentation = presentationForLayout(def.layout)?.id ?? 'scroll-classic'
  }
  if (!props.form.style_id) {
    props.form.style_id = listStyles()[0]?.id ?? ''
  }
  props.form.color_primary = def.theme.primaryColor

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
.bs-section {
  margin-bottom: 28px;
}
.bs-section__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
}
.bs-section__hint {
  font-size: 0.86rem;
  color: var(--muted);
  margin-bottom: 12px;
}
.bs-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.span-2 {
  grid-column: span 2;
}
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.tpl-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.tpl-card--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.tpl-card__swatch {
  width: 100%;
  height: 36px;
  border-radius: 8px;
  background: var(--tpl-c1, var(--primary));
}
.tpl-card__name {
  font-size: 0.88rem;
  font-weight: 600;
}
.tpl-card__flow {
  font-size: 0.74rem;
  color: var(--muted);
}
@media (max-width: 640px) {
  .bs-grid {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: span 1;
  }
}
</style>
