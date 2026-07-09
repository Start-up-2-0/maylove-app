<template>
  <div class="preview-step">
    <WizardStepHeader
      title="Revisar e Concluir"
      description="Confira como a homenagem ficará para quem receber o link. Se precisar ajustar algo, volte às etapas anteriores."
    />

    <div class="review-summary">
      <div class="review-summary__item">
        <span class="review-summary__label">Apresentação</span>
        <span class="review-summary__value">{{ presentationLabel }}</span>
      </div>
      <div class="review-summary__item">
        <span class="review-summary__label">Fotos</span>
        <span class="review-summary__value">{{ photoCount }}</span>
      </div>
      <div class="review-summary__item">
        <span class="review-summary__label">Música</span>
        <span class="review-summary__value">{{ musicLabel }}</span>
      </div>
    </div>

    <section class="review-preview">
      <h3 class="review-preview__title">
        <span class="review-preview__dot" />
        Prévia da homenagem
      </h3>
      <TributeLivePreview
        :tribute-id="tributeId"
        :form="form"
        :tribute="tribute"
        :refresh-token="refreshToken"
        faithful
      />
    </section>

    <div class="review-actions">
      <button class="ml-btn ml-btn--primary ml-btn--lg" @click="$emit('go-publish')">
        Tudo certo — ir para publicar
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeDetail } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { getPresentation } from '@/templates/presentations'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'

const props = defineProps<{
  tributeId: string
  form: ReturnType<typeof useTributeWizard>['form']
  tribute: TributeDetail | null
  refreshToken: number
}>()

defineEmits<{ 'go-publish': [] }>()

const presentationLabel = computed(() => {
  const p = getPresentation(props.form.presentation)
  return p?.label ?? 'Padrão do modelo'
})

const photoCount = computed(() => (props.tribute?.media ?? []).filter((m) => m.media_type === 'photo').length)

const musicLabel = computed(() => {
  if (props.form.music_source === 'none') return 'Sem música'
  if (props.form.music_source === 'library') return 'Biblioteca'
  return 'Upload'
})
</script>

<style scoped>
.review-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}
.review-summary__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-3);
  min-width: 120px;
}
.review-summary__label {
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.review-summary__value {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
}

.review-preview {
  margin-bottom: 24px;
}
.review-preview__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 14px;
}
.review-preview__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--success);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 22%, transparent);
}

.review-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
