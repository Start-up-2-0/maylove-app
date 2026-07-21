<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard/maps" class="back-link">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Voltar aos mapas
    </RouterLink>

    <header class="new-head">
      <p class="eyebrow">Começar</p>
      <h1 class="section-title">Novo mapa do casal</h1>
      <p class="text-muted">
        Marque lugares especiais, monte a jornada cronológica e compartilhe uma experiência cinematográfica.
      </p>
    </header>

    <div class="model-grid">
      <button
        v-for="model in MAP_MODELS"
        :key="model.id"
        type="button"
        class="style-card"
        :class="{ 'style-card--active': selectedModelId === model.id }"
        @click="selectedModelId = model.id"
      >
        <span class="style-card__emoji" aria-hidden="true">{{ model.emoji }}</span>
        <div>
          <h2 class="style-card__title">{{ model.name }}</h2>
          <p class="style-card__tagline">{{ model.tagline }}</p>
          <p class="style-card__desc">{{ model.description }}</p>
        </div>
      </button>
    </div>

    <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>

    <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating" @click="create">
      <span v-if="creating" class="ml-spinner ml-spinner--sm" />
      {{ creating ? 'Criando mapa...' : 'Criar mapa' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createMap, updateMap } from '@/api/maps'
import { resolveApiError } from '@/api/errors'

const MAP_MODELS = [
  {
    id: 'couple',
    name: 'Mapa do Casal',
    tagline: 'Onde o amor deixou marcas',
    description:
      'Pins georreferenciados com fotos, cartas e emoções — explore, linha do tempo ou globo 3D.',
    emoji: '🗺️',
    title: 'Nosso mapa do casal',
    couple_names: 'Nós dois',
    map_style: 'romantic',
  },
] as const

const router = useRouter()
const creating = ref(false)
const error = ref('')
const selectedModelId = ref<(typeof MAP_MODELS)[number]['id']>('couple')

async function create() {
  const model = MAP_MODELS.find((m) => m.id === selectedModelId.value) ?? MAP_MODELS[0]
  creating.value = true
  error.value = ''
  try {
    const map = await createMap()
    await updateMap(map.id, {
      title: model.title,
      couple_names: model.couple_names,
      map_style: model.map_style,
      show_route: true,
    })
    await router.replace({ path: `/dashboard/maps/${map.id}/edit`, query: { step: 'basics' } })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível criar o mapa.')
    creating.value = false
  }
}
</script>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 16px;
  transition: color var(--dur) var(--ease);
}
.back-link:hover {
  color: var(--primary-strong);
}

.new-head {
  margin-bottom: 22px;
}

.model-grid {
  display: grid;
  gap: 14px;
  max-width: 640px;
  margin-bottom: 20px;
}

.style-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  padding: 18px 20px;
  text-align: left;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.style-card:hover {
  border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
}

.style-card--active {
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 55%, #fff);
  box-shadow: 0 8px 24px -16px color-mix(in srgb, var(--primary) 30%, transparent);
}

.style-card__emoji {
  font-size: 1.6rem;
  line-height: 1;
}

.style-card__title {
  margin: 0 0 2px;
  font-size: 1.1rem;
}

.style-card__tagline {
  margin: 0 0 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary-strong, var(--primary));
}

.style-card__desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}
</style>
