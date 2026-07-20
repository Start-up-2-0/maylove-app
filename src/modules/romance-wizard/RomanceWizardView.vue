<template>
  <div class="romance-wizard romance-wizard--editor">
    <WizardHeader
      :title="headerTitle"
      :status="tribute?.status ?? 'draft'"
      :saving="saving"
      :saved-at="savedAt"
      :save-error="saveError"
      back-href="/dashboard"
      back-label="Romances"
    />

    <RomanceStepper
      v-if="isEditable || tribute?.status !== 'published'"
      :current-step="currentStep"
      @go="goToStep"
    />

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>
    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && tribute?.status === 'published'" class="rom-panel rom-published">
      <h2>Romance publicado</h2>
      <p class="text-muted">Este presente digital já está no ar.</p>
      <div class="rom-published__actions">
        <a :href="`/h/${tribute.slug}`" target="_blank" class="ml-btn ml-btn--primary">
          Abrir página
        </a>
        <RouterLink :to="`/dashboard/romances/${tributeId}`" class="ml-btn ml-btn--secondary">
          Ver analytics
        </RouterLink>
      </div>
    </div>

    <div v-else class="romance-wizard__body">
      <Transition name="wiz-step" mode="out-in">
        <div :key="currentStep" class="romance-wizard__panel">
          <RomanceOccasionStep
            v-if="currentStep === 'occasion'"
            :form="form"
            :tribute-id="tributeId"
            @changed="onTributeChanged"
          />
          <RomanceCoupleStep
            v-else-if="currentStep === 'couple'"
            :form="form"
            :tribute-id="tributeId"
            :tribute-type-id="tribute?.tribute_type.id"
            :photos="photos"
            :definition="definition"
            @media-changed="onMediaChanged"
          />
          <RomanceStoryStep
            v-else-if="currentStep === 'story'"
            :form="form"
            :photos="photos"
          />
          <RomanceStyleStep
            v-else-if="currentStep === 'style'"
            :form="form"
            :tribute-id="tributeId"
            :tribute-type-id="tribute?.tribute_type.id"
            :definition="definition"
            @media-changed="onMediaChanged"
          />
          <RomanceFinishStep
            v-else-if="currentStep === 'finish'"
            :tribute-id="tributeId"
            :form="form"
            :tribute="tribute"
            :definition="definition"
            :refresh-token="previewRefreshToken"
            :generating="previewGenerating"
            :flush-autosave="flushAutosave"
            @regenerate="refreshPreview"
            @published="onPublished"
          />
        </div>
      </Transition>

      <p v-if="stepError" class="ml-alert ml-alert--danger rom-step-error">{{ stepError }}</p>
    </div>

    <WizardFooter
      v-if="isEditable && currentStep !== 'finish'"
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
import { getTemplateDefinition } from '@/templates/registry'
import {
  nextRomanceStep,
  previousRomanceStep,
  resolveRomanceStep,
  type RomanceStep,
} from '@/modules/romance-wizard/romanceWizardSteps'
import { validateRomanceStep } from '@/modules/romance-wizard/useRomanceWizardValidation'
import RomanceStepper from '@/modules/romance-wizard/components/RomanceStepper.vue'
import RomanceOccasionStep from '@/modules/romance-wizard/steps/RomanceOccasionStep.vue'
import RomanceCoupleStep from '@/modules/romance-wizard/steps/RomanceCoupleStep.vue'
import RomanceStoryStep from '@/modules/romance-wizard/steps/RomanceStoryStep.vue'
import RomanceStyleStep from '@/modules/romance-wizard/steps/RomanceStyleStep.vue'
import RomanceFinishStep from '@/modules/romance-wizard/steps/RomanceFinishStep.vue'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import '@/modules/romance-wizard/styles/romance-wizard.css'

const route = useRoute()
const router = useRouter()
const tributeId = route.params.id as string

const currentStep = ref<RomanceStep>('occasion')
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

const headerTitle = computed(
  () => form.title || form.honoree_name || tribute.value?.title || 'Criar romance',
)

const stepIndex = computed(() =>
  ['occasion', 'couple', 'story', 'style', 'finish'].indexOf(currentStep.value),
)
const hasPrevious = computed(() => stepIndex.value > 0)
const hasNext = computed(() => stepIndex.value < 4)

onMounted(async () => {
  await load()
  currentStep.value = resolveRomanceStep(
    typeof route.query.step === 'string' ? route.query.step : null,
  )
})

watch(currentStep, (step) => {
  stepError.value = ''
  void router.replace({ query: { ...route.query, step } })
  if (step === 'finish') void refreshPreview()
})

function goToStep(step: RomanceStep) {
  currentStep.value = step
}

function previousStep() {
  const prev = previousRomanceStep(currentStep.value)
  if (prev) currentStep.value = prev
}

async function nextStep() {
  stepError.value = ''
  const result = validateRomanceStep(
    currentStep.value,
    form,
    photos.value.length,
    definition.value,
  )
  if (!result.valid) {
    stepError.value = result.message ?? 'Revise os campos antes de continuar.'
    return
  }

  navigating.value = true
  try {
    const next = nextRomanceStep(currentStep.value)
    if (next) {
      if (next === 'finish') await flushAutosave()
      currentStep.value = next
      if (next === 'finish') await refreshPreview()
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
}
</script>

<style scoped>
.romance-wizard__body {
  max-width: 1120px;
}
.rom-step-error {
  margin-top: 16px;
}
.rom-published h2 {
  margin: 0 0 8px;
  font-size: 1.35rem;
}
.rom-published__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}
</style>
