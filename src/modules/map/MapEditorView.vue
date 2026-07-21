<template>
  <div class="wizard-view">
    <WizardHeader
      :title="map?.title || 'Editar mapa'"
      :status="map?.status ?? 'draft'"
      :saving="saving"
      :saved-at="savedAt"
      :save-error="saveError"
      back-href="/dashboard/maps"
      back-label="Meus mapas"
    />

    <MapWizardStepper
      v-if="isEditable || map?.status !== 'published'"
      :current-step="currentStep"
      @go="goToStep"
    />

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>

    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && map?.status === 'published'" class="ml-card wiz-panel">
      <h2 class="text-xl font-semibold mb-2">Mapa publicado</h2>
      <p class="text-muted mb-5">Este mapa já está no ar e não pode ser editado.</p>
      <div class="flex flex-wrap gap-3">
        <a :href="`/map/${map.slug}`" target="_blank" class="ml-btn ml-btn--primary">
          Abrir página pública
        </a>
        <RouterLink to="/dashboard/maps" class="ml-btn ml-btn--secondary">
          Voltar aos mapas
        </RouterLink>
      </div>
    </div>

    <div
      v-else
      class="wizard-body"
      :class="{ 'wizard-body--review': currentStep === 'publish' }"
    >
      <div class="wizard-editor">
        <div class="ml-card wiz-panel" :class="{ 'wiz-panel--review': currentStep === 'publish' }">
          <Transition name="wiz-step" mode="out-in">
            <div :key="currentStep" class="wiz-step-panel">
              <MapBasicsStep v-if="currentStep === 'basics'" :form="form" />
              <MapPlacesStep
                v-else-if="currentStep === 'places'"
                :map="map!"
                @changed="reload"
              />
              <MapPublishStep
                v-else-if="currentStep === 'publish'"
                :map-id="mapId"
                :map="map"
                :flush-autosave="flushAutosave"
                @published="onPublished"
              />
            </div>
          </Transition>
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
import { useMapWizard } from '@/composables/useMapWizard'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import MapWizardStepper from './MapWizardStepper.vue'
import { MAP_WIZARD_STEPS, type MapWizardStep } from './mapWizardSteps'
import MapBasicsStep from './components/MapBasicsStep.vue'
import MapPlacesStep from './components/MapPlacesStep.vue'
import MapPublishStep from './components/MapPublishStep.vue'

const route = useRoute()
const router = useRouter()
const mapId = route.params.id as string

const currentStep = ref<MapWizardStep>('basics')
const navigating = ref(false)

const {
  map,
  form,
  loading,
  error,
  saving,
  savedAt,
  saveError,
  flushAutosave,
  isEditable,
  load,
  reload,
} = useMapWizard(mapId)

onMounted(async () => {
  await load()
  const step = route.query.step
  if (typeof step === 'string' && MAP_WIZARD_STEPS.includes(step as MapWizardStep)) {
    currentStep.value = step as MapWizardStep
  }
})

watch(currentStep, (step) => {
  void router.replace({ query: { ...route.query, step } })
})

const hasPrevious = computed(() => stepIndex(currentStep.value) > 0)
const hasNext = computed(() => stepIndex(currentStep.value) < MAP_WIZARD_STEPS.length - 1)

function stepIndex(step: MapWizardStep): number {
  return MAP_WIZARD_STEPS.indexOf(step)
}

async function goToStep(step: MapWizardStep) {
  if (currentStep.value === 'basics' && step !== 'basics') {
    await flushAutosave()
  }
  currentStep.value = step
}

function previousStep() {
  if (navigating.value) return
  const index = stepIndex(currentStep.value)
  if (index > 0) currentStep.value = MAP_WIZARD_STEPS[index - 1]!
}

async function nextStep() {
  if (navigating.value) return
  navigating.value = true
  try {
    if (currentStep.value === 'basics') {
      const ok = await flushAutosave()
      if (!ok) return
    }
    const index = stepIndex(currentStep.value)
    if (index < MAP_WIZARD_STEPS.length - 1) {
      currentStep.value = MAP_WIZARD_STEPS[index + 1]!
    }
  } finally {
    navigating.value = false
  }
}

async function onPublished() {
  await reload()
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
