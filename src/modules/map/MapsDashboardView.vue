<template>
  <div class="view ml-fade-up">
    <header class="dash-head">
      <div>
        <p class="eyebrow">Mapas</p>
        <h1 class="section-title">Mapas do Casal</h1>
        <p class="text-muted">Registre lugares marcantes da história de vocês.</p>
      </div>
      <RouterLink to="/dashboard/maps/new" class="ml-btn ml-btn--primary ml-btn--lg">
        Novo mapa
      </RouterLink>
    </header>

    <section v-if="loading" class="grid-cards">
      <div v-for="n in 3" :key="n" class="ml-card skeleton-card">
        <div class="skeleton skeleton--banner" />
        <div class="skeleton-card__body">
          <div class="skeleton skeleton--line w-24" />
          <div class="skeleton skeleton--line w-full" />
        </div>
      </div>
    </section>

    <div v-else-if="error" class="ml-card state state--error">
      <p>{{ error }}</p>
      <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else-if="maps.length === 0" class="ml-card empty">
      <h2>Seu primeiro mapa</h2>
      <p class="text-muted">Marque no mapa onde a história de vocês aconteceu.</p>
      <RouterLink to="/dashboard/maps/new" class="ml-btn ml-btn--primary ml-btn--lg">Criar mapa</RouterLink>
    </div>

    <section v-else class="grid-cards">
      <article v-for="map in maps" :key="map.id" class="ml-card map-card">
        <div class="map-card__head">
          <span class="map-card__status" :data-status="map.status">{{ statusLabel(map.status) }}</span>
          <h2>{{ map.title }}</h2>
          <p class="text-muted">{{ map.couple_names }}</p>
        </div>
        <p class="map-card__meta">{{ map.places_count }} locais · {{ map.views_count }} views</p>
        <div class="map-card__actions">
          <RouterLink
            :to="map.status === 'published' ? `/map/${map.slug}` : `/dashboard/maps/${map.id}/edit`"
            class="ml-btn ml-btn--secondary ml-btn--sm"
          >
            {{ map.status === 'published' ? 'Ver público' : 'Continuar' }}
          </RouterLink>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listMaps } from '@/api/maps'
import { resolveApiError } from '@/api/errors'
import type { CoupleMapSummary, CoupleMapStatus } from '@/api/types'

const maps = ref<CoupleMapSummary[]>([])
const loading = ref(true)
const error = ref('')

function statusLabel(status: CoupleMapStatus): string {
  const labels: Record<CoupleMapStatus, string> = {
    draft: 'Rascunho',
    awaiting_payment: 'Aguardando pagamento',
    published: 'Publicado',
    archived: 'Arquivado',
  }
  return labels[status]
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    maps.value = await listMaps()
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível carregar seus mapas.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.dash-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.map-card__head h2 {
  margin: 8px 0 4px;
  font-size: 1.1rem;
}
.map-card__status {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
}
.map-card__meta {
  margin: 12px 0;
  font-size: 0.88rem;
  color: var(--muted);
}
.map-card__actions {
  display: flex;
  gap: 8px;
}
.empty {
  padding: 32px;
  text-align: center;
}
</style>
