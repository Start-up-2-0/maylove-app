<template>
  <div
    class="tribute-live-preview"
    :class="{
      'tribute-live-preview--compact': compact,
      'tribute-live-preview--faithful': faithful,
    }"
  >
    <div v-if="showViewportTabs" class="viewport-seg">
      <button
        v-for="option in viewportOptions"
        :key="option.value"
        type="button"
        class="viewport-seg__btn"
        :class="{ 'viewport-seg__btn--active': activeViewport === option.value }"
        @click="activeViewport = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <section v-if="loading" class="preview-loading">
      <span class="ml-spinner" />
      Carregando preview...
    </section>

    <section v-else-if="loadError" class="text-red-600 text-sm py-4">{{ loadError }}</section>

    <div
      v-else
      class="preview-viewport-wrap"
      :class="{
        'preview-viewport-wrap--compact': compact,
        'preview-viewport-wrap--faithful': faithful,
      }"
    >
      <EnvelopeFrame flat :auto-open="false">
        <div class="preview-viewport-frame" :style="frameStyle">
          <ExperienceRenderer
            :definition="definition"
            :content="content"
            :theme="theme"
            :presentation="presentationId"
            :mode="faithful ? 'full' : 'preview'"
          />
        </div>
      </EnvelopeFrame>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fetchPreviewData } from '@/api/tributes'
import type { PublicTribute, TributeDetail } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { getTemplateDefinition } from '@/templates/registry'
import { getRomanceTheme } from '@/modules/romance-wizard/romanceThemes'
import { templateSlugForTheme } from '@/modules/romance-wizard/romanceThemeFlow'
import { resolveContent, resolveTheme } from '@/composables/useExperienceContent'
import EnvelopeFrame from './EnvelopeFrame.vue'
import ExperienceRenderer from '@/components/experience/ExperienceRenderer.vue'

const props = withDefaults(
  defineProps<{
    tributeId?: string
    form?: ReturnType<typeof useTributeWizard>['form']
    tribute?: TributeDetail | null
    publicData?: PublicTribute | null
    readonly?: boolean
    compact?: boolean
    /** Prévia fiel (como publicado) — usada na etapa Revisar e Concluir. */
    faithful?: boolean
    showViewportTabs?: boolean
    viewportWidth?: number
    refreshToken?: number
  }>(),
  {
    tributeId: undefined,
    form: undefined,
    tribute: null,
    publicData: null,
    readonly: false,
    compact: false,
    faithful: false,
    showViewportTabs: true,
    viewportWidth: 375,
    refreshToken: 0,
  },
)

const apiData = ref<TributeDetail | null>(null)
const loading = ref(false)
const loadError = ref('')
const activeViewport = ref(String(props.viewportWidth))

const viewportOptions = [
  { value: '375', label: 'Mobile' },
  { value: '768', label: 'Tablet' },
  { value: '1280', label: 'Desktop' },
]

const frameStyle = computed(() => {
  const target = props.showViewportTabs ? Number(activeViewport.value) : props.viewportWidth
  if (props.faithful) {
    return {
      width: '100%',
      maxWidth: `${target}px`,
      margin: '0 auto',
      flexShrink: '0',
    }
  }
  return {
    width: `min(${target}px, 100%)`,
    flexShrink: '0',
  }
})

const templateSlug = computed(() => {
  const theme = props.form?.romance_theme_id
    ? getRomanceTheme(props.form.romance_theme_id)
    : null
  if (theme) return templateSlugForTheme(theme)

  return (
    props.tribute?.template.slug ||
    props.publicData?.template.slug ||
    apiData.value?.template.slug ||
    null
  )
})

const definition = computed(() => getTemplateDefinition(templateSlug.value))

const accentColor = computed(
  () =>
    props.form?.color_primary ||
    props.publicData?.color_primary ||
    props.tribute?.color_primary ||
    apiData.value?.color_primary ||
    null,
)

const animationSpeed = computed(
  () =>
    (props.form?.animation_speed || undefined) ||
    props.tribute?.content_json?.animation_speed ||
    apiData.value?.content_json?.animation_speed ||
    props.publicData?.content_json?.animation_speed,
)

const styleId = computed(
  () =>
    (props.form?.style_id || undefined) ||
    props.tribute?.content_json?.style_id ||
    apiData.value?.content_json?.style_id ||
    props.publicData?.content_json?.style_id ||
    null,
)

const fontFamily = computed(
  () =>
    (props.form?.font || undefined) ||
    props.tribute?.content_json?.font ||
    apiData.value?.content_json?.font ||
    props.publicData?.content_json?.font ||
    null,
)

const backgroundId = computed(
  () =>
    (props.form?.background || undefined) ||
    props.tribute?.content_json?.background ||
    apiData.value?.content_json?.background ||
    props.publicData?.content_json?.background ||
    null,
)

const presentationId = computed(
  () =>
    (props.form?.presentation || undefined) ||
    props.tribute?.content_json?.presentation ||
    apiData.value?.content_json?.presentation ||
    props.publicData?.content_json?.presentation ||
    null,
)

const entrance = computed(
  () =>
    (props.form?.entrance || undefined) ||
    props.tribute?.content_json?.entrance ||
    apiData.value?.content_json?.entrance ||
    props.publicData?.content_json?.entrance ||
    null,
)

const theme = computed(() =>
  resolveTheme(definition.value, {
    color: accentColor.value,
    speed: animationSpeed.value,
    styleId: styleId.value,
    font: fontFamily.value,
    background: backgroundId.value,
    entrance: entrance.value,
  }),
)

const content = computed(() =>
  resolveContent(definition.value, {
    form: props.form,
    tribute: props.tribute ?? apiData.value,
    detail: apiData.value,
    publicData: props.publicData,
  }),
)

watch(
  () => props.viewportWidth,
  (width) => {
    activeViewport.value = String(width)
  },
)

watch(
  () => [props.tributeId, props.refreshToken] as const,
  () => {
    if (props.tributeId && !props.readonly) {
      void loadPreviewData()
    }
  },
)

onMounted(() => {
  if (props.tributeId && !props.readonly) {
    void loadPreviewData()
  }
})

async function loadPreviewData() {
  if (!props.tributeId) return
  loading.value = true
  loadError.value = ''
  try {
    apiData.value = await fetchPreviewData(props.tributeId)
  } catch {
    loadError.value = 'Não foi possível carregar o preview.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.viewport-seg {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  margin-bottom: 16px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  border: 1px solid var(--border);
}
.viewport-seg__btn {
  border: none;
  background: transparent;
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--muted);
  transition:
    background var(--dur) var(--ease),
    color var(--dur) var(--ease);
}
.viewport-seg__btn:hover {
  color: var(--text);
}
.viewport-seg__btn--active {
  background: var(--surface);
  color: var(--primary-strong);
  box-shadow: var(--shadow-xs);
}
.preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 0;
  color: var(--muted);
}

.tribute-live-preview {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Área rolável: o conteúdo da homenagem fica contido sem esticar a página. */
.preview-viewport-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  max-height: min(480px, calc(100vh - 260px));
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  justify-content: center;
  padding: 10px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--surface-3);
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--primary) 50%, transparent) transparent;
}

.preview-viewport-wrap--compact {
  max-height: min(68vh, 640px);
}

.preview-viewport-wrap--faithful {
  max-height: none;
  min-height: min(75vh, 820px);
  overflow: visible;
  display: block;
  padding: 0;
  border: none;
  background: transparent;
}

.preview-viewport-wrap--faithful::after {
  display: none;
}

.tribute-live-preview--faithful .preview-viewport-frame {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

/* Dica visual de que há mais conteúdo abaixo. */
.preview-viewport-wrap::after {
  content: '';
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: block;
  height: 28px;
  margin-top: -28px;
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in srgb, var(--surface-3) 88%, transparent)
  );
  pointer-events: none;
}

.preview-viewport-wrap::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.preview-viewport-wrap::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 45%, transparent);
}

.preview-viewport-frame {
  margin: 0;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-md);
}
</style>
