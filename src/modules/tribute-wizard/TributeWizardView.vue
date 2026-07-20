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
      :steps="activeSteps"
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
      class="wizard-body"
      :class="{ 'wizard-body--review': currentStep === 'review' || currentStep === 'publish' }"
    >
      <div class="wizard-editor">
        <div
          class="ml-card wiz-panel"
          :class="{ 'wiz-panel--review': currentStep === 'review' || currentStep === 'publish' }"
        >
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
                :tribute-type-id="tribute?.tribute_type.id"
                :photos="photos"
                :definition="definition"
                @media-changed="onMediaChanged"
              />
              <SpecialDateStep v-else-if="currentStep === 'special-date'" :form="form" />
              <StoryStep v-else-if="currentStep === 'story'" :form="form" :photos="photos" />
              <PersonalizationStep
                v-else-if="currentStep === 'personalization'"
                :form="form"
                :definition="definition"
              />
              <TextsStep
                v-else-if="currentStep === 'texts'"
                :form="form"
                :definition="definition"
              />
              <ModulesStep
                v-else-if="currentStep === 'modules'"
                :form="form"
                :definition="definition"
              />
              <ReviewStep
                v-else-if="currentStep === 'review'"
                :tribute-id="tributeId"
                :form="form"
                :tribute="tribute"
                :definition="definition"
                :refresh-token="previewRefreshToken"
                :generating="previewGenerating"
                @go-publish="goToPublish"
                @edit="goToStep"
                @regenerate="refreshPreview"
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
    </div>

    <WizardFooter
      v-if="isEditable"
      :has-previous="hasPrevious"
      :has-next="hasNext"
      :loading="navigating"
      @previous="previousStep"
      @next="nextStep"
    />
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
import type { WizardStep } from '@/api/types'
import { getTemplateDefinition } from '@/templates/registry'
import {
  resolveWizardStep,
} from '@/modules/tribute-wizard/tributeWizardSteps'
import {
  getWizardSteps,
  normalizeWizardStep,
  stepIndex,
} from '@/modules/tribute-wizard/tributeTypeFlow'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardStepper from '@/components/wizard/WizardStepper.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import TypeStep from './steps/TypeStep.vue'
import BasicsStep from './steps/BasicsStep.vue'
import SpecialDateStep from './steps/SpecialDateStep.vue'
import StoryStep from './steps/StoryStep.vue'
import PersonalizationStep from './steps/PersonalizationStep.vue'
import TextsStep from './steps/TextsStep.vue'
import ModulesStep from './steps/ModulesStep.vue'
import ReviewStep from './steps/ReviewStep.vue'
import PublishStep from './steps/PublishStep.vue'

const route = useRoute()
const router = useRouter()
const tributeId = route.params.id as string

const currentStep = ref<WizardStep>('type')
const previewRefreshToken = ref(0)
const previewGenerating = ref(false)
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
  flushAutosave,
} = useTributeWizard(tributeId)

const definition = computed(() => getTemplateDefinition(tribute.value?.template.slug))

const activeSteps = computed(() => getWizardSteps(form.wizard_type_id))

const headerTitle = computed(
  () => form.title || form.honoree_name || tribute.value?.title || 'Criar homenagem',
)

const hasPrevious = computed(() => stepIndex(currentStep.value, form.wizard_type_id) > 0)
const hasNext = computed(
  () => stepIndex(currentStep.value, form.wizard_type_id) < activeSteps.value.length - 1,
)

onMounted(async () => {
  await load()
  const raw = resolveWizardStep(typeof route.query.step === 'string' ? route.query.step : null)
  currentStep.value = normalizeWizardStep(raw, form.wizard_type_id)
})

watch(
  () => form.wizard_type_id,
  (typeId) => {
    currentStep.value = normalizeWizardStep(currentStep.value, typeId)
  },
)

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
  const prev = previousWizardStep(currentStep.value, form.wizard_type_id)
  if (prev) currentStep.value = prev
}

async function nextStep() {
  stepError.value = ''
  const result = validateWizardStep(currentStep.value, form, photos.value.length, definition.value)
  if (!result.valid) {
    stepError.value = result.message ?? 'Revise os campos antes de continuar.'
    return
  }

  navigating.value = true
  try {
    if (currentStep.value === 'review') {
      await flushAutosave()
      goToStep('publish')
      return
    }
    const next = nextWizardStep(currentStep.value, form.wizard_type_id)
    if (next) {
      if (next === 'review') {
        await flushAutosave()
      }
      currentStep.value = next
      if (next === 'review') await refreshPreview()
    }
  } finally {
    navigating.value = false
  }
}

async function refreshPreview() {
  previewGenerating.value = true
  try {
    await flushAutosave()
    await reload()
    previewRefreshToken.value += 1
  } finally {
    previewGenerating.value = false
  }
}

async function goToPublish() {
  await flushAutosave()
  goToStep('publish')
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
.wiz-panel {
  padding: clamp(20px, 3vw, 28px);
}
.wiz-panel--review {
  padding: clamp(20px, 3vw, 32px);
}
.wiz-step-panel {
  min-height: 200px;
}
.wiz-step-error {
  margin-top: 16px;
}
</style>
