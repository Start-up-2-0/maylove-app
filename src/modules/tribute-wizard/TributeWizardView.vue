<template>
  <div class="wizard-view wizard-view--guided">
    <WizardHeader
      :title="headerTitle"
      :status="tribute?.status ?? 'draft'"
      :saving="saving"
      :saved-at="savedAt"
      :save-error="saveError"
    />

    <WizardStepper
      v-if="isEditable || tribute?.status !== 'published'"
      :current-step="currentStep"
      :steps="TRIBUTE_WIZARD_STEPS"
      @go="goToStep"
    />

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>

    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && tribute?.status === 'published'" class="ml-card wiz-panel">
      <h2 class="text-xl font-semibold mb-2">Homenagem publicada</h2>
      <p class="text-muted mb-5">Esta homenagem já está no ar e não pode ser editada.</p>
      <div class="flex flex-wrap gap-3">
        <a :href="`/h/${tribute.slug}`" target="_blank" class="ml-btn ml-btn--primary">
          Abrir página pública
        </a>
        <RouterLink :to="`/dashboard/tributes/${tributeId}`" class="ml-btn ml-btn--secondary">
          Ver analytics
        </RouterLink>
      </div>
    </div>

    <div
      v-else
      class="wizard-body wizard-body--guided"
      :class="{ 'wizard-body--review': currentStep === 'review' || currentStep === 'publish' }"
    >
      <div class="wizard-split">
        <div class="wizard-split__form">
          <div class="ml-card wiz-panel">
            <p v-if="stepDescription" class="wiz-step-desc">{{ stepDescription }}</p>

            <Transition name="wiz-step" mode="out-in">
              <div :key="currentStep" class="wiz-step-panel">
                <TypeStep
                  v-if="currentStep === 'type'"
                  :form="form"
                  :tribute-id="tributeId"
                  @changed="onTributeChanged"
                />
                <BasicsStep
                  v-else-if="currentStep === 'basics'"
                  :form="form"
                  :tribute-id="tributeId"
                  :photos="photos"
                  :definition="definition"
                  @media-changed="onMediaChanged"
                />
                <SpecialDateStep v-else-if="currentStep === 'special-date'" :form="form" />
                <StoryStep
                  v-else-if="currentStep === 'story'"
                  :form="form"
                  :photos="photos"
                />
                <PersonalizationStep
                  v-else-if="currentStep === 'personalization'"
                  :form="form"
                  :definition="definition"
                />
                <ModulesStep v-else-if="currentStep === 'modules'" :form="form" />
                <ReviewStep
                  v-else-if="currentStep === 'review'"
                  :tribute-id="tributeId"
                  :form="form"
                  :tribute="tribute"
                  :refresh-token="previewRefreshToken"
                  @go-publish="goToStep('publish')"
                  @edit="goToStep"
                />
                <PublishStep
                  v-else-if="currentStep === 'publish'"
                  :tribute-id="tributeId"
                  :tribute="tribute"
                  @published="onPublished"
                />
              </div>
            </Transition>

            <p v-if="stepError" class="wiz-step-error ml-alert ml-alert--danger">{{ stepError }}</p>
          </div>
        </div>

        <aside
          v-if="showSidePreview"
          class="wizard-split__preview"
          aria-label="Prévia ao vivo"
        >
          <div class="wiz-preview-card">
            <div class="wiz-preview-card__bar">
              <span class="wiz-preview-card__dot" />
              Veja como ficará
            </div>
            <TributeLivePreview
              :tribute-id="tributeId"
              :form="form"
              :tribute="tribute"
              :refresh-token="previewRefreshToken"
              compact
            />
          </div>
        </aside>
      </div>
    </div>

    <WizardFooter
      v-if="isEditable"
      :has-previous="hasPrevious"
      :has-next="hasNext"
      :loading="navigating"
      :show-preview-button="!isDesktop && showSidePreview"
      @previous="previousStep"
      @next="nextStep"
      @preview="openPreviewModal"
    />

    <Teleport to="body">
      <div v-if="previewModalOpen" class="wiz-preview-modal" @click.self="closePreviewModal">
        <div class="wiz-preview-modal__sheet">
          <header class="wiz-preview-modal__head">
            <strong>Prévia da homenagem</strong>
            <button type="button" class="ml-icon-btn" @click="closePreviewModal">×</button>
          </header>
          <TributeLivePreview
            :tribute-id="tributeId"
            :form="form"
            :tribute="tribute"
            :refresh-token="previewRefreshToken"
            compact
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useTributeWizard } from '@/composables/useTributeWizard'
import {
  nextWizardStep,
  previousWizardStep,
  validateWizardStep,
} from '@/composables/useTributeWizardValidation'
import { useWizardLayout } from '@/composables/useWizardLayout'
import type { WizardStep } from '@/api/types'
import { getTemplateDefinition } from '@/templates/registry'
import {
  TRIBUTE_WIZARD_STEPS,
  TRIBUTE_WIZARD_STEP_DESCRIPTIONS,
  resolveWizardStep,
  stepIndex,
} from '@/modules/tribute-wizard/tributeWizardSteps'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardStepper from '@/components/wizard/WizardStepper.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'
import TypeStep from './steps/TypeStep.vue'
import BasicsStep from './steps/BasicsStep.vue'
import SpecialDateStep from './steps/SpecialDateStep.vue'
import StoryStep from './steps/StoryStep.vue'
import PersonalizationStep from './steps/PersonalizationStep.vue'
import ModulesStep from './steps/ModulesStep.vue'
import ReviewStep from './steps/ReviewStep.vue'
import PublishStep from './steps/PublishStep.vue'

const route = useRoute()
const router = useRouter()
const tributeId = route.params.id as string

const currentStep = ref<WizardStep>('type')
const previewRefreshToken = ref(0)
const navigating = ref(false)
const stepError = ref('')

const {
  tribute,
  form,
  loading,
  error,
  saving,
  savedAt,
  saveError,
  isEditable,
  photos,
  load,
  reload,
} = useTributeWizard(tributeId)

const { isDesktop, previewModalOpen, openPreviewModal, closePreviewModal } = useWizardLayout()

const definition = computed(() => getTemplateDefinition(tribute.value?.template.slug))

const headerTitle = computed(
  () => form.title || form.honoree_name || tribute.value?.title || 'Criar homenagem',
)

const stepDescription = computed(() => TRIBUTE_WIZARD_STEP_DESCRIPTIONS[currentStep.value])

const showSidePreview = computed(
  () => currentStep.value !== 'review' && currentStep.value !== 'publish',
)

const hasPrevious = computed(() => stepIndex(currentStep.value) > 0)
const hasNext = computed(() => stepIndex(currentStep.value) < TRIBUTE_WIZARD_STEPS.length - 1)

onMounted(async () => {
  await load()
  currentStep.value = resolveWizardStep(
    typeof route.query.step === 'string' ? route.query.step : null,
  )
})

watch(currentStep, (step) => {
  stepError.value = ''
  void router.replace({ query: { ...route.query, step } })
  if (step === 'review') {
    void refreshPreview()
  }
})

function goToStep(step: WizardStep) {
  currentStep.value = step
}

function previousStep() {
  const prev = previousWizardStep(currentStep.value)
  if (prev) currentStep.value = prev
}

async function nextStep() {
  stepError.value = ''
  const result = validateWizardStep(currentStep.value, form, photos.value.length)
  if (!result.valid) {
    stepError.value = result.message ?? 'Revise os campos antes de continuar.'
    return
  }

  navigating.value = true
  try {
    const next = nextWizardStep(currentStep.value)
    if (next) {
      currentStep.value = next
      if (next === 'review') await refreshPreview()
    }
  } finally {
    navigating.value = false
  }
}

async function refreshPreview() {
  await reload()
  previewRefreshToken.value += 1
}

async function onMediaChanged() {
  await reload()
  previewRefreshToken.value += 1
}

async function onTributeChanged() {
  await reload()
  previewRefreshToken.value += 1
}

async function onPublished() {
  await reload()
  previewRefreshToken.value += 1
  currentStep.value = 'publish'
}
</script>

<style scoped>
.wiz-step-desc {
  font-size: 0.92rem;
  color: var(--muted);
  margin-bottom: 20px;
  line-height: 1.45;
}
.wiz-step-panel {
  min-height: 200px;
}
.wiz-step-error {
  margin-top: 16px;
}
.wiz-preview-card {
  position: sticky;
  top: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.wiz-preview-card__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  background: var(--surface-3);
}
.wiz-preview-card__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--success);
}
.wiz-preview-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 10, 16, 0.45);
  display: flex;
  align-items: flex-end;
  padding: 16px;
}
.wiz-preview-modal__sheet {
  width: 100%;
  max-height: 85vh;
  overflow: auto;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--surface);
  padding: 16px;
}
.wiz-preview-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
</style>
