<template>
  <div class="view map-dash ml-fade-up">
    <header class="map-dash__head">
      <div>
        <p class="eyebrow">Mapas</p>
        <h1 class="section-title">Seus mapas do casal</h1>
        <p class="text-muted map-dash__sub">
          Marque no mapa os lugares da história de vocês — cada pin vira uma mini homenagem para reviver juntos.
        </p>
      </div>
      <RouterLink
        v-if="loading || error || rawMaps.length > 0"
        to="/dashboard/maps/new"
        class="ml-btn ml-btn--primary ml-btn--lg"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Novo mapa
      </RouterLink>
    </header>

    <div v-if="!loading && !error && rawMaps.length" class="dash-filters">
      <label class="dash-search"><span class="sr-only">Buscar mapas</span><input v-model.trim="search" type="search" placeholder="Buscar por título ou casal" /></label>
      <label class="dash-sort"><span>Ordenar</span><select v-model="sortBy"><option value="created_desc">Mais recentes</option><option value="created_asc">Mais antigos</option><option value="views_desc">Mais visualizados</option><option value="title_asc">Título (A–Z)</option></select></label>
      <button
        v-for="option in filterOptions"
        :key="option.value"
        class="ml-chip"
        :class="{ 'ml-chip--active': activeFilter === option.value }"
        @click="activeFilter = option.value"
      >
        {{ option.label }}
        <span class="ml-chip__count">{{ countFor(option.value) }}</span>
      </button>
    </div>

    <section v-if="loading" class="map-grid">
      <div v-for="n in 3" :key="n" class="map-card map-card--skeleton">
        <div class="skeleton skeleton--cover" />
        <div class="map-card__body">
          <div class="skeleton skeleton--line w-24" />
          <div class="skeleton skeleton--line w-full" />
        </div>
      </div>
    </section>

    <div v-else-if="error" class="ml-card state state--error">
      <p>{{ error }}</p>
      <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else-if="rawMaps.length === 0" class="ml-card empty">
      <span class="empty__glyph" aria-hidden="true">🗺️</span>
      <h2>Seu primeiro mapa espera por vocês</h2>
      <p class="text-muted">Registre viagens, encontros e marcos — e compartilhe a jornada do casal.</p>
      <RouterLink to="/dashboard/maps/new" class="ml-btn ml-btn--primary ml-btn--lg">
        Começar agora
      </RouterLink>
    </div>

    <div v-else-if="filteredMaps.length === 0" class="ml-card empty">
      <span class="empty__glyph" aria-hidden="true">🔎</span>
      <h2>Nenhum mapa neste filtro</h2>
      <p class="text-muted">Tente outro termo ou ajuste o status.</p>
      <button type="button" class="ml-btn ml-btn--secondary" @click="clearFilters">
        Limpar filtros
      </button>
    </div>

    <section v-else class="map-grid">
      <article v-for="map in filteredMaps" :key="map.id" class="map-card">
        <RouterLink :to="mapLink(map)" class="map-card__media">
          <div class="map-card__cover" :style="coverStyle(map)" />
          <span class="ml-badge map-card__badge" :class="badgeClass(map.status)">
            {{ statusLabel(map.status) }}
          </span>
          <span class="map-card__views">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {{ map.views_count }}
          </span>
        </RouterLink>

        <div class="map-card__body">
          <RouterLink :to="mapLink(map)" class="map-card__title-link">
            <h2 class="map-card__title">{{ map.title || 'Sem título' }}</h2>
          </RouterLink>
          <p v-if="map.couple_names" class="map-card__desc">{{ map.couple_names }}</p>
          <p class="map-card__meta">
            {{ map.places_count }} {{ map.places_count === 1 ? 'local' : 'locais' }}
            · {{ formatDate(map.published_at || map.created_at) }}
          </p>
        </div>

        <div class="map-card__foot">
          <RouterLink :to="mapLink(map)" class="map-card__cta">
            {{ map.status === 'published' ? 'Ver mapa' : 'Continuar edição' }}
          </RouterLink>
          <div class="map-card__actions">
            <button
              type="button"
              class="map-card__action"
              :disabled="map.status !== 'published'"
              :title="map.status === 'published' ? 'Copiar link público' : 'Disponível após publicar'"
              @click="copyPublicLink(map)"
            >
              {{ copiedId === map.id ? 'Copiado' : 'Copiar' }}
            </button>
            <button
              type="button"
              class="map-card__action map-card__action--danger"
              :disabled="deletingId === map.id"
              @click="confirmDelete(map)"
            >
              <span v-if="deletingId === map.id" class="ml-spinner ml-spinner--xs" />
              <template v-else>Excluir</template>
            </button>
          </div>
        </div>
      </article>
    </section>

    <Teleport to="body">
      <div v-if="deleteTarget" class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div class="delete-modal__backdrop" @click="cancelDelete" />
        <div class="delete-modal__panel ml-card">
          <h2 id="delete-title" class="delete-modal__title">Excluir mapa?</h2>
          <p class="text-muted delete-modal__text">
            <strong>{{ deleteTarget.title || 'Sem título' }}</strong>
            será removido permanentemente, incluindo locais e mídias.
          </p>
          <p v-if="deleteError" class="delete-modal__error">{{ deleteError }}</p>
          <div class="delete-modal__actions">
            <button type="button" class="ml-btn ml-btn--secondary" :disabled="deletingId !== null" @click="cancelDelete">
              Cancelar
            </button>
            <button type="button" class="ml-btn ml-btn--danger" :disabled="deletingId !== null" @click="executeDelete">
              <span v-if="deletingId" class="ml-spinner ml-spinner--sm" />
              Excluir definitivamente
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { deleteMap, listMaps } from '@/api/maps'
import type { CoupleMapStatus, CoupleMapSummary } from '@/api/types'
import { useModalLifecycle } from '@/composables/useModalLifecycle'

const rawMaps = ref<CoupleMapSummary[]>([])
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const activeFilter = ref<'all' | 'draft' | 'published'>(route.query.status === 'draft' || route.query.status === 'published' ? route.query.status : 'all')
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const sortBy = ref(typeof route.query.sort === 'string' ? route.query.sort : 'created_desc')
const copiedId = ref<string | null>(null)
const deleteTarget = ref<CoupleMapSummary | null>(null)
const deletingId = ref<string | null>(null)
const deleteError = ref('')

const filterOptions = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'draft' as const, label: 'Rascunhos' },
  { value: 'published' as const, label: 'Publicados' },
]

const filteredMaps = computed(() => {
  const term = search.value.toLocaleLowerCase('pt-BR')
  const result = rawMaps.value.filter((map) => {
    const status = activeFilter.value === 'all' || (activeFilter.value === 'published' ? map.status === 'published' : map.status !== 'published')
    const text = [map.title, map.couple_names, map.slug].some((value) => value?.toLocaleLowerCase('pt-BR').includes(term))
    return status && (!term || text)
  })
  return result.sort((a, b) => sortBy.value === 'created_asc' ? a.created_at.localeCompare(b.created_at) : sortBy.value === 'views_desc' ? b.views_count - a.views_count || b.created_at.localeCompare(a.created_at) : sortBy.value === 'title_asc' ? (a.title || '').localeCompare(b.title || '', 'pt-BR') : b.created_at.localeCompare(a.created_at))
})

watch([activeFilter, search, sortBy], ([status, q, sort]) => void router.replace({ query: { status: status === 'all' ? undefined : status, q: q || undefined, sort: sort === 'created_desc' ? undefined : sort } }))
function clearFilters() { activeFilter.value = 'all'; search.value = ''; sortBy.value = 'created_desc' }

function countFor(filter: 'all' | 'draft' | 'published') {
  if (filter === 'all') return rawMaps.value.length
  if (filter === 'published') return rawMaps.value.filter((m) => m.status === 'published').length
  return rawMaps.value.filter((m) => m.status !== 'published').length
}

function mapLink(map: CoupleMapSummary) {
  return map.status === 'published'
    ? `/map/${map.slug}`
    : `/dashboard/maps/${map.id}/edit`
}

function statusLabel(status: CoupleMapStatus) {
  if (status === 'published') return 'Publicado'
  if (status === 'awaiting_payment') return 'Pagamento'
  if (status === 'archived') return 'Arquivado'
  return 'Rascunho'
}

function badgeClass(status: CoupleMapStatus) {
  if (status === 'published') return 'ml-badge--success'
  if (status === 'awaiting_payment') return 'ml-badge--warn'
  return 'ml-badge--muted'
}

function coverStyle(map: CoupleMapSummary) {
  const accent = map.map_style === 'romantic' ? '#e11d7a' : '#c45d7a'
  return {
    background: `linear-gradient(145deg, ${accent}, color-mix(in srgb, ${accent} 35%, #1c1814))`,
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    rawMaps.value = await listMaps()
  } catch {
    error.value = 'Não foi possível carregar seus mapas.'
  } finally {
    loading.value = false
  }
}

async function copyPublicLink(map: CoupleMapSummary) {
  if (map.status !== 'published') return
  const url = `${window.location.origin}/map/${map.slug}`
  try {
    await navigator.clipboard.writeText(url)
    copiedId.value = map.id
    window.setTimeout(() => {
      if (copiedId.value === map.id) copiedId.value = null
    }, 1800)
  } catch {
    /* ignore */
  }
}

function confirmDelete(map: CoupleMapSummary) {
  deleteError.value = ''
  deleteTarget.value = map
}

function cancelDelete() {
  if (deletingId.value) return
  deleteTarget.value = null
  deleteError.value = ''
}

useModalLifecycle(deleteTarget, cancelDelete)

async function executeDelete() {
  if (!deleteTarget.value) return
  deletingId.value = deleteTarget.value.id
  deleteError.value = ''
  try {
    await deleteMap(deleteTarget.value.id)
    rawMaps.value = rawMaps.value.filter((item) => item.id !== deleteTarget.value?.id)
    deleteTarget.value = null
  } catch {
    deleteError.value = 'Não foi possível excluir o mapa.'
  } finally {
    deletingId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.map-dash__head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 28px;
}

.map-dash__sub {
  max-width: 40rem;
  margin-top: 6px;
}

.dash-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.dash-search { flex: 1 1 260px; }
.dash-search input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); color: var(--ink); font: inherit; }
.dash-sort { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: .82rem; }
.dash-sort select { padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); color: var(--ink); }

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: clamp(18px, 3vw, 28px);
}

.map-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
  box-shadow: 0 18px 40px -34px rgba(28, 24, 20, 0.45);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.map-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 48px -28px rgba(28, 24, 20, 0.42);
}

.map-card__media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface-3);
}

.map-card__cover {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 2.4rem;
}

.map-card__cover::after {
  content: '📍';
  opacity: 0.35;
  font-size: 3rem;
}

.map-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
}

.map-card__views {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
}

.map-card__body {
  padding: 14px 16px 8px;
  display: grid;
  gap: 6px;
}

.map-card__title-link {
  text-decoration: none;
  color: inherit;
}

.map-card__title {
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.2;
}

.map-card__desc {
  margin: 0;
  font-size: 0.88rem;
  color: var(--muted);
}

.map-card__meta {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}

.map-card__foot {
  margin-top: auto;
  padding: 10px 16px 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  border-top: 1px solid var(--border);
}

.map-card__cta {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--accent, #c45d7a);
  text-decoration: none;
}

.map-card__actions {
  display: flex;
  gap: 8px;
}

.map-card__action {
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 0.78rem;
  cursor: pointer;
}

.map-card__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.map-card__action--danger:hover:not(:disabled) {
  color: var(--error, #b42318);
}

.map-card--skeleton {
  pointer-events: none;
}

.skeleton--cover {
  aspect-ratio: 4 / 3;
  width: 100%;
}

.empty,
.state {
  text-align: center;
  padding: 48px 24px;
  display: grid;
  gap: 12px;
  justify-items: center;
}

.empty__glyph {
  font-size: 2rem;
}

.delete-modal {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 20px;
}

.delete-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.delete-modal__panel {
  position: relative;
  z-index: 1;
  width: min(420px, 100%);
  padding: 22px;
  display: grid;
  gap: 12px;
}

.delete-modal__title {
  margin: 0;
  font-size: 1.2rem;
}

.delete-modal__text {
  margin: 0;
}

.delete-modal__error {
  margin: 0;
  color: var(--error, #b42318);
}

.delete-modal__actions {
  display: flex;
  justify-content: end;
  gap: 10px;
}
</style>
