<template>
  <div class="wizard-view">
    <WizardHeader
      :title="album?.title || 'Editar álbum'"
      :status="album?.status ?? 'draft'"
      :saving="saving"
      :saved-at="savedAt"
      :save-error="saveError"
      back-href="/dashboard/albums"
      back-label="Meus álbuns"
    />

    <AlbumWizardStepper
      v-if="isEditable || album?.status !== 'published'"
      :current-step="currentStep"
      :steps="wizardSteps"
      @go="goToStep"
    />

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>

    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && album?.status === 'published'" class="ml-card wiz-panel">
      <h2 class="text-xl font-semibold mb-2">Álbum publicado</h2>
      <p class="text-muted mb-5">Este livro já está no ar e não pode ser editado.</p>
      <div class="flex flex-wrap gap-3">
        <a :href="`/a/${album.slug}`" target="_blank" class="ml-btn ml-btn--primary">
          Abrir página pública
        </a>
        <RouterLink :to="`/dashboard/albums/${albumId}`" class="ml-btn ml-btn--secondary">
          Ver analytics
        </RouterLink>
      </div>
    </div>

    <div v-else class="wizard-body" :class="{ 'wizard-body--review': currentStep === 'preview' }">
      <div class="wizard-editor">
        <div class="ml-card wiz-panel" :class="{ 'wiz-panel--review': currentStep === 'preview' }">
          <AlbumBasicsStep
            v-if="currentStep === 'basics'"
            :form="form"
            :album="album"
            :photos="photos"
          />
          <AlbumPagesStep
            v-else-if="currentStep === 'pages'"
            :form="form"
            :photos="photos"
            :album="album"
          />
          <AlbumPhotosStep
            v-else-if="currentStep === 'photos'"
            ref="photosStepRef"
            :album-id="albumId"
            :photos="photos"
            :form="form"
            @changed="onMediaChanged"
          />
          <AlbumMusicStep
            v-else-if="currentStep === 'music'"
            :album-id="albumId"
            :audio="audio"
            :form="form"
            @changed="onMediaChanged"
          />
          <AlbumPreviewStep
            v-else-if="currentStep === 'preview'"
            :album="album"
            :form="form"
            :refresh-token="previewRefreshToken"
            :generating="previewGenerating"
            @go-publish="goToPublish"
            @regenerate="refreshPreview"
          />
          <AlbumPublishStep
            v-else-if="currentStep === 'publish'"
            :album-id="albumId"
            :album="album"
            :flush-autosave="flushAutosave"
            @published="onPublished"
          />
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
import { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import AlbumWizardStepper from './AlbumWizardStepper.vue'
import { wizardStepsFor, type AlbumWizardStep } from './albumWizardSteps'
import AlbumBasicsStep from './components/AlbumBasicsStep.vue'
import AlbumPagesStep from './components/AlbumPagesStep.vue'
import AlbumPhotosStep from './components/AlbumPhotosStep.vue'
import AlbumMusicStep from './components/AlbumMusicStep.vue'
import AlbumPreviewStep from './components/AlbumPreviewStep.vue'
import AlbumPublishStep from './components/AlbumPublishStep.vue'

const route = useRoute()
const router = useRouter()
const albumId = route.params.id as string

const currentStep = ref<AlbumWizardStep>('basics')
const previewRefreshToken = ref(0)
const previewGenerating = ref(false)
const navigating = ref(false)
const photosStepRef = ref<InstanceType<typeof AlbumPhotosStep> | null>(null)

const {
  album,
  form,
  loading,
  error,
  saving,
  savedAt,
  saveError,
  flushAutosave,
  isEditable,
  photos,
  audio,
  load,
  reload,
} = useAlbumWizard(albumId)

const wizardSteps = computed(() => wizardStepsFor(form.presentation))

onMounted(async () => {
  await load()
  const step = route.query.step
  if (typeof step === 'string' && wizardSteps.value.includes(step as AlbumWizardStep)) {
    currentStep.value = step as AlbumWizardStep
  } else if (step === 'presentation' || step === 'pages') {
    currentStep.value = 'basics'
  }
})

watch(
  () => form.presentation,
  () => {
    if (!wizardSteps.value.includes(currentStep.value)) {
      currentStep.value = 'basics'
    }
  },
)

watch(currentStep, (step, previous) => {
  void router.replace({ query: { ...route.query, step } })
  if ((previous === 'photos' || previous === 'pages') && step !== previous) {
    void (async () => {
      await flushAutosave()
      await reload()
    })()
    return
  }
  if (step === 'preview' && previous !== 'preview') {
    void refreshPreview()
  }
})

const hasPrevious = computed(() => stepIndex(currentStep.value) > 0)
const hasNext = computed(() => stepIndex(currentStep.value) < wizardSteps.value.length - 1)

function stepIndex(step: AlbumWizardStep): number {
  return wizardSteps.value.indexOf(step)
}

async function goToStep(step: AlbumWizardStep) {
  if (!wizardSteps.value.includes(step)) return
  if (currentStep.value === 'photos' && step !== 'photos') {
    await flushAutosave()
  }
  currentStep.value = step
}

async function goToPublish() {
  const ok = await flushAutosave()
  if (!ok) {
    // Ainda assim avança: o publish step tenta flushar de novo antes de publicar.
  }
  goToStep('publish')
}

function previousStep() {
  if (navigating.value) return
  const index = stepIndex(currentStep.value)
  if (index > 0) currentStep.value = wizardSteps.value[index - 1]
}

async function nextStep() {
  if (navigating.value) return
  navigating.value = true
  try {
    if (currentStep.value === 'preview') {
      await goToPublish()
      return
    }
    advanceStep()
  } finally {
    navigating.value = false
  }
}

function advanceStep() {
  const index = stepIndex(currentStep.value)
  if (index < wizardSteps.value.length - 1) currentStep.value = wizardSteps.value[index + 1]
}

async function refreshPreview() {
  previewGenerating.value = true
  try {
    // Garante que posições Polaroid e ajustes do form
    // não sejam sobrescritos por um reload antes do autosave.
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

function onPublished() {
  void router.push(`/dashboard/albums/${albumId}`)
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
