<template>
  <div ref="globeRef" class="map-globe" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MapPlace } from '@/api/types'
import { getPlaceEmoji } from '../mapPlaceTypes'

const props = defineProps<{
  places: MapPlace[]
  selectedPlaceId?: string | null
}>()

const globeRef = ref<HTMLElement | null>(null)
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

async function mountGlobe() {
  if (!globeRef.value) return
  const GlobeModule = await import('globe.gl')
  const Globe = GlobeModule.default
  globe = new Globe(globeRef.value)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
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
  globe = null
})
</script>

<style scoped>
.map-globe {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(circle at 30% 20%, #1a1020 0%, #09070b 55%, #030203 100%);
}
</style>
