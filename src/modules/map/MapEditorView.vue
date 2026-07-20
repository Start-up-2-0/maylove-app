<template>
  <div class="wizard-view">
    <WizardHeader
      :title="map?.title || 'Editar mapa'"
      :status="map?.status ?? 'draft'"
      :saving="false"
      :saved-at="null"
      save-error=""
      back-href="/dashboard/maps"
      back-label="Meus mapas"
    />

    <nav v-if="isEditable" class="map-stepper">
      <button
        v-for="step in steps"
        :key="step.id"
        type="button"
        class="map-stepper__item"
        :class="{ 'map-stepper__item--active': currentStep === step.id }"
        @click="goToStep(step.id)"
      >
        {{ step.label }}
      </button>
    </nav>

    <section v-if="loading" class="text-muted py-12 text-center">Carregando...</section>
    <section v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</section>

    <div v-else-if="!isEditable && map?.status === 'published'" class="ml-card wiz-panel">
      <h2 class="text-xl font-semibold mb-2">Mapa publicado</h2>
      <p class="text-muted mb-5">Este mapa já está no ar e não pode ser editado.</p>
      <div class="flex flex-wrap gap-3">
        <a :href="`/map/${map.slug}`" target="_blank" class="ml-btn ml-btn--primary">Abrir página pública</a>
        <RouterLink to="/dashboard/maps" class="ml-btn ml-btn--secondary">Voltar</RouterLink>
      </div>
    </div>

    <div v-else-if="map" class="wizard-body">
      <div class="ml-card wiz-panel">
        <MapBasicsStep v-if="currentStep === 'basics'" :map="map" @saved="onMapSaved" />
        <MapPlacesStep v-else-if="currentStep === 'places'" :map="map" @changed="reload" />
        <MapPublishStep
          v-else-if="currentStep === 'publish'"
          :map-id="mapId"
          :map="map"
          @published="onPublished"
        />
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
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchMap } from '@/api/maps'
import { resolveApiError } from '@/api/errors'
import type { CoupleMapDetail } from '@/api/types'
import WizardHeader from '@/components/wizard/WizardHeader.vue'
import WizardFooter from '@/components/wizard/WizardFooter.vue'
import MapBasicsStep from './components/MapBasicsStep.vue'
import MapPlacesStep from './components/MapPlacesStep.vue'
import MapPublishStep from './components/MapPublishStep.vue'

type MapWizardStep = 'basics' | 'places' | 'publish'

const route = useRoute()
const router = useRouter()
const mapId = route.params.id as string

const steps = [
  { id: 'basics' as const, label: 'Informações' },
  { id: 'places' as const, label: 'Locais' },
  { id: 'publish' as const, label: 'Publicar' },
]

const currentStep = ref<MapWizardStep>('basics')
const map = ref<CoupleMapDetail | null>(null)
const loading = ref(true)
const error = ref('')
const navigating = ref(false)

const isEditable = computed(() => map.value?.status === 'draft' || map.value?.status === 'awaiting_payment')

const stepIndex = computed(() => steps.findIndex((s) => s.id === currentStep.value))
const hasPrevious = computed(() => stepIndex.value > 0)
const hasNext = computed(() => stepIndex.value < steps.length - 1)

async function load() {
  loading.value = true
  error.value = ''
  try {
    map.value = await fetchMap(mapId)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível carregar o mapa.')
  } finally {
    loading.value = false
  }
}

async function reload() {
  try {
    map.value = await fetchMap(mapId)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível atualizar o mapa.')
  }
}

function goToStep(step: MapWizardStep) {
  currentStep.value = step
  router.replace({ query: { ...route.query, step } })
}

function previousStep() {
  if (!hasPrevious.value) return
  goToStep(steps[stepIndex.value - 1]!.id)
}

function nextStep() {
  if (!hasNext.value) return
  goToStep(steps[stepIndex.value + 1]!.id)
}

function onMapSaved(updated: CoupleMapDetail) {
  map.value = updated
}

async function onPublished() {
  await reload()
  currentStep.value = 'publish'
}

onMounted(async () => {
  await load()
  const step = route.query.step
  if (step === 'basics' || step === 'places' || step === 'publish') {
    currentStep.value = step
  }
})
</script>

<style scoped>
.map-stepper {
  display: flex;
  gap: 8px;
  margin: 0 0 20px;
  flex-wrap: wrap;
}
.map-stepper__item {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 0.85rem;
}
.map-stepper__item--active {
  color: var(--primary);
  border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
  background: color-mix(in srgb, var(--primary) 8%, var(--surface));
}
</style>
