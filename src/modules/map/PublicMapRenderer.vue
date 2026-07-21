<template>
  <div class="public-map-page">
    <section v-if="loading" class="public-state">
      <span class="public-spinner" aria-hidden="true" />
      <p>Preparando a jornada...</p>
    </section>

    <section v-else-if="error" class="public-state public-state--error">
      <h1>Mapa indisponível</h1>
      <p>{{ error }}</p>
    </section>

    <MapExperienceView v-else-if="map" :map="map" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicMap, recordPublicMapView } from '@/api/maps'
import type { PublicCoupleMap } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import MapExperienceView from './MapExperienceView.vue'

const route = useRoute()
const map = ref<PublicCoupleMap | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    map.value = await fetchPublicMap(slug)
    recordPublicMapView(slug, crypto.randomUUID()).catch(() => undefined)
  } catch (err) {
    error.value = resolveApiError(err, 'Este mapa não está disponível.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.public-map-page {
  min-height: 100vh;
}
.public-state {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
}
.public-state--error h1 {
  margin: 0 0 8px;
}
</style>
