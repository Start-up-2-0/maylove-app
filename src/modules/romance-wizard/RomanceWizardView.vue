<template>
  <RomanceBuildShell
    :title="shellTitle"
    :subtitle="shellSubtitle"
    back-href="/dashboard/romances/new"
    back-label="Experiências"
    :show-header="!loading && !error"
  >
    <template v-if="!loading && !error" #meta>
      <span class="ml-badge" :class="statusBadgeClass">{{ statusLabel }}</span>
      <span v-if="saving" class="rom-save-meta">
        <span class="rom-save-meta__dot rom-save-meta__dot--saving" />
        Salvando...
      </span>
      <span v-else-if="savedAt" class="rom-save-meta">
        <span class="rom-save-meta__dot rom-save-meta__dot--saved" />
        Salvo
      </span>
    </template>

    <RomanceStepper
      v-if="(isEditable || tribute?.status !== 'published') && !loading && !error"
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

    <div v-else-if="currentStep === 'preview'" class="romance-wizard__finish">
      <RomanceFinishStep
        :tribute-id="tributeId"
        :form="form"
        :tribute="tribute"
        :experience-id="experienceId"
        :photo-count="photos.length"
        :flush-autosave="flushAutosave"
        @published="onPublished"
      />

      <RomanceWizardFooter
        v-if="isEditable"
        :has-previous="hasPrevious"
        :has-next="false"
        :show-preview-button="false"
        continue-label="Continuar"
        @previous="previousStep"
      />
    </div>

    <div v-else class="romance-wizard__editor-main">
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
          <RomanceThemeStep
            v-else-if="currentStep === 'theme'"
            :form="form"
            :experience-id="experienceId"
            :definition="definition"
            :tribute-type-id="tribute?.tribute_type.id"
            @theme-changed="onThemeChanged"
          />
          <RomanceEffectsStep
            v-else-if="currentStep === 'effects'"
            :form="form"
            :experience-id="experienceId"
          />
        </div>
      </Transition>

      <p v-if="stepError" class="ml-alert ml-alert--danger rom-step-error">{{ stepError }}</p>

      <RomanceWizardFooter
        v-if="isEditable"
        :has-previous="hasPrevious"
        :has-next="hasNext"
        :loading="navigating"
        @previous="previousStep"
        @next="nextStep"
      />
    </div>

    <template v-if="showPreviewColumn" #preview>
      <RomancePhonePreview>
        <div v-if="previewGenerating" class="rom-preview-panel__loading">
          <span class="ml-spinner ml-spinner--sm" />
        </div>
        <TributeLivePreview
          v-else
          class="rom-wizard-live-preview"
          :tribute-id="tributeId"
          :form="form"
          :tribute="tribute"
          :refresh-token="previewRefreshToken"
          faithful
          compact
          contained
          :show-viewport-tabs="false"
          :viewport-width="375"
        />
        <template v-if="currentStep === 'preview'" #footer>
          <button
            type="button"
            class="rom-preview-refresh"
            :disabled="previewGenerating"
            @click="refreshPreview"
          >
            {{ previewGenerating ? 'Atualizando…' : 'Atualizar prévia' }}
          </button>
        </template>
      </RomancePhonePreview>
    </template>
  </RomanceBuildShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useTributeWizard } from '@/composables/useTributeWizard'
import { getTemplateDefinition } from '@/templates/registry'
import { getRomanceTheme } from '@/modules/romance-wizard/romanceThemes'
import { templateSlugForTheme } from '@/modules/romance-wizard/romanceThemeFlow'
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
import { ROMANCE_BUILD_HEADLINE, ROMANCE_LOVE_CARDS_TAGLINE } from '@/modules/romance-wizard/romanceBuildCopy'
import RomanceStepper from '@/modules/romance-wizard/components/RomanceStepper.vue'
import RomanceBuildShell from '@/modules/romance-wizard/components/RomanceBuildShell.vue'
import RomancePhonePreview from '@/modules/romance-wizard/components/RomancePhonePreview.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'
import RomanceWizardFooter from '@/modules/romance-wizard/components/RomanceWizardFooter.vue'
import RomanceRecipientStep from '@/modules/romance-wizard/steps/RomanceRecipientStep.vue'
import RomancePhotosStep from '@/modules/romance-wizard/steps/RomancePhotosStep.vue'
import RomanceMessageStep from '@/modules/romance-wizard/steps/RomanceMessageStep.vue'
import RomanceMusicStep from '@/modules/romance-wizard/steps/RomanceMusicStep.vue'
import RomanceSpecialDateStep from '@/modules/romance-wizard/steps/RomanceSpecialDateStep.vue'
import RomanceVideoStep from '@/modules/romance-wizard/steps/RomanceVideoStep.vue'
import RomanceChaptersStep from '@/modules/romance-wizard/steps/RomanceChaptersStep.vue'
import RomanceThemeStep from '@/modules/romance-wizard/steps/RomanceThemeStep.vue'
import RomanceEffectsStep from '@/modules/romance-wizard/steps/RomanceEffectsStep.vue'
import RomanceFinishStep from '@/modules/romance-wizard/steps/RomanceFinishStep.vue'
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
  isEditable,
  photos,
  load,
  reload,
  flushAutosave,
} = useTributeWizard(tributeId)

const definition = computed(() => {
  const theme = getRomanceTheme(form.romance_theme_id)
  const slug = theme ? templateSlugForTheme(theme) : tribute.value?.template.slug
  return getTemplateDefinition(slug)
})

const experienceId = computed((): RomanceExperienceId | null =>
  resolveRomanceExperienceId({
    romanceExperienceId: form.romance_experience_id,
    wizardTypeId: form.wizard_type_id,
  }),
)

const experience = computed(() => getRomanceExperience(experienceId.value))
const experienceSteps = computed(() => getExperienceSteps(experienceId.value))

const shellTitle = computed(() => romanceDisplayTitle(form) || experience.value?.label || 'Nova experiência')
const shellSubtitle = computed(() =>
  route.query.build === '1' ? `${ROMANCE_LOVE_CARDS_TAGLINE} · ${ROMANCE_BUILD_HEADLINE}` : ROMANCE_LOVE_CARDS_TAGLINE,
)

const showPreviewColumn = computed(
  () =>
    !loading.value &&
    !error.value &&
    (isEditable.value || tribute.value?.status !== 'published'),
)

const statusLabel = computed(
  () =>
    ({
      draft: 'Rascunho',
      awaiting_payment: 'Aguardando pagamento',
      published: 'Publicada',
    })[tribute.value?.status ?? 'draft'] ?? tribute.value?.status,
)

const statusBadgeClass = computed(() => {
  if (tribute.value?.status === 'published') return 'ml-badge--success'
  if (tribute.value?.status === 'awaiting_payment') return 'ml-badge--warning'
  return 'ml-badge--info'
})

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

  if (resolvedExperience && isEditable.value && !form.romance_experience_id) {
    form.romance_experience_id = resolvedExperience
    await applyRomanceExperienceDefaults(form, tributeId, resolvedExperience)
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
  () => photos.value.length,
  () => {
    previewRefreshToken.value += 1
  },
)

function previousStep() {
  const prev = previousExperienceStep(currentStep.value, experienceId.value)
  if (prev) currentStep.value = prev
}

function goToStep(step: RomanceExperienceStepId) {
  if (step === currentStep.value) return
  const targetIndex = experienceSteps.value.indexOf(step)
  if (targetIndex < 0 || targetIndex > stepIndex.value) return
  currentStep.value = step
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

async function onThemeChanged() {
  await flushAutosave()
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
}
</script>

<style scoped>
.romance-wizard__editor-main {
  width: 100%;
  min-width: 0;
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
.rom-save-meta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.84rem;
  color: var(--muted);
}
.rom-save-meta__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.rom-save-meta__dot--saving {
  background: var(--warning);
  animation: pulse 1s ease infinite;
}
.rom-save-meta__dot--saved {
  background: var(--success);
}
@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}
.rom-theme-preview-dock {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 14%, var(--border));
  box-shadow: 0 8px 24px -16px rgb(15 23 42 / 35%);
}
.rom-theme-preview-dock__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.rom-theme-preview-dock__meta {
  color: var(--muted);
  font-weight: 600;
}
.rom-preview-refresh {
  padding: 8px 14px;
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 18%, var(--border));
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--rom-muted, #9f1239);
  cursor: pointer;
}
.rom-preview-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
