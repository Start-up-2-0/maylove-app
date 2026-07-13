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
          <AlbumPresentationStep
            v-if="currentStep === 'presentation'"
            :form="form"
            :album="album"
          />
          <AlbumBasicsStep v-else-if="currentStep === 'basics'" :form="form" />
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
            @changed="onMediaChanged"
          />
          <AlbumPreviewStep
            v-else-if="currentStep === 'preview'"
            :album="album"
            :form="form"
            :refresh-token="previewRefreshToken"
            @go-publish="goToStep('publish')"
          />
          <AlbumPublishStep
            v-else-if="currentStep === 'publish'"
            :album-id="albumId"
            :album="album"
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
import { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import AlbumWizardStepper from './AlbumWizardStepper.vue'
import { ALBUM_WIZARD_STEPS, type AlbumWizardStep } from './albumWizardSteps'
import AlbumPresentationStep from './components/AlbumPresentationStep.vue'
import AlbumBasicsStep from './components/AlbumBasicsStep.vue'
import AlbumPhotosStep from './components/AlbumPhotosStep.vue'
import AlbumMusicStep from './components/AlbumMusicStep.vue'
import AlbumPreviewStep from './components/AlbumPreviewStep.vue'
import AlbumPublishStep from './components/AlbumPublishStep.vue'

const route = useRoute()
const router = useRouter()
const albumId = route.params.id as string

const currentStep = ref<AlbumWizardStep>('presentation')
const previewRefreshToken = ref(0)
const photosStepRef = ref<InstanceType<typeof AlbumPhotosStep> | null>(null)

const {
  album,
  form,
  loading,
  error,
  saving,
  savedAt,
  saveError,
  isEditable,
  photos,
  audio,
  load,
  reload,
} = useAlbumWizard(albumId)

onMounted(async () => {
  await load()
  const step = route.query.step
  if (typeof step === 'string' && ALBUM_WIZARD_STEPS.includes(step as AlbumWizardStep)) {
    currentStep.value = step as AlbumWizardStep
  }
})

watch(currentStep, (step, previous) => {
  void router.replace({ query: { ...route.query, step } })
  if (previous === 'photos' && step !== 'photos') {
    void reload()
  }
  if (step === 'preview') {
    void refreshPreview()
  }
})

const hasPrevious = computed(() => stepIndex(currentStep.value) > 0)
const hasNext = computed(() => stepIndex(currentStep.value) < ALBUM_WIZARD_STEPS.length - 1)

function stepIndex(step: AlbumWizardStep): number {
  return ALBUM_WIZARD_STEPS.indexOf(step)
}

function goToStep(step: AlbumWizardStep) {
  currentStep.value = step
}

function previousStep() {
  const index = stepIndex(currentStep.value)
  if (index > 0) currentStep.value = ALBUM_WIZARD_STEPS[index - 1]
}

function nextStep() {
  if (currentStep.value === 'photos') {
    void (async () => {
      await photosStepRef.value?.flushPendingCaptionSaves()
      if (photosStepRef.value?.validateTimelineFields() === false) {
        return
      }
      advanceStep()
    })()
    return
  }
  advanceStep()
}

function advanceStep() {
  const index = stepIndex(currentStep.value)
  if (index < ALBUM_WIZARD_STEPS.length - 1) currentStep.value = ALBUM_WIZARD_STEPS[index + 1]
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
