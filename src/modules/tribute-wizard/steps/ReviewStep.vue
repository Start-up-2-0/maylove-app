<template>
  <div class="review-step">
    <WizardStepHeader
      title="Revisão"
      description="Confira o resumo e veja como a homenagem ficará antes de publicar."
    />

    <div class="wiz-card-stack">
      <section class="wiz-card">
        <h3 class="wiz-card__title">Resumo</h3>
        <p class="wiz-card__hint">Clique em uma seção para editar.</p>

        <div class="rv-summary">
      <button
        v-for="item in summaryItems"
        :key="item.step"
        type="button"
        class="rv-item"
        @click="$emit('edit', item.step)"
      >
        <span class="rv-item__label">{{ item.label }}</span>
        <span class="rv-item__value">{{ item.value }}</span>
        <span class="rv-item__edit">Editar →</span>
      </button>
        </div>
      </section>

      <section v-if="previewHints.length" class="wiz-card rv-hints" aria-label="Como a prévia funciona">
        <h3 class="wiz-card__title">Como sua homenagem será exibida</h3>
        <ul class="rv-hints__list">
          <li v-for="(hint, index) in previewHints" :key="index">{{ hint }}</li>
        </ul>
      </section>

      <section class="wiz-card rv-preview">
        <div class="rv-preview__head">
          <h3 class="rv-preview__title">
            <span class="rv-preview__dot" />
            Prévia da homenagem
          </h3>
          <button
            type="button"
            class="ml-btn ml-btn--secondary ml-btn--sm"
            :disabled="generating"
            @click="$emit('regenerate')"
          >
            {{ generating ? 'Gerando…' : 'Atualizar prévia' }}
          </button>
        </div>

        <section v-if="generating" class="preview-loading" aria-live="polite">
          <span class="ml-spinner" />
          <p>Gerando prévia da homenagem…</p>
        </section>

        <TributeLivePreview
          v-else
          :tribute-id="tributeId"
          :form="form"
          :tribute="tribute"
          :refresh-token="refreshToken"
          faithful
        />
      </section>

      <div class="rv-actions">
      <button type="button" class="ml-btn ml-btn--primary ml-btn--lg" @click="$emit('go-publish')">
        Tudo certo — ir para publicar
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeDetail, WizardStep } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import {
  TRIBUTE_ADDON_MODULE_OPTIONS,
  TRIBUTE_WIZARD_STEP_LABELS,
  WIZARD_TRIBUTE_TYPE_OPTIONS,
} from '@/modules/tribute-wizard/tributeWizardSteps'
import { getWizardSteps } from '@/modules/tribute-wizard/tributeTypeFlow'
import { describeDerivedModules } from '@/utils/tributeModules'
import { summarizeEventInfo } from '@/utils/eventInfo'
import { buildReviewPreviewHints } from '@/modules/tribute-wizard/previewHints'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'

const props = defineProps<{
  tributeId: string
  form: ReturnType<typeof useTributeWizard>['form']
  tribute: TributeDetail | null
  definition?: TemplateDefinition | null
  refreshToken: number
  generating?: boolean
}>()

defineEmits<{ 'go-publish': []; edit: [step: WizardStep]; regenerate: [] }>()

const typeLabel = computed(() => {
  const option = WIZARD_TRIBUTE_TYPE_OPTIONS.find((item) => item.id === props.form.wizard_type_id)
  return option?.label ?? props.tribute?.tribute_type.name ?? '—'
})

const activeModules = computed(() => {
  const derived = describeDerivedModules(props.form.presentation, props.definition)
  const addons = TRIBUTE_ADDON_MODULE_OPTIONS.filter((mod) => props.form.modules[mod.id]).map(
    (mod) => mod.label,
  )
  return [...derived, ...addons].join(', ') || 'Padrão do modelo'
})

const textsSummary = computed(() => {
  const parts: string[] = []
  if (props.form.title?.trim()) parts.push(props.form.title.trim())
  if (props.form.subtitle?.trim()) parts.push(props.form.subtitle.trim())
  if (props.form.signature?.trim() || props.form.sender_name?.trim()) {
    parts.push(props.form.signature?.trim() || props.form.sender_name?.trim() || '')
  }
  return parts.join(' · ') || '—'
})

const photoCount = computed(
  () => (props.tribute?.media ?? []).filter((m) => m.media_type === 'photo').length,
)

const specialDateSummary = computed(() => {
  const parts: string[] = []
  if (props.form.special_date_config.enabled) {
    parts.push(props.form.special_date_config.title || 'Data especial configurada')
  }
  const eventSummary = summarizeEventInfo(props.form.event_info)
  if (eventSummary) parts.push(eventSummary)
  return parts.join(' · ') || 'Não incluída'
})

const basicsSummary = computed(() => {
  const parts = [props.form.honoree_name || props.form.title || ''].filter(Boolean)
  if (props.form.video_url?.trim()) parts.push('Com vídeo')
  return parts.join(' · ') || '—'
})

const previewHints = computed(() =>
  buildReviewPreviewHints(props.form, props.definition?.layout),
)

const summaryItems = computed(() => {
  const activeSteps = new Set(getWizardSteps(props.form.wizard_type_id))
  const items = [
    {
      step: 'type' as WizardStep,
      label: TRIBUTE_WIZARD_STEP_LABELS.type,
      value: typeLabel.value,
    },
    {
      step: 'basics' as WizardStep,
      label: 'Informações',
      value: basicsSummary.value,
    },
    {
      step: 'special-date' as WizardStep,
      label: 'Data especial',
      value: specialDateSummary.value,
    },
    {
      step: 'story' as WizardStep,
      label: 'História',
      value: `${props.form.timeline.length} momento(s) · ${photoCount.value} foto(s)`,
    },
    {
      step: 'personalization' as WizardStep,
      label: 'Personalização',
      value: props.form.style_id ? 'Estilo personalizado' : 'Padrão do modelo',
    },
    {
      step: 'texts' as WizardStep,
      label: TRIBUTE_WIZARD_STEP_LABELS.texts,
      value: textsSummary.value,
    },
    {
      step: 'modules' as WizardStep,
      label: 'Recursos',
      value: activeModules.value,
    },
  ]
  return items.filter((item) => activeSteps.has(item.step))
})
</script>

<style scoped>
.rv-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}
.rv-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-3);
  transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.rv-item:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}
.rv-item__label {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.rv-item__value {
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--ink);
}
.rv-item__edit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary-strong);
  margin-top: 4px;
}
.rv-preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  color: var(--muted);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border);
  background: var(--surface-3);
}
.rv-preview__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}
.rv-preview__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--success);
}
.rv-actions {
  margin-top: 0;
}
.rv-hints__list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.45;
}
</style>
