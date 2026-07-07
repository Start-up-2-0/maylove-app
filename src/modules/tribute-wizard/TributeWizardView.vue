<template>
  <WizardShell :dark-theme="darkTheme">
    <template #header>
      <WizardHeader
        :title="tribute?.title || tribute?.honoree_name || 'Editar homenagem'"
        :status="tribute?.status ?? 'draft'"
        :saving="saving"
        :saved-at="savedAt"
        :save-error="saveError"
        :dark-theme="darkTheme"
        @toggle-theme="toggleDarkTheme"
      />
    </template>

    <template #stepper>
      <WizardStepper
        v-if="isEditable || tribute?.status !== 'published'"
        :current-step="currentStep"
        @go="goToStep"
      />
    </template>

    <section v-if="loading" class="text-gray-500 dark:text-gray-400 py-12 text-center">
      Carregando...
    </section>

    <section v-else-if="error" class="text-red-600 py-8">{{ error }}</section>

    <FwbCard v-else-if="!isEditable && tribute?.status === 'published'" class="p-6">
      <h2 class="text-xl font-semibold mb-2">Homenagem publicada</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        Esta homenagem já está no ar e não pode ser editada.
      </p>
      <div class="flex flex-wrap gap-3">
        <FwbButton
          :href="`/h/${tribute.slug}`"
          tag="a"
          target="_blank"
          color="pink"
        >
          Abrir página pública
        </FwbButton>
        <FwbButton
          :to="`/dashboard/tributes/${tributeId}`"
          tag="router-link"
          color="alternative"
        >
          Ver analytics
        </FwbButton>
      </div>
    </FwbCard>

    <div v-else class="wizard-split">
      <div class="wizard-editor">
        <FwbCard class="p-5 md:p-6">
          <PhotosStep
            v-if="currentStep === 'photos'"
            :tribute-id="tributeId"
            :photos="photos"
            :max-photos="tribute?.template.max_photos ?? 50"
            @changed="onMediaChanged"
          />
          <TextsStep v-else-if="currentStep === 'texts'" :form="form" />
          <MusicStep
            v-else-if="currentStep === 'music'"
            :form="form"
            :supports-music="tribute?.template.supports_music ?? false"
            :tribute-id="tributeId"
            @changed="onMediaChanged"
          />
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
        </FwbCard>
      </div>

      <aside class="wizard-preview-panel">
        <FwbCard class="p-4">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Preview ao vivo
          </h3>
          <TributeLivePreview
            :tribute-id="tributeId"
            :form="form"
            :tribute="tribute"
            :refresh-token="previewRefreshToken"
          />
        </FwbCard>
      </aside>
    </div>

    <template #footer>
      <WizardFooter
        v-if="isEditable"
        :has-previous="hasPrevious"
        :has-next="hasNext"
        show-preview-button
        @previous="previousStep"
        @next="nextStep"
        @preview="openPreviewModal"
      />
    </template>
  </WizardShell>

  <FwbModal
    v-if="previewModalOpen"
    size="4xl"
    @close="closePreviewModal"
    @click:outside="closePreviewModal"
  >
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Preview da homenagem</h3>
    </template>
    <template #body>
      <TributeLivePreview
        :tribute-id="tributeId"
        :form="form"
        :tribute="tribute"
        :refresh-token="previewRefreshToken"
        compact
      />
    </template>
    <template #footer>
      <FwbButton color="alternative" @click="closePreviewModal">Fechar</FwbButton>
    </template>
  </FwbModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FwbButton, FwbCard, FwbModal } from 'flowbite-vue'
import { useTributeWizard } from '@/composables/useTributeWizard'
import { useWizardLayout } from '@/composables/useWizardLayout'
import { WIZARD_STEPS, type WizardStep } from '@/api/types'
import WizardShell from '@/components/wizard/WizardShell.vue'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardStepper from '@/components/wizard/WizardStepper.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'
import PhotosStep from './steps/PhotosStep.vue'
import TextsStep from './steps/TextsStep.vue'
import MusicStep from './steps/MusicStep.vue'
import EffectsStep from './steps/EffectsStep.vue'
import PreviewStep from './steps/PreviewStep.vue'
import PublishStep from './steps/PublishStep.vue'

const route = useRoute()
const router = useRouter()
const tributeId = route.params.id as string

const steps = WIZARD_STEPS
const currentStep = ref<WizardStep>('photos')
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

const {
  previewModalOpen,
  darkTheme,
  openPreviewModal,
  closePreviewModal,
  toggleDarkTheme,
} = useWizardLayout()

onMounted(async () => {
  await load()
  const step = route.query.step
  if (typeof step === 'string' && steps.includes(step as WizardStep)) {
    currentStep.value = step as WizardStep
  }
})

watch(currentStep, (step) => {
  void router.replace({ query: { ...route.query, step } })
})

const hasPrevious = computed(() => stepIndex(currentStep.value) > 0)
const hasNext = computed(() => stepIndex(currentStep.value) < steps.length - 1)

function stepIndex(step: WizardStep): number {
  return steps.indexOf(step)
}

function goToStep(step: WizardStep) {
  currentStep.value = step
}

function previousStep() {
  const index = stepIndex(currentStep.value)
  if (index > 0) currentStep.value = steps[index - 1]
}

function nextStep() {
  const index = stepIndex(currentStep.value)
  if (index < steps.length - 1) currentStep.value = steps[index + 1]
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
