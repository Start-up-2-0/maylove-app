<template>
  <div ref="containerRef" class="couple-map-canvas" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapPlace } from '@/api/types'
import { getPlaceEmoji } from '../mapPlaceTypes'
import { sortPlacesChronologically } from '../mapJourney'

const props = withDefaults(
  defineProps<{
    places?: MapPlace[]
    selectedPlaceId?: string | null
    centerLat?: number | null
    centerLng?: number | null
    zoom?: number | null
    showRoute?: boolean
    editable?: boolean
    cinematic?: boolean
  }>(),
  {
    places: () => [],
    selectedPlaceId: null,
    centerLat: -14.235,
    centerLng: -51.9253,
    zoom: 4,
    showRoute: false,
    editable: false,
    cinematic: false,
  },
)

const emit = defineEmits<{
  mapClick: [lat: number, lng: number]
  selectPlace: [placeId: string]
  ready: []
}>()

const containerRef = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let routeLayer: L.Polyline | null = null

function pinIcon(place: MapPlace, selected: boolean): L.DivIcon {
  const emoji = getPlaceEmoji(place)
  return L.divIcon({
    className: `map-pin map-pin--emoji${selected ? ' map-pin--selected' : ''}${props.cinematic ? ' map-pin--cinematic' : ''}`,
    html: `<span class="map-pin__emoji" aria-hidden="true">${emoji}</span>`,
    iconSize: selected ? [44, 44] : [38, 38],
    iconAnchor: selected ? [22, 22] : [19, 19],
  })
}

function renderMarkers() {
  if (!map || !markersLayer) return
  markersLayer.clearLayers()

  props.places.forEach((place) => {
    const selected = place.id === props.selectedPlaceId
    const marker = L.marker([place.latitude, place.longitude], {
      icon: pinIcon(place, selected),
      zIndexOffset: selected ? 1000 : 0,
    })
    marker.on('click', () => emit('selectPlace', place.id))
    marker.bindTooltip(place.title, { direction: 'top', offset: [0, -12], className: 'map-tooltip' })
    markersLayer!.addLayer(marker)
  })

  if (routeLayer) {
    map.removeLayer(routeLayer)
    routeLayer = null
  }

  if (props.showRoute && props.places.length >= 2) {
    const sorted = sortPlacesChronologically(props.places)
    routeLayer = L.polyline(
      sorted.map((p) => [p.latitude, p.longitude] as [number, number]),
      {
        color: '#e11d7a',
        weight: props.cinematic ? 4 : 3,
        opacity: 0.8,
        dashArray: props.cinematic ? undefined : '8 10',
      },
    ).addTo(map)
  }

  if (props.places.length > 0 && !props.centerLat && !props.cinematic) {
    const bounds = L.latLngBounds(props.places.map((p) => [p.latitude, p.longitude] as [number, number]))
    map.fitBounds(bounds.pad(0.2))
  }
}

function flyTo(lat: number, lng: number, zoom = 13, duration = 1.8) {
  map?.flyTo([lat, lng], zoom, { duration, easeLinearity: 0.25 })
}

function fitAllPlaces() {
  if (!map || props.places.length === 0) return
  const bounds = L.latLngBounds(props.places.map((p) => [p.latitude, p.longitude] as [number, number]))
  map.flyToBounds(bounds.pad(0.25), { duration: 1.4 })
}

onMounted(() => {
  if (!containerRef.value) return

  map = L.map(containerRef.value, {
    center: [props.centerLat ?? -14.235, props.centerLng ?? -51.9253],
    zoom: props.zoom ?? 4,
    scrollWheelZoom: true,
    zoomControl: !props.cinematic,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  if (props.editable) {
    map.on('click', (event: L.LeafletMouseEvent) => {
      emit('mapClick', event.latlng.lat, event.latlng.lng)
    })
  }

  renderMarkers()
  emit('ready')
})

watch(
  () => [props.places, props.selectedPlaceId, props.showRoute],
  () => renderMarkers(),
  { deep: true },
)

watch(
  () => props.selectedPlaceId,
  (id) => {
    if (!id || !map) return
    const place = props.places.find((p) => p.id === id)
    if (place) flyTo(place.latitude, place.longitude, 14, 1.6)
  },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

defineExpose({ flyTo, fitAllPlaces })
</script>

<style scoped>
.couple-map-canvas {
  width: 100%;
  height: 100%;
  min-height: 320px;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
}

:deep(.map-pin__emoji) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.35rem;
  line-height: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #fff;
  box-shadow: 0 8px 24px rgba(225, 29, 122, 0.28);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

:deep(.map-pin--selected .map-pin__emoji) {
  transform: scale(1.12);
  box-shadow: 0 12px 32px rgba(225, 29, 122, 0.45);
  border-color: #e11d7a;
}

:deep(.map-pin--cinematic .map-pin__emoji) {
  backdrop-filter: blur(6px);
}

:deep(.map-tooltip) {
  border: none;
  background: rgba(20, 17, 15, 0.88);
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 0.78rem;
}
</style>
