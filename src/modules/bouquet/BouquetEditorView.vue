<template>
  <div class="wizard-view">
    <WizardHeader
      :title="bouquet?.title || 'Monte seu buquê'"
      subtitle="Buquê digital"
      :status="bouquet?.status ?? 'draft'"
      :saving="saving"
      :saved-at="savedAt"
      :save-error="saveError"
      back-href="/dashboard/bouquets"
      back-label="Meus buquês"
    />

    <BouquetWizardStepper
      v-if="isEditable || bouquet?.status !== 'published'"
      :current-step="currentStep"
      @go="goToStep"
    />

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>

    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && bouquet?.status === 'published'" class="ml-card wiz-panel">
      <h2 class="text-xl font-semibold mb-2">Buquê publicado</h2>
      <p class="text-muted mb-5">Este buquê já está no ar e não pode ser editado.</p>
      <a :href="`/bouquet/${bouquet.slug}`" target="_blank" class="ml-btn ml-btn--primary">
        Abrir página pública
      </a>
    </div>

    <div v-else class="wizard-body wizard-body--split">
      <div class="wizard-editor">
        <div class="ml-card wiz-panel">
          <BouquetStemsStep
            v-if="currentStep === 'stems'"
            :stems="form.stems"
            :wrap-color="form.wrap_color"
            @add="addStem"
            @remove="removeStem"
            @update:wrap-color="form.wrap_color = $event"
          />

          <BouquetLetterStep
            v-else
            :bouquet-id="bouquetId"
            :bouquet="bouquet"
            v-model:recipient-name="form.recipient_name"
            v-model:sender-name="form.sender_name"
            v-model:letter-body="form.letter_body"
            v-model:letter-design="form.letter_design"
            :flush-autosave="flushAutosave"
            @published="onPublished"
          />
        </div>
      </div>

      <aside class="bouquet-preview-panel">
        <p class="bouquet-preview-panel__label">Prévia ao vivo</p>
        <BouquetLivePreview
          :stems="form.stems"
          :wrap-color="form.wrap_color"
          :recipient-name="form.recipient_name"
          :sender-name="form.sender_name"
          :letter-body="form.letter_body"
          :letter-design="form.letter_design"
          :show-letter="currentStep === 'letter'"
          embedded
          preview-size="sm"
        />
      </aside>
    </div>

    <WizardFooter
      v-if="isEditable && currentStep === 'stems'"
      :has-previous="false"
      :has-next="true"
      @next="goToStep('letter')"
    />

    <WizardFooter
      v-if="isEditable && currentStep === 'letter' && bouquet?.status !== 'published'"
      :has-previous="true"
      :has-next="false"
      @previous="goToStep('stems')"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBouquetWizard } from '@/composables/useBouquetWizard'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import BouquetWizardStepper from './BouquetWizardStepper.vue'
import BouquetStemsStep from './components/BouquetStemsStep.vue'
import BouquetLetterStep from './components/BouquetLetterStep.vue'
import BouquetLivePreview from './components/BouquetLivePreview.vue'
import type { BouquetWizardStep } from './bouquetWizardSteps'

const route = useRoute()
const bouquetId = route.params.id as string
const currentStep = ref<BouquetWizardStep>('stems')

const {
  bouquet,
  form,
  loading,
  error,
  saving,
  savedAt,
  saveError,
  flushAutosave,
  isEditable,
  load,
  addStem,
  removeStem,
} = useBouquetWizard(bouquetId)

onMounted(load)

function goToStep(step: BouquetWizardStep) {
  currentStep.value = step
}

async function onPublished() {
  await load()
}
</script>

<style scoped>
.wiz-panel {
  padding: clamp(20px, 3vw, 28px);
}

.wizard-body--split {
  display: grid;
  gap: clamp(24px, 3vw, 40px);
  align-items: start;
  width: 100%;
}

.wizard-body--split .wizard-editor {
  max-width: none;
  margin-inline: 0;
  min-width: 0;
}

.wizard-body--split :deep(.wiz-step-content) {
  max-width: none;
}

@media (min-width: 1024px) {
  .wizard-body--split {
    grid-template-columns: minmax(420px, 1fr) minmax(260px, 340px);
  }
}

@media (min-width: 1440px) {
  .wizard-body--split {
    grid-template-columns: minmax(520px, 1fr) minmax(280px, 360px);
  }
}

.bouquet-preview-panel {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: clamp(16px, 2vw, 24px);
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, var(--primary) 12%, var(--border));
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 35%, var(--surface));
  box-shadow: 0 24px 56px -40px color-mix(in srgb, var(--primary) 28%, transparent);
}

.bouquet-preview-panel__label {
  margin: 0 0 14px;
  width: 100%;
  text-align: center;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--primary) 55%, var(--muted));
}

@media (max-width: 1023px) {
  .wizard-body--split {
    grid-template-columns: 1fr;
  }

  .bouquet-preview-panel {
    position: static;
    order: -1;
  }
}
</style>
