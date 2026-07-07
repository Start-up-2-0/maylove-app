<template>
  <div class="page">
    <div class="shell">
      <header class="topbar">
        <div>
          <RouterLink class="back" to="/dashboard">← Dashboard</RouterLink>
          <RouterLink
            v-if="stats && stats.status !== 'published'"
            class="back edit-link"
            :to="`/dashboard/tributes/${tributeId}/edit`"
          >
            Continuar edição
          </RouterLink>
          <h1>Analytics da homenagem</h1>
        </div>
      </header>

      <section v-if="loading" class="state">Carregando estatísticas...</section>
      <section v-else-if="error" class="state error">{{ error }}</section>
      <section v-else-if="stats" class="stats-grid">
        <article class="card stat-card">
          <p class="label">Visualizações</p>
          <p class="value">{{ stats.views_count }}</p>
        </article>
        <article class="card stat-card">
          <p class="label">Primeira view</p>
          <p class="value small">{{ formatDate(stats.first_viewed_at) }}</p>
        </article>
        <article class="card stat-card">
          <p class="label">Última view</p>
          <p class="value small">{{ formatDate(stats.last_viewed_at) }}</p>
        </article>
        <article class="card stat-card">
          <p class="label">Fotos</p>
          <p class="value">{{ stats.photos_count }}</p>
        </article>
        <article class="card stat-card">
          <p class="label">Vídeo</p>
          <p class="value small">{{ stats.has_video ? 'Sim' : 'Não' }}</p>
        </article>
        <article class="card stat-card">
          <p class="label">Música</p>
          <p class="value small">{{ stats.has_music ? 'Sim' : 'Não' }}</p>
        </article>
        <article class="card stat-card wide">
          <p class="label">Publicada em</p>
          <p class="value small">{{ formatDate(stats.published_at) }}</p>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { fetchTributeStats } from '@/api/tributes'
import type { TributeStats } from '@/api/types'

const route = useRoute()
const tributeId = route.params.id as string
const stats = ref<TributeStats | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    stats.value = await fetchTributeStats(tributeId)
  } catch {
    error.value = 'Não foi possível carregar as estatísticas.'
  } finally {
    loading.value = false
  }
})

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<style scoped>
.topbar {
  margin-bottom: 24px;
}

.back {
  display: inline-block;
  margin-bottom: 12px;
  color: var(--muted);
  text-decoration: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 22px;
}

.stat-card.wide {
  grid-column: 1 / -1;
}

.label {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 0.9rem;
}

.value {
  margin: 0;
  font-size: 2.4rem;
  font-family: 'Fraunces', Georgia, serif;
}

.value.small {
  font-size: 1.2rem;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.state {
  color: var(--muted);
}
</style>
