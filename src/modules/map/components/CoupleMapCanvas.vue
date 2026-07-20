<template>
  <div ref="containerRef" class="couple-map-canvas" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapPlace } from '@/api/types'

const props = withDefaults(
  defineProps<{
    places?: MapPlace[]
    selectedPlaceId?: string | null
    centerLat?: number | null
    centerLng?: number | null
    zoom?: number | null
    showRoute?: boolean
    editable?: boolean
  }>(),
  {
    places: () => [],
    selectedPlaceId: null,
    centerLat: -14.235,
    centerLng: -51.9253,
    zoom: 4,
    showRoute: false,
    editable: false,
  },
)

const emit = defineEmits<{
  mapClick: [lat: number, lng: number]
  selectPlace: [placeId: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let routeLayer: L.Polyline | null = null

function defaultIcon(): L.DivIcon {
  return L.divIcon({
    className: 'map-pin',
    html: '<span class="map-pin__dot"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function selectedIcon(): L.DivIcon {
  return L.divIcon({
    className: 'map-pin map-pin--selected',
    html: '<span class="map-pin__dot"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function renderMarkers() {
  if (!map || !markersLayer) return
  markersLayer.clearLayers()

  props.places.forEach((place) => {
    const marker = L.marker([place.latitude, place.longitude], {
      icon: place.id === props.selectedPlaceId ? selectedIcon() : defaultIcon(),
    })
    marker.on('click', () => emit('selectPlace', place.id))
    marker.bindTooltip(place.title, { direction: 'top', offset: [0, -8] })
    markersLayer!.addLayer(marker)
  })

  if (routeLayer) {
    map.removeLayer(routeLayer)
    routeLayer = null
  }

  if (props.showRoute && props.places.length >= 2) {
    const sorted = [...props.places].sort((a, b) => {
      const da = a.memory_date ?? ''
      const db = b.memory_date ?? ''
      if (da !== db) return da.localeCompare(db)
      return a.sort_order - b.sort_order
    })
    routeLayer = L.polyline(
      sorted.map((p) => [p.latitude, p.longitude] as [number, number]),
      { color: '#e11d7a', weight: 3, opacity: 0.75 },
    ).addTo(map)
  }

  if (props.places.length > 0 && !props.centerLat) {
    const bounds = L.latLngBounds(props.places.map((p) => [p.latitude, p.longitude] as [number, number]))
    map.fitBounds(bounds.pad(0.2))
  }
}

onMounted(() => {
  if (!containerRef.value) return

  map = L.map(containerRef.value, {
    center: [props.centerLat ?? -14.235, props.centerLng ?? -51.9253],
    zoom: props.zoom ?? 4,
    scrollWheelZoom: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  if (props.editable) {
    map.on('click', (event: L.LeafletMouseEvent) => {
      emit('mapClick', event.latlng.lat, event.latlng.lng)
    })
  }

  renderMarkers()
})

watch(
  () => [props.places, props.selectedPlaceId, props.showRoute],
  () => renderMarkers(),
  { deep: true },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.couple-map-canvas {
  width: 100%;
  height: 100%;
  min-height: 320px;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  border: 1px solid var(--border);
}

:deep(.map-pin__dot) {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e11d7a;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

:deep(.map-pin--selected .map-pin__dot) {
  background: #7c3aed;
  transform: scale(1.1);
}
</style>
