<template>
  <div class="wizard-view">
    <WizardHeader
      :title="tribute?.title || tribute?.honoree_name || 'Editar homenagem'"
      :status="tribute?.status ?? 'draft'"
      :saving="saving"
      :saved-at="savedAt"
      :save-error="saveError"
    />

    <WizardStepper
      v-if="isEditable || tribute?.status !== 'published'"
      :current-step="currentStep"
      :steps="visibleSteps"
      @go="goToStep"
    />

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>

    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && tribute?.status === 'published'" class="ml-card wiz-panel">
      <h2 class="text-xl font-semibold mb-2">Homenagem publicada</h2>
      <p class="text-muted mb-5">
        Esta homenagem já está no ar e não pode ser editada.
      </p>
      <div class="flex flex-wrap gap-3">
        <a :href="`/h/${tribute.slug}`" target="_blank" class="ml-btn ml-btn--primary">
          Abrir página pública
        </a>
        <RouterLink :to="`/dashboard/tributes/${tributeId}`" class="ml-btn ml-btn--secondary">
          Ver analytics
        </RouterLink>
      </div>
    </div>

    <div v-else class="wizard-body" :class="{ 'wizard-body--review': currentStep === 'preview' }">
      <div class="wizard-editor">
        <div class="ml-card wiz-panel" :class="{ 'wiz-panel--review': currentStep === 'preview' }">
          <PresentationStep
            v-if="currentStep === 'presentation'"
            :form="form"
            :definition="definition"
          />
          <PhotosStep
            v-else-if="currentStep === 'photos'"
            :tribute-id="tributeId"
            :photos="photos"
            :max-photos="tribute?.template.max_photos ?? 50"
            :form="form"
            :definition="definition"
            @changed="onMediaChanged"
          />
          <MomentsStep
            v-else-if="currentStep === 'moments'"
            :tribute-id="tributeId"
            :photos="photos"
            :max-photos="tribute?.template.max_photos ?? 50"
            :form="form"
            :definition="definition"
            @changed="onMediaChanged"
          />
          <TextsStep v-else-if="currentStep === 'texts'" :form="form" :definition="definition" />
          <AppearanceStep
            v-else-if="currentStep === 'style'"
            :form="form"
            :definition="definition"
          />
          <MusicStep
            v-else-if="currentStep === 'music'"
            :form="form"
            :supports-music="tribute?.template.supports_music ?? false"
            :tribute-id="tributeId"
            @changed="onMediaChanged"
          />
          <VideoStep v-else-if="currentStep === 'video'" :form="form" />
          <EventStep v-else-if="currentStep === 'event'" :form="form" />
          <EffectsStep v-else-if="currentStep === 'effects'" :form="form" />
          <PreviewStep
            v-else-if="currentStep === 'preview'"
            :tribute-id="tributeId"
            :form="form"
            :tribute="tribute"
            :refresh-token="previewRefreshToken"
            @go-publish="goToStep('publish')"
          />
          <PublishStep
            v-else-if="currentStep === 'publish'"
            :tribute-id="tributeId"
            :tribute="tribute"
            @published="onPublished"
          />
        </div>
      </div>
    </div>

    <WizardFooter
      v-if="isEditable"
      :has-previous="hasPrevious"
      :has-next="hasNext"
      @previous="previousStep"
      @next="nextStep"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useTributeWizard } from '@/composables/useTributeWizard'
import { useWizardSchema } from '@/composables/useWizardSchema'
import type { WizardStep } from '@/api/types'
import { getTemplateDefinition } from '@/templates/registry'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardStepper from '@/components/wizard/WizardStepper.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import PresentationStep from './steps/PresentationStep.vue'
import PhotosStep from './steps/PhotosStep.vue'
import MomentsStep from './steps/MomentsStep.vue'
import TextsStep from './steps/TextsStep.vue'
import AppearanceStep from './steps/AppearanceStep.vue'
import MusicStep from './steps/MusicStep.vue'
import VideoStep from './steps/VideoStep.vue'
import EventStep from './steps/EventStep.vue'
import EffectsStep from './steps/EffectsStep.vue'
import PreviewStep from './steps/PreviewStep.vue'
import PublishStep from './steps/PublishStep.vue'

const route = useRoute()
const router = useRouter()
const tributeId = route.params.id as string

const currentStep = ref<WizardStep>('presentation')
const previewRefreshToken = ref(0)

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

const definition = computed(() => getTemplateDefinition(tribute.value?.template.slug))

const schema = useWizardSchema(() => form.presentation, () => definition.value)
const visibleSteps = computed<WizardStep[]>(() => schema.value.steps.map((step) => step.id))

onMounted(async () => {
  await load()
  const step = route.query.step
  if (typeof step === 'string' && visibleSteps.value.includes(step as WizardStep)) {
    currentStep.value = step as WizardStep
  }
})

watch(currentStep, (step) => {
  void router.replace({ query: { ...route.query, step } })
  if (step === 'preview') {
    void refreshPreview()
  }
})

watch(visibleSteps, (list) => {
  if (!list.includes(currentStep.value)) {
    currentStep.value = list[0]
  }
})

const hasPrevious = computed(() => stepIndex(currentStep.value) > 0)
const hasNext = computed(() => stepIndex(currentStep.value) < visibleSteps.value.length - 1)

function stepIndex(step: WizardStep): number {
  return visibleSteps.value.indexOf(step)
}

function goToStep(step: WizardStep) {
  currentStep.value = step
}

function previousStep() {
  const index = stepIndex(currentStep.value)
  if (index > 0) currentStep.value = visibleSteps.value[index - 1]
}

function nextStep() {
  const index = stepIndex(currentStep.value)
  if (index < visibleSteps.value.length - 1) currentStep.value = visibleSteps.value[index + 1]
}

async function refreshPreview() {
  await reload()
  previewRefreshToken.value += 1
}

async function onMediaChanged() {
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
</style>
