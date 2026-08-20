<template>
  <div class="map-globe">
    <div ref="globeRef" class="map-globe__canvas" :aria-hidden="loadState !== 'ready'" />
    <div v-if="loadState === 'loading'" class="map-globe__status" role="status" aria-live="polite">
      <span class="ml-spinner" aria-hidden="true" />
      <strong>Preparando o globo 3D...</strong>
      <span>Esse recurso é carregado somente quando você o abre.</span>
    </div>
    <div v-else-if="loadState === 'error'" class="map-globe__status" role="alert">
      <strong>Não foi possível abrir o globo</strong>
      <span>{{ loadError }}</span>
      <button type="button" class="ml-btn ml-btn--secondary ml-btn--sm" @click="mountGlobe">
        Tentar novamente
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MapPlace } from '@/api/types'
import { getPlaceEmoji } from '../mapPlaceTypes'
import {
  MAP_GLOBE_BUMP_URL,
  MAP_GLOBE_TEXTURE_URL,
  resolveMapGlobeErrorMessage,
} from '../mapGlobeConfig'

const props = defineProps<{
  places: MapPlace[]
  selectedPlaceId?: string | null
}>()

const globeRef = ref<HTMLElement | null>(null)
const loadState = ref<'loading' | 'ready' | 'error'>('loading')
const loadError = ref('')
let mounted = true
let mountAttempt = 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globe: any = null

const emit = defineEmits<{ selectPlace: [placeId: string] }>()

function buildPoints() {
  return props.places.map((place) => ({
    id: place.id,
    lat: place.latitude,
    lng: place.longitude,
    size: place.id === props.selectedPlaceId ? 0.55 : 0.35,
    color: place.id === props.selectedPlaceId ? '#e11d7a' : '#be185d',
    label: `${getPlaceEmoji(place)} ${place.title}`,
  }))
}

function preloadTexture(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => reject(new Error(`Failed to load globe texture: ${url}`))
    image.src = url
  })
}

async function mountGlobe() {
  if (!globeRef.value) return
  const attempt = ++mountAttempt
  destroyGlobe()
  loadState.value = 'loading'
  loadError.value = ''
  try {
    const [GlobeModule] = await Promise.all([
      import('globe.gl'),
      preloadTexture(MAP_GLOBE_TEXTURE_URL),
      preloadTexture(MAP_GLOBE_BUMP_URL),
    ])
    if (!mounted || attempt !== mountAttempt || !globeRef.value) return
    const Globe = GlobeModule.default
    globe = new Globe(globeRef.value)
      .globeImageUrl(MAP_GLOBE_TEXTURE_URL)
      .bumpImageUrl(MAP_GLOBE_BUMP_URL)
      .backgroundColor('rgba(0,0,0,0)')
      .pointsData(buildPoints())
      .pointAltitude('size')
      .pointColor('color')
      .pointLabel('label')
      .onPointClick((point: { id?: string }) => {
        if (point.id) emit('selectPlace', point.id)
      })

    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.35
    globe.pointOfView({ lat: 10, lng: -30, altitude: 2.2 })
    loadState.value = 'ready'
  } catch (error) {
    if (!mounted || attempt !== mountAttempt) return
    destroyGlobe()
    loadError.value = resolveMapGlobeErrorMessage(error)
    loadState.value = 'error'
  }
}

function destroyGlobe() {
  if (typeof globe?._destructor === 'function') {
    globe._destructor()
  }
  globe = null
  if (globeRef.value) globeRef.value.replaceChildren()
}

function flyToPlace(place: MapPlace) {
  if (!globe) return
  globe.controls().autoRotate = false
  globe.pointOfView({ lat: place.latitude, lng: place.longitude, altitude: 1.6 }, 1800)
  globe
    .pointsData(buildPoints())
    .pointAltitude('size')
    .pointColor('color')
}

onMounted(async () => {
  await mountGlobe()
  const selected = props.places.find((p) => p.id === props.selectedPlaceId)
  if (selected) flyToPlace(selected)
})

watch(
  () => props.selectedPlaceId,
  (id) => {
    const place = props.places.find((p) => p.id === id)
    if (place) flyToPlace(place)
  },
)

watch(
  () => props.places,
  () => {
    if (globe) {
      globe.pointsData(buildPoints()).pointAltitude('size').pointColor('color')
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  mounted = false
  mountAttempt += 1
  destroyGlobe()
})
</script>

<style scoped>
.map-globe {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(circle at 30% 20%, #1a1020 0%, #09070b 55%, #030203 100%);
}
.map-globe__canvas {
  width: 100%;
  height: 100%;
  min-height: inherit;
}
.map-globe__status {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: #fff;
  text-align: center;
  background: radial-gradient(circle at 30% 20%, rgba(40, 21, 46, 0.96), rgba(3, 2, 3, 0.98));
}
.map-globe__status span:not(.ml-spinner) {
  max-width: 460px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.86rem;
}
</style>
