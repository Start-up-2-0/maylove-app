<template>
  <div class="map-experience" :data-style="map.map_style">
    <div class="map-experience__atmosphere" aria-hidden="true" />

    <header class="map-experience__header">
      <div class="map-experience__titles">
        <p class="map-experience__eyebrow">{{ map.couple_names }}</p>
        <h1>{{ map.title }}</h1>
        <p v-if="map.subtitle" class="map-experience__subtitle">{{ map.subtitle }}</p>
      </div>
      <nav class="map-experience__modes" aria-label="Modos de visualização">
        <button
          v-for="item in modes"
          :key="item.id"
          type="button"
          class="mode-btn"
          :class="{ 'mode-btn--active': viewMode === item.id }"
          @click="setMode(item.id)"
        >
          {{ item.label }}
        </button>
      </nav>
    </header>

    <div class="map-experience__stage">
      <CoupleMapCanvas
        v-if="viewMode === 'explore' || viewMode === 'journey'"
        ref="canvasRef"
        cinematic
        :places="sortedPlaces"
        :selected-place-id="selectedPlaceId"
        :center-lat="map.center_lat"
        :center-lng="map.center_lng"
        :zoom="map.default_zoom"
        :show-route="map.show_route"
        @select-place="openPlace"
      />

      <MapGlobeView
        v-else-if="viewMode === 'globe'"
        :places="sortedPlaces"
        :selected-place-id="selectedPlaceId"
        @select-place="openPlace"
      />

      <MapJourneyTimeline
        v-else
        :places="sortedPlaces"
        :active-place-id="selectedPlaceId"
        @select="openPlace"
      />

      <MapJourneyControls
        :visible="viewMode === 'journey'"
        :playing="journeyPlaying"
        :current-index="journeyIndex"
        :total="sortedPlaces.length"
        @toggle="toggleJourney"
        @next="stepJourney(1)"
        @prev="stepJourney(-1)"
        @stop="stopJourney"
      />
    </div>

    <MapMemoryExperience :place="memoryPlace" @close="closeMemory" />

    <footer class="map-experience__foot">
      <RouterLink to="/register" class="map-experience__brand">Feito com <strong>MayLov</strong></RouterLink>
      <button type="button" class="map-experience__share" @click="shareMap">Compartilhar</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { MapPlace, PublicCoupleMap } from '@/api/types'
import CoupleMapCanvas from './components/CoupleMapCanvas.vue'
import MapJourneyTimeline from './components/MapJourneyTimeline.vue'
import MapMemoryExperience from './components/MapMemoryExperience.vue'
import MapJourneyControls from './components/MapJourneyControls.vue'
import { delay, sortPlacesChronologically, type MapViewMode } from './mapJourney'

const MapGlobeView = defineAsyncComponent(() => import('./components/MapGlobeView.vue'))

const props = defineProps<{ map: PublicCoupleMap }>()

const route = useRoute()
const router = useRouter()

const modes: Array<{ id: MapViewMode; label: string }> = [
  { id: 'explore', label: 'Explorar' },
  { id: 'journey', label: 'Nossa Jornada' },
  { id: 'timeline', label: 'Linha do tempo' },
  { id: 'globe', label: 'Globo 3D' },
]

const viewMode = ref<MapViewMode>('explore')
const selectedPlaceId = ref<string | null>(null)
const memoryOpen = ref(false)
const journeyPlaying = ref(false)
const journeyIndex = ref(0)
const canvasRef = ref<InstanceType<typeof CoupleMapCanvas> | null>(null)
let journeyTimer: ReturnType<typeof setTimeout> | null = null

const sortedPlaces = computed(() => sortPlacesChronologically(props.map.places))

const memoryPlace = computed(() => {
  if (!memoryOpen.value || !selectedPlaceId.value) return null
  return sortedPlaces.value.find((p) => p.id === selectedPlaceId.value) ?? null
})

function pickInitialPlace(places: MapPlace[]): string | null {
  const highlight = places.find((p) => p.is_highlight)
  return highlight?.id ?? places[0]?.id ?? null
}

function setMode(mode: MapViewMode) {
  viewMode.value = mode
  router.replace({ query: { ...route.query, mode } })
  if (mode === 'journey') {
    journeyIndex.value = 0
    journeyPlaying.value = true
    void runJourneyStep()
  } else {
    stopJourney(false)
  }
}

function openPlace(placeId: string) {
  selectedPlaceId.value = placeId
  memoryOpen.value = true
}

function closeMemory() {
  memoryOpen.value = false
}

function clearJourneyTimer() {
  if (journeyTimer) {
    clearTimeout(journeyTimer)
    journeyTimer = null
  }
}

async function runJourneyStep() {
  clearJourneyTimer()
  if (!journeyPlaying.value || viewMode.value !== 'journey') return

  const place = sortedPlaces.value[journeyIndex.value]
  if (!place) {
    journeyPlaying.value = false
    return
  }

  selectedPlaceId.value = place.id
  canvasRef.value?.flyTo(place.latitude, place.longitude, 14, 1.8)
  await delay(1800)
  memoryOpen.value = true
  await delay(5200)
  memoryOpen.value = false
  await delay(700)

  if (!journeyPlaying.value || viewMode.value !== 'journey') return

  if (journeyIndex.value < sortedPlaces.value.length - 1) {
    journeyIndex.value += 1
    journeyTimer = setTimeout(() => void runJourneyStep(), 200)
  } else {
    journeyPlaying.value = false
  }
}

function toggleJourney() {
  journeyPlaying.value = !journeyPlaying.value
  if (journeyPlaying.value) void runJourneyStep()
  else clearJourneyTimer()
}

function stepJourney(delta: number) {
  clearJourneyTimer()
  journeyIndex.value = Math.min(
    sortedPlaces.value.length - 1,
    Math.max(0, journeyIndex.value + delta),
  )
  journeyPlaying.value = false
  const place = sortedPlaces.value[journeyIndex.value]
  if (place) {
    selectedPlaceId.value = place.id
    canvasRef.value?.flyTo(place.latitude, place.longitude, 14, 1.2)
  }
}

function stopJourney(resetMode = true) {
  journeyPlaying.value = false
  clearJourneyTimer()
  if (resetMode && viewMode.value === 'journey') {
    viewMode.value = 'explore'
    router.replace({ query: { ...route.query, mode: 'explore' } })
  }
}

async function shareMap() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: props.map.title, url }).catch(() => undefined)
    return
  }
  await navigator.clipboard.writeText(url)
}

onMounted(() => {
  const mode = route.query.mode
  if (mode === 'explore' || mode === 'journey' || mode === 'timeline' || mode === 'globe') {
    viewMode.value = mode
    if (mode === 'journey') {
      journeyPlaying.value = true
      void runJourneyStep()
    }
  }

  const placeQuery = route.query.place
  if (typeof placeQuery === 'string') {
    selectedPlaceId.value = placeQuery
    memoryOpen.value = true
  } else {
    selectedPlaceId.value = pickInitialPlace(sortedPlaces.value)
  }
})

watch(
  () => props.map.places,
  (places) => {
    if (!selectedPlaceId.value) {
      selectedPlaceId.value = pickInitialPlace(places)
    }
  },
)

onBeforeUnmount(() => clearJourneyTimer())
</script>

<style scoped>
.map-experience {
  position: relative;
  min-height: 100vh;
  color: #1f2937;
  overflow: hidden;
}
.map-experience__atmosphere {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 12% 8%, rgba(225, 29, 122, 0.12), transparent 34%),
    radial-gradient(circle at 88% 18%, rgba(244, 114, 182, 0.1), transparent 30%),
    linear-gradient(180deg, #fff8fc 0%, #ffffff 38%, #fff5fa 100%);
  z-index: 0;
}
.map-experience__header,
.map-experience__stage,
.map-experience__foot {
  position: relative;
  z-index: 1;
}
.map-experience__header {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.map-experience__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #e11d7a;
  font-weight: 700;
}
.map-experience__header h1 {
  margin: 6px 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  line-height: 1.05;
}
.map-experience__subtitle {
  margin: 0;
  color: #6b7280;
}
.map-experience__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mode-btn {
  border: 1px solid rgba(225, 29, 122, 0.16);
  background: rgba(255, 255, 255, 0.72);
  color: #6b7280;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 0.82rem;
  transition: all 0.25s ease;
}
.mode-btn--active {
  background: #e11d7a;
  border-color: #e11d7a;
  color: #fff;
  box-shadow: 0 10px 24px rgba(225, 29, 122, 0.24);
}
.map-experience__stage {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 20px 28px;
  min-height: min(72vh, 720px);
}
.map-experience__stage :deep(.couple-map-canvas),
.map-experience__stage :deep(.map-globe),
.map-experience__stage :deep(.journey-timeline) {
  min-height: min(72vh, 720px);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(225, 29, 122, 0.12);
}
.map-experience__foot {
  max-width: 1180px;
  margin: 0 auto;
  padding: 8px 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.map-experience__brand {
  color: #6b7280;
  text-decoration: none;
}
.map-experience__share {
  border: none;
  background: transparent;
  color: #e11d7a;
  font-weight: 700;
}
@media (max-width: 720px) {
  .map-experience__header {
    padding-top: 18px;
  }
  .map-experience__modes {
    width: 100%;
  }
  .mode-btn {
    flex: 1 1 calc(50% - 4px);
    text-align: center;
  }
}
</style>
