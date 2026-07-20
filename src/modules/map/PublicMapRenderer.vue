<template>
  <div class="public-map" :data-style="map?.map_style ?? 'default'">
    <section v-if="loading" class="public-state">
      <span class="public-spinner" aria-hidden="true" />
      <p>Carregando mapa...</p>
    </section>

    <section v-else-if="error" class="public-state public-state--error">
      <h1>Mapa indisponível</h1>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="map">
      <header class="public-map__hero">
        <p class="public-map__eyebrow">{{ map.couple_names }}</p>
        <h1>{{ map.title }}</h1>
        <p v-if="map.subtitle" class="public-map__subtitle">{{ map.subtitle }}</p>
      </header>

      <div class="public-map__canvas-wrap">
        <CoupleMapCanvas
          :places="map.places"
          :selected-place-id="selectedPlaceId"
          :center-lat="map.center_lat"
          :center-lng="map.center_lng"
          :zoom="map.default_zoom"
          :show-route="map.show_route"
          @select-place="selectPlace"
        />
      </div>

      <section v-if="selectedPlace" class="public-map__detail ml-card">
        <p class="public-map__detail-type">{{ placeTypeLabel(selectedPlace.place_type) }}</p>
        <h2>{{ selectedPlace.title }}</h2>
        <p v-if="selectedPlace.memory_date" class="public-map__date">{{ formatDate(selectedPlace.memory_date) }}</p>
        <p v-if="selectedPlace.description" class="public-map__description">{{ selectedPlace.description }}</p>
        <div v-if="selectedPlace.media?.length" class="public-map__media">
          <img
            v-for="item in selectedPlace.media"
            :key="item.id"
            :src="item.url || item.url_thumbnail || ''"
            alt=""
          />
        </div>
      </section>

      <section class="public-map__places">
        <h3>Nossa história em lugares</h3>
        <ul>
          <li v-for="place in map.places" :key="place.id">
            <button type="button" :class="{ active: place.id === selectedPlaceId }" @click="selectPlace(place.id)">
              <strong>{{ place.title }}</strong>
              <span>{{ place.city || place.address_label || placeTypeLabel(place.place_type) }}</span>
            </button>
          </li>
        </ul>
      </section>

      <footer class="public-foot">
        <RouterLink to="/register" class="public-foot__brand">Feito com <strong>MayLov</strong></RouterLink>
        <RouterLink to="/dashboard/maps/new" class="public-foot__cta">Crie seu mapa →</RouterLink>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchPublicMap, recordPublicMapView } from '@/api/maps'
import type { MapPlace, MapPlaceType, PublicCoupleMap } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import CoupleMapCanvas from './components/CoupleMapCanvas.vue'
import { MAP_PLACE_TYPE_LABELS } from './mapPlaceTypes'

const route = useRoute()
const map = ref<PublicCoupleMap | null>(null)
const loading = ref(true)
const error = ref('')
const selectedPlaceId = ref<string | null>(null)

const selectedPlace = computed(() =>
  map.value?.places.find((p) => p.id === selectedPlaceId.value) ?? null,
)

function placeTypeLabel(type: MapPlaceType): string {
  return MAP_PLACE_TYPE_LABELS[type]
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function selectPlace(placeId: string) {
  selectedPlaceId.value = placeId
}

function pickInitialPlace(places: MapPlace[]): string | null {
  const highlight = places.find((p) => p.is_highlight)
  return highlight?.id ?? places[0]?.id ?? null
}

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    map.value = await fetchPublicMap(slug)
    selectedPlaceId.value = pickInitialPlace(map.value.places)
    const sessionId = crypto.randomUUID()
    recordPublicMapView(slug, sessionId).catch(() => undefined)
  } catch (err) {
    error.value = resolveApiError(err, 'Este mapa não está disponível.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.public-map {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7fb 0%, #ffffff 40%);
  color: #1f2937;
  padding: 24px 16px 48px;
}
.public-map__hero {
  max-width: 960px;
  margin: 0 auto 20px;
  text-align: center;
}
.public-map__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #e11d7a;
  font-weight: 700;
}
.public-map__hero h1 {
  margin: 8px 0;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}
.public-map__subtitle {
  color: #6b7280;
}
.public-map__canvas-wrap {
  max-width: 960px;
  margin: 0 auto;
  height: min(62vh, 560px);
}
.public-map__detail {
  max-width: 960px;
  margin: 20px auto 0;
  padding: 20px;
}
.public-map__detail-type {
  color: #e11d7a;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}
.public-map__date {
  color: #6b7280;
  margin: 8px 0;
}
.public-map__description {
  line-height: 1.6;
}
.public-map__media {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 16px;
}
.public-map__media img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
}
.public-map__places {
  max-width: 960px;
  margin: 24px auto 0;
}
.public-map__places ul {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 8px;
}
.public-map__places button {
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #f3d0e3;
  background: #fff;
}
.public-map__places button.active {
  border-color: #e11d7a;
  box-shadow: inset 0 0 0 1px #e11d7a;
}
.public-map__places span {
  display: block;
  color: #6b7280;
  font-size: 0.85rem;
}
.public-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
}
.public-foot {
  max-width: 960px;
  margin: 32px auto 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.9rem;
}
.public-foot__brand {
  color: #6b7280;
}
.public-foot__cta {
  color: #e11d7a;
  font-weight: 700;
}
</style>
