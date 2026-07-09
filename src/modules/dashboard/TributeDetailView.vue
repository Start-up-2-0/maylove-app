<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard" class="back-link">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Voltar ao painel
    </RouterLink>

    <header class="detail-head">
      <div>
        <p class="eyebrow">Analytics</p>
        <h1 class="section-title">Desempenho da homenagem</h1>
      </div>
      <RouterLink
        v-if="stats && stats.status !== 'published'"
        :to="`/dashboard/tributes/${tributeId}/edit`"
        class="ml-btn ml-btn--secondary"
      >
        Continuar edição
      </RouterLink>
    </header>

    <section v-if="loading" class="ml-card state">Carregando estatísticas...</section>
    <section v-else-if="error" class="ml-card state state--error">{{ error }}</section>

    <template v-else-if="stats">
      <!-- Destaque de views -->
      <section class="hero-stat ml-card">
        <div class="hero-stat__main">
          <span class="hero-stat__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <div>
            <p class="hero-stat__label">Visualizações totais</p>
            <p class="hero-stat__value">{{ stats.views_count }}</p>
          </div>
        </div>
        <span class="ml-badge" :class="statusBadgeClass">{{ statusLabel }}</span>
      </section>

      <!-- Grid de metricas -->
      <section class="metrics">
        <article v-for="metric in metrics" :key="metric.label" class="ml-card metric">
          <span class="metric__icon" :style="{ background: metric.tint, color: metric.color }" v-html="metric.icon" />
          <p class="metric__value">{{ metric.value }}</p>
          <p class="metric__label">{{ metric.label }}</p>
        </article>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { fetchTributeStats } from '@/api/tributes'
import type { TributeStats } from '@/api/types'

const route = useRoute()
const tributeId = route.params.id as string
const stats = ref<TributeStats | null>(null)
const loading = ref(true)
const error = ref('')

const statusLabel = computed(() => {
  const status = stats.value?.status ?? ''
  return (
    ({
      draft: 'Rascunho',
      awaiting_payment: 'Aguardando pagamento',
      published: 'Publicada',
    }) as Record<string, string>
  )[status] ?? status
})

const statusBadgeClass = computed(() => {
  if (stats.value?.status === 'published') return 'ml-badge--success'
  if (stats.value?.status === 'awaiting_payment') return 'ml-badge--warning'
  return 'ml-badge--info'
})

const metrics = computed(() => {
  const s = stats.value
  if (!s) return []
  return [
    {
      label: 'Primeira view',
      value: formatDate(s.first_viewed_at),
      tint: 'var(--violet-soft)',
      color: 'var(--violet)',
      icon: iconClock,
    },
    {
      label: 'Última view',
      value: formatDate(s.last_viewed_at),
      tint: 'var(--primary-soft)',
      color: 'var(--primary-strong)',
      icon: iconClock,
    },
    {
      label: 'Fotos',
      value: String(s.photos_count),
      tint: 'var(--gold-soft)',
      color: 'var(--gold)',
      icon: iconImage,
    },
    {
      label: 'Vídeo',
      value: s.has_video ? 'Sim' : 'Não',
      tint: 'var(--info-soft)',
      color: 'var(--info)',
      icon: iconVideo,
    },
    {
      label: 'Música',
      value: s.has_music ? 'Sim' : 'Não',
      tint: 'var(--success-soft)',
      color: 'var(--success)',
      icon: iconMusic,
    },
    {
      label: 'Publicada em',
      value: formatDate(s.published_at),
      tint: 'var(--surface-3)',
      color: 'var(--muted)',
      icon: iconCalendar,
    },
  ]
})

const iconClock =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconImage =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-4 3 2 3-3 3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconVideo =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 10 4-2v8l-4-2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconMusic =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V5l10-2v13" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>'
const iconCalendar =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>'

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

.detail-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.hero-stat {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px;
  margin-bottom: 20px;
  background:
    radial-gradient(600px 200px at 100% 0%, var(--primary-softer), transparent 70%),
    var(--surface);
}
.hero-stat__main {
  display: flex;
  align-items: center;
  gap: 18px;
}
.hero-stat__icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 17px;
  color: #fff;
  background: linear-gradient(150deg, var(--primary-hover), var(--primary-strong));
  box-shadow: var(--shadow-primary);
}
.hero-stat__label {
  font-size: 0.85rem;
  color: var(--muted);
  font-weight: 500;
}
.hero-stat__value {
  font-family: var(--font-display);
  font-size: 2.8rem;
  font-weight: 600;
  line-height: 1;
  color: var(--ink);
  margin-top: 2px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.metric {
  padding: 22px;
}
.metric__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  margin-bottom: 14px;
}
.metric__value {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--ink);
}
.metric__label {
  font-size: 0.84rem;
  color: var(--muted);
  margin-top: 4px;
}

.state {
  padding: 28px;
  color: var(--muted);
}
.state--error {
  color: var(--error);
}
</style>
