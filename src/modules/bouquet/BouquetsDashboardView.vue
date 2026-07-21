<template>
  <div class="view bouq-dash ml-fade-up">
    <header class="bouq-dash__head">
      <div>
        <p class="eyebrow">Buquês</p>
        <h1 class="section-title">Seus buquês digitais</h1>
        <p class="text-muted bouq-dash__sub">
          Monte flor por flor, escreva a carta e compartilhe um presente emocionante.
        </p>
      </div>
      <RouterLink to="/dashboard/bouquets/new" class="ml-btn ml-btn--primary ml-btn--lg">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Novo buquê
      </RouterLink>
    </header>

    <div v-if="!loading && !error && rawBouquets.length" class="dash-filters">
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

    <section v-if="loading" class="bouq-grid">
      <div v-for="n in 3" :key="n" class="bouq-card bouq-card--skeleton">
        <div class="skeleton skeleton--cover" />
        <div class="bouq-card__body">
          <div class="skeleton skeleton--line w-24" />
          <div class="skeleton skeleton--line w-full" />
        </div>
      </div>
    </section>

    <div v-else-if="error" class="ml-card state state--error">
      <p>{{ error }}</p>
      <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else-if="rawBouquets.length === 0" class="ml-card empty">
      <span class="empty__glyph" aria-hidden="true">💐</span>
      <h2>Seu primeiro buquê</h2>
      <p class="text-muted">Escolha flores com significado e escreva uma carta que emociona.</p>
      <RouterLink to="/dashboard/bouquets/new" class="ml-btn ml-btn--primary ml-btn--lg">
        Começar agora
      </RouterLink>
    </div>

    <section v-else class="bouq-grid">
      <article v-for="item in filteredBouquets" :key="item.id" class="bouq-card">
        <RouterLink :to="bouquetLink(item)" class="bouq-card__media">
          <div class="bouq-card__cover" :style="coverStyle(item.wrap_color)">
            <span class="bouq-card__emoji" aria-hidden="true">💐</span>
            <span class="bouq-card__stem-count">{{ item.stems_count }} flores</span>
          </div>
          <span class="ml-badge bouq-card__badge" :class="badgeClass(item.status)">
            {{ statusLabel(item.status) }}
          </span>
        </RouterLink>

        <div class="bouq-card__body">
          <RouterLink :to="bouquetLink(item)" class="bouq-card__title-link">
            <h2 class="bouq-card__title">{{ item.title || 'Sem título' }}</h2>
          </RouterLink>
          <p class="bouq-card__meta">
            {{ item.stems_count }} {{ item.stems_count === 1 ? 'flor' : 'flores' }}
            · {{ formatDate(item.published_at || item.created_at) }}
          </p>
        </div>

        <div class="bouq-card__foot">
          <RouterLink :to="bouquetLink(item)" class="bouq-card__cta">
            {{ item.status === 'published' ? 'Ver buquê' : 'Continuar edição' }}
          </RouterLink>
          <div class="bouq-card__actions">
            <button
              type="button"
              class="bouq-card__action"
              :disabled="item.status !== 'published'"
              :title="item.status === 'published' ? 'Copiar link público' : 'Disponível após publicar'"
              @click="copyLink(item)"
            >
              {{ copiedId === item.id ? 'Copiado' : 'Copiar' }}
            </button>
            <button
              type="button"
              class="bouq-card__action bouq-card__action--danger"
              :disabled="deletingId === item.id"
              @click="confirmDelete(item)"
            >
              <span v-if="deletingId === item.id" class="ml-spinner ml-spinner--xs" />
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
          <h2 id="delete-title" class="delete-modal__title">Excluir buquê?</h2>
          <p class="text-muted delete-modal__text">
            <strong>{{ deleteTarget.title || 'Sem título' }}</strong>
            será removido permanentemente.
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
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { deleteBouquet, listBouquets } from '@/api/bouquets'
import type { BouquetWrapColor, DigitalBouquetSummary } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import { useModalLifecycle } from '@/composables/useModalLifecycle'

const rawBouquets = ref<DigitalBouquetSummary[]>([])
const loading = ref(true)
const error = ref('')
const activeFilter = ref<'all' | 'draft' | 'published'>('all')
const copiedId = ref<string | null>(null)
const deleteTarget = ref<DigitalBouquetSummary | null>(null)
const deletingId = ref<string | null>(null)
const deleteError = ref('')

const filterOptions = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'draft' as const, label: 'Rascunhos' },
  { value: 'published' as const, label: 'Publicados' },
]

const filteredBouquets = computed(() => {
  if (activeFilter.value === 'all') return rawBouquets.value
  if (activeFilter.value === 'published') {
    return rawBouquets.value.filter((b) => b.status === 'published')
  }
  return rawBouquets.value.filter((b) => b.status !== 'published')
})

function countFor(filter: 'all' | 'draft' | 'published') {
  if (filter === 'all') return rawBouquets.value.length
  if (filter === 'published') return rawBouquets.value.filter((b) => b.status === 'published').length
  return rawBouquets.value.filter((b) => b.status !== 'published').length
}

function bouquetLink(item: DigitalBouquetSummary) {
  if (item.status === 'published') {
    return `/bouquet/${item.slug}`
  }
  return `/dashboard/bouquets/${item.id}/edit`
}

function statusLabel(status: DigitalBouquetSummary['status']) {
  if (status === 'published') return 'Publicado'
  if (status === 'awaiting_payment') return 'Pagamento'
  if (status === 'archived') return 'Arquivado'
  return 'Rascunho'
}

function badgeClass(status: DigitalBouquetSummary['status']) {
  if (status === 'published') return 'ml-badge--success'
  if (status === 'awaiting_payment') return 'ml-badge--warn'
  return 'ml-badge--muted'
}

function coverStyle(wrap: BouquetWrapColor) {
  const palettes: Record<BouquetWrapColor, [string, string]> = {
    blush: ['#f2d4cf', '#d9a8a0'],
    cream: ['#f5efe3', '#dcc9ad'],
    burgundy: ['#8f3a4a', '#4a1420'],
  }
  const [from, to] = palettes[wrap] ?? palettes.blush
  return { background: `linear-gradient(145deg, ${from}, ${to})` }
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
    rawBouquets.value = await listBouquets()
  } catch {
    error.value = 'Não foi possível carregar os buquês.'
  } finally {
    loading.value = false
  }
}

async function copyLink(item: DigitalBouquetSummary) {
  if (item.status !== 'published') return
  const url = `${window.location.origin}/bouquet/${item.slug}`
  try {
    await navigator.clipboard.writeText(url)
    copiedId.value = item.id
    window.setTimeout(() => {
      if (copiedId.value === item.id) copiedId.value = null
    }, 1800)
  } catch {
    /* ignore */
  }
}

function confirmDelete(item: DigitalBouquetSummary) {
  deleteError.value = ''
  deleteTarget.value = item
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
    await deleteBouquet(deleteTarget.value.id)
    rawBouquets.value = rawBouquets.value.filter((item) => item.id !== deleteTarget.value?.id)
    deleteTarget.value = null
  } catch (err) {
    deleteError.value = resolveApiError(err, 'Não foi possível excluir.')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.bouq-dash__head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 28px;
}

.bouq-dash__sub {
  max-width: 40rem;
  margin-top: 6px;
}

.dash-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.bouq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: clamp(18px, 3vw, 28px);
}

.bouq-card {
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

.bouq-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 48px -28px rgba(28, 24, 20, 0.42);
}

.bouq-card__media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface-3);
}

.bouq-card__cover {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.bouq-card__emoji {
  font-size: 2.8rem;
  line-height: 1;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.12));
}

.bouq-card__stem-count {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
}

.bouq-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
}

.bouq-card__body {
  padding: 16px 18px 10px;
}

.bouq-card__title-link {
  text-decoration: none;
  color: inherit;
}

.bouq-card__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ink);
}

.bouq-card__meta {
  margin: 6px 0 0;
  font-size: 0.86rem;
  color: var(--muted);
}

.bouq-card__foot {
  margin-top: auto;
  padding: 0 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.bouq-card__cta {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--primary-strong);
  text-decoration: none;
}

.bouq-card__cta:hover {
  text-decoration: underline;
}

.bouq-card__actions {
  display: flex;
  gap: 10px;
}

.bouq-card__action {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}

.bouq-card__action:hover:not(:disabled) {
  color: var(--ink);
}

.bouq-card__action--danger:hover:not(:disabled) {
  color: var(--error);
}

.bouq-card__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bouq-card--skeleton .bouq-card__body {
  padding: 16px 18px;
}

.empty {
  text-align: center;
  padding: 40px 24px;
}

.empty__glyph {
  font-size: 40px;
}

.delete-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
}

.delete-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(20, 12, 16, 0.45);
}

.delete-modal__panel {
  position: relative;
  width: min(420px, 100%);
  padding: 22px;
}

.delete-modal__title {
  margin: 0 0 8px;
  font-size: 1.2rem;
}

.delete-modal__text {
  margin: 0;
  line-height: 1.5;
}

.delete-modal__error {
  margin: 12px 0 0;
  color: var(--error);
  font-size: 0.88rem;
}

.delete-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
</style>
