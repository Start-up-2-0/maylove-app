<template>
  <div class="rom-style">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">Passo 4</p>
      <h2 class="rom-step-intro__title">Personalize o visual</h2>
      <p class="rom-step-intro__desc">
        Modelo, apresentação, cor e trilha — deixe com a cara de vocês.
      </p>
    </header>

    <div class="rom-style__stack">
      <section class="rom-panel">
        <h3 class="rom-panel__title">Modelo visual *</h3>
        <div class="rom-tpl-grid">
          <button
            v-for="def in templates"
            :key="def.slug"
            type="button"
            class="rom-tpl-card"
            :class="{ 'rom-tpl-card--active': selectedSlug === def.slug }"
            :style="{ '--tpl-accent': def.theme.primaryColor }"
            @click="selectTemplate(def)"
          >
            <span class="rom-tpl-card__swatch" />
            <strong>{{ def.name }}</strong>
            <span class="rom-tpl-card__layout">{{ layoutLabel(def) }}</span>
          </button>
        </div>
      </section>

      <section class="rom-panel">
        <h3 class="rom-panel__title">Como será exibido</h3>
        <PresentationStep :form="form" :definition="definition" embedded />
      </section>

      <section class="rom-panel">
        <h3 class="rom-panel__title">Textos finais</h3>
        <TextsStep :form="form" :definition="definition" embedded />
      </section>

      <section v-if="supportsMusic" class="rom-panel">
        <h3 class="rom-panel__title">Música</h3>
        <MusicStep
          :form="form"
          :supports-music="supportsMusic"
          :tribute-id="tributeId"
          compact
          @changed="$emit('media-changed')"
        />
      </section>

      <section class="rom-panel">
        <h3 class="rom-panel__title">Cor principal</h3>
        <label class="rom-color-field">
          <input v-model="form.color_primary" type="color" class="rom-color-field__input" />
          <span class="rom-color-field__value">{{ form.color_primary }}</span>
        </label>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { listTemplates } from '@/api/catalog'
import { updateTribute } from '@/api/tributes'
import type { Template } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import PresentationStep from '@/modules/tribute-wizard/steps/PresentationStep.vue'
import TextsStep from '@/modules/tribute-wizard/steps/TextsStep.vue'
import MusicStep from '@/modules/tribute-wizard/steps/MusicStep.vue'
import { listTemplateDefinitions } from '@/templates/registry'
import { EXPERIENCE_LAYOUT_LABELS, type TemplateDefinition } from '@/templates/types'
import { presentationForLayout } from '@/templates/presentations'
import { listStyles } from '@/templates/styles'
import { syncModulesFromPresentation } from '@/utils/tributeModules'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  tributeTypeId?: string
  definition: TemplateDefinition | null | undefined
}>()

defineEmits<{ 'media-changed': [] }>()

const allDefinitions = listTemplateDefinitions()
const catalogTemplates = ref<Template[]>([])

const selectedSlug = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.slug ?? props.definition?.slug ?? ''
})

const templates = computed(() => {
  const slugs = new Set(catalogTemplates.value.map((item) => item.slug))
  let defs = slugs.size
    ? allDefinitions.filter((def) => slugs.has(def.slug))
    : allDefinitions.slice(0, 8)
  const current = selectedSlug.value
  if (current && !defs.some((def) => def.slug === current)) {
    const match = allDefinitions.find((def) => def.slug === current)
    if (match) defs = [match, ...defs]
  }
  return defs
})

const supportsMusic = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.supports_music ?? true
})

function layoutLabel(def: TemplateDefinition) {
  return EXPERIENCE_LAYOUT_LABELS[def.layout ?? 'scroll'] ?? def.layout ?? 'Scroll'
}

async function loadCatalogTemplates() {
  try {
    catalogTemplates.value = await listTemplates(props.tributeTypeId || undefined)
  } catch {
    catalogTemplates.value = []
  }
}

onMounted(loadCatalogTemplates)
watch(() => props.tributeTypeId, loadCatalogTemplates)

async function selectTemplate(def: TemplateDefinition) {
  const tpl = catalogTemplates.value.find((item) => item.slug === def.slug)
  if (!tpl) return
  props.form.template_id = tpl.id
  props.form.color_primary = def.theme.primaryColor
  if (!props.form.style_id) props.form.style_id = listStyles()[0]?.id ?? ''
  const pres = presentationForLayout(def.layout)
  if (pres && !props.form.presentation) {
    props.form.presentation = pres.id
    syncModulesFromPresentation(props.form.modules, pres.id, def)
  }
  await updateTribute(props.tributeId, {
    template_id: tpl.id,
    color_primary: def.theme.primaryColor,
    content_json: {
      presentation: props.form.presentation || pres?.id || null,
      style_id: props.form.style_id || null,
    },
  })
}
</script>

<style scoped>
.rom-style__stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.rom-tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.rom-tpl-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  text-align: left;
  border-radius: 16px;
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.rom-tpl-card:hover {
  transform: translateY(-2px);
  border-color: var(--tpl-accent, var(--rom-accent));
}
.rom-tpl-card--active {
  border-color: var(--tpl-accent, var(--rom-accent));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--tpl-accent, var(--rom-accent)) 22%, transparent);
}
.rom-tpl-card__swatch {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--tpl-accent, var(--rom-accent)),
    color-mix(in srgb, var(--tpl-accent, var(--rom-accent)) 55%, #fff)
  );
}
.rom-tpl-card__layout {
  font-size: 0.76rem;
  color: var(--muted);
}
.rom-color-field {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.rom-color-field__input {
  width: 52px;
  height: 52px;
  padding: 0;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  background: transparent;
}
.rom-color-field__value {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--muted);
}
</style>
