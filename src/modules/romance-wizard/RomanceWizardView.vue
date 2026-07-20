<template>
  <div class="romance-wizard romance-wizard--editor">
    <WizardHeader
      :title="headerTitle"
      :status="tribute?.status ?? 'draft'"
      :saving="saving"
      :saved-at="savedAt"
      :save-error="saveError"
      back-href="/dashboard/romances/new"
      back-label="Experiências"
    />

    <RomanceStepper
      v-if="isEditable || tribute?.status !== 'published'"
      :current-step="currentStep"
      :steps="experienceSteps"
      @go="goToStep"
    />

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>
    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && tribute?.status === 'published'" class="rom-panel rom-published">
      <h2>Experiência publicada</h2>
      <p class="text-muted">Seu presente digital já está no ar.</p>
      <div class="rom-published__actions">
        <a :href="`/h/${tribute.slug}`" target="_blank" class="ml-btn ml-btn--primary">
          Abrir página
        </a>
        <RouterLink :to="`/dashboard/romances/${tributeId}`" class="ml-btn ml-btn--secondary">
          Ver analytics
        </RouterLink>
      </div>
    </div>

    <div v-else class="romance-wizard__shell">
      <div class="romance-wizard__main">
        <Transition name="wiz-step" mode="out-in">
          <div :key="currentStep" class="romance-wizard__panel">
            <RomanceRecipientStep
              v-if="currentStep === 'recipient'"
              :form="form"
              :experience-id="experienceId"
            />
            <RomancePhotosStep
              v-else-if="currentStep === 'photos'"
              :form="form"
              :tribute-id="tributeId"
              :tribute-type-id="tribute?.tribute_type.id"
              :photos="photos"
              :definition="definition"
              :experience-id="experienceId"
              @media-changed="onMediaChanged"
            />
            <RomanceMessageStep
              v-else-if="currentStep === 'message'"
              :form="form"
              :experience-id="experienceId"
            />
            <RomanceMusicStep
              v-else-if="currentStep === 'music'"
              :form="form"
              :tribute-id="tributeId"
              :experience-id="experienceId"
              @media-changed="onMediaChanged"
            />
            <RomanceSpecialDateStep
              v-else-if="currentStep === 'special-date'"
              :form="form"
              :experience-id="experienceId"
            />
            <RomanceVideoStep
              v-else-if="currentStep === 'video'"
              :form="form"
              :experience-id="experienceId"
            />
            <RomanceChaptersStep
              v-else-if="currentStep === 'chapters'"
              :form="form"
              :photos="photos"
              :experience-id="experienceId"
            />
            <RomanceFinishStep
              v-else-if="currentStep === 'preview'"
              :tribute-id="tributeId"
              :form="form"
              :tribute="tribute"
              :definition="definition"
              :experience-id="experienceId"
              :refresh-token="previewRefreshToken"
              :generating="previewGenerating"
              :flush-autosave="flushAutosave"
              embedded
              @regenerate="refreshPreview"
              @published="onPublished"
            />
          </div>
        </Transition>

        <p v-if="stepError" class="ml-alert ml-alert--danger rom-step-error">{{ stepError }}</p>
      </div>

      <aside v-if="currentStep !== 'preview'" class="romance-wizard__aside">
        <div class="rom-preview-panel">
          <p class="rom-preview-panel__eyebrow">Prévia ao vivo</p>
          <p class="rom-preview-panel__experience">
            {{ experience?.icon }} {{ experience?.label }}
          </p>
          <p v-if="experience?.opening" class="rom-preview-panel__opening">{{ experience.opening }}</p>
          <div v-if="previewGenerating" class="rom-preview-panel__loading">
            <span class="ml-spinner ml-spinner--sm" />
          </div>
          <TributeLivePreview
            v-else
            :tribute-id="tributeId"
            :form="form"
            :tribute="tribute"
            :refresh-token="previewRefreshToken"
            faithful
            compact
          />
        </div>
      </aside>
    </div>

    <WizardFooter
      v-if="isEditable && currentStep !== 'preview'"
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
  applyRomanceExperienceDefaults,
  nextExperienceStep,
  previousExperienceStep,
  resolveExperienceStep,
} from '@/modules/romance-wizard/romanceExperienceFlow'
import {
  getExperienceSteps,
  getRomanceExperience,
  resolveRomanceExperienceId,
  type RomanceExperienceId,
  type RomanceExperienceStepId,
} from '@/modules/romance-wizard/romanceExperiences'
import { validateExperienceStep } from '@/modules/romance-wizard/useRomanceWizardValidation'
import { applyRomanceTitleDefaults, romanceDisplayTitle } from '@/modules/romance-wizard/romanceCopy'
import RomanceStepper from '@/modules/romance-wizard/components/RomanceStepper.vue'
import RomanceRecipientStep from '@/modules/romance-wizard/steps/RomanceRecipientStep.vue'
import RomancePhotosStep from '@/modules/romance-wizard/steps/RomancePhotosStep.vue'
import RomanceMessageStep from '@/modules/romance-wizard/steps/RomanceMessageStep.vue'
import RomanceMusicStep from '@/modules/romance-wizard/steps/RomanceMusicStep.vue'
import RomanceSpecialDateStep from '@/modules/romance-wizard/steps/RomanceSpecialDateStep.vue'
import RomanceVideoStep from '@/modules/romance-wizard/steps/RomanceVideoStep.vue'
import RomanceChaptersStep from '@/modules/romance-wizard/steps/RomanceChaptersStep.vue'
import RomanceFinishStep from '@/modules/romance-wizard/steps/RomanceFinishStep.vue'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'
import '@/modules/romance-wizard/styles/romance-wizard.css'

const route = useRoute()
const router = useRouter()
const tributeId = route.params.id as string

const currentStep = ref<RomanceExperienceStepId>('recipient')
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

const experienceId = computed((): RomanceExperienceId | null =>
  resolveRomanceExperienceId({
    romanceExperienceId: form.romance_experience_id,
    wizardTypeId: form.wizard_type_id,
  }),
)

const experience = computed(() => getRomanceExperience(experienceId.value))
const experienceSteps = computed(() => getExperienceSteps(experienceId.value))

const headerTitle = computed(() => romanceDisplayTitle(form) || experience.value?.label || 'Nova experiência')

const stepIndex = computed(() => experienceSteps.value.indexOf(currentStep.value))
const hasPrevious = computed(() => stepIndex.value > 0)
const hasNext = computed(() => stepIndex.value >= 0 && stepIndex.value < experienceSteps.value.length - 1)

onMounted(async () => {
  await load()
  applyRomanceTitleDefaults(form)

  const resolvedExperience = resolveRomanceExperienceId({
    romanceExperienceId:
      (typeof route.query.experience === 'string' ? route.query.experience : null) ||
      form.romance_experience_id,
    wizardTypeId: form.wizard_type_id,
  })

  if (resolvedExperience && !form.romance_experience_id) {
    form.romance_experience_id = resolvedExperience
  }

  if (resolvedExperience && isEditable.value) {
    const fromQuery = typeof route.query.experience === 'string'
    if (fromQuery || !form.romance_experience_id) {
      form.romance_experience_id = resolvedExperience
      await applyRomanceExperienceDefaults(form, tributeId, resolvedExperience)
    }
  }

  currentStep.value = resolveExperienceStep(
    typeof route.query.step === 'string' ? route.query.step : null,
    experienceId.value,
  )
})

watch(currentStep, (step) => {
  stepError.value = ''
  void router.replace({
    query: {
      ...route.query,
      step,
      ...(experienceId.value ? { experience: experienceId.value } : {}),
    },
  })
  if (step === 'preview') void refreshPreview()
})

watch(
  () => [form.honoree_name, form.message, form.presentation, photos.value.length],
  () => {
    previewRefreshToken.value += 1
  },
)

function goToStep(step: RomanceExperienceStepId) {
  currentStep.value = step
}

function previousStep() {
  const prev = previousExperienceStep(currentStep.value, experienceId.value)
  if (prev) currentStep.value = prev
}

async function nextStep() {
  stepError.value = ''
  const result = validateExperienceStep(
    currentStep.value,
    form,
    photos.value.length,
    definition.value,
    experienceId.value,
  )
  if (!result.valid) {
    stepError.value = result.message ?? 'Revise os campos antes de continuar.'
    return
  }

  navigating.value = true
  try {
    const next = nextExperienceStep(currentStep.value, experienceId.value)
    if (next) {
      if (next === 'preview') await flushAutosave()
      currentStep.value = next
      if (next === 'preview') await refreshPreview()
      else previewRefreshToken.value += 1
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

async function onPublished() {
  await reload()
  previewRefreshToken.value += 1
}
</script>

<style scoped>
.romance-wizard__shell {
  display: grid;
  gap: 24px;
  max-width: 1200px;
}
@media (min-width: 1024px) {
  .romance-wizard__shell {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
    align-items: start;
  }
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
