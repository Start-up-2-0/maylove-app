<template>
  <div class="view gal-dash ml-fade-up">
    <header class="gal-dash__head">
      <div>
        <p class="eyebrow">Galeria</p>
        <h1 class="section-title">Seus álbuns</h1>
        <p class="text-muted gal-dash__sub">
          Coleções de memórias em formato de galeria fotográfica — elegantes para criar e emocionantes para compartilhar.
        </p>
      </div>
      <RouterLink to="/dashboard/albums/new" class="ml-btn ml-btn--primary ml-btn--lg">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Novo álbum
      </RouterLink>
    </header>

    <div v-if="!loading && !error && rawAlbums.length" class="dash-filters">
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

    <section v-if="loading" class="gal-grid">
      <div v-for="n in 3" :key="n" class="gal-card gal-card--skeleton">
        <div class="skeleton skeleton--cover" />
        <div class="gal-card__body">
          <div class="skeleton skeleton--line w-24" />
          <div class="skeleton skeleton--line w-full" />
        </div>
      </div>
    </section>

    <div v-else-if="error" class="ml-card state state--error">
      <p>{{ error }}</p>
      <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else-if="rawAlbums.length === 0" class="ml-card empty">
      <span class="empty__glyph" aria-hidden="true">🖼️</span>
      <h2>Sua primeira galeria espera por você</h2>
      <p class="text-muted">Organize fotos como um portfólio profissional e compartilhe com carinho.</p>
      <RouterLink to="/dashboard/albums/new" class="ml-btn ml-btn--primary ml-btn--lg">
        Começar agora
      </RouterLink>
    </div>

    <section v-else class="gal-grid">
      <article v-for="album in filteredAlbums" :key="album.id" class="gal-card">
        <RouterLink :to="albumLink(album)" class="gal-card__media">
          <img
            v-if="album.cover_url"
            :src="album.cover_url"
            :alt="album.title || 'Capa do álbum'"
            class="gal-card__cover"
            loading="lazy"
          />
          <div v-else class="gal-card__cover gal-card__cover--empty" :style="emptyCoverStyle(album)" />
          <span class="ml-badge gal-card__badge" :class="badgeClass(album.status)">
            {{ statusLabel(album.status) }}
          </span>
          <div v-if="album.preview_thumbs?.length" class="gal-card__thumbs" aria-hidden="true">
            <img
              v-for="(thumb, i) in album.preview_thumbs.slice(0, 3)"
              :key="`${album.id}-t-${i}`"
              :src="thumb"
              alt=""
              loading="lazy"
            />
          </div>
        </RouterLink>

        <div class="gal-card__body">
          <RouterLink :to="albumLink(album)" class="gal-card__title-link">
            <h2 class="gal-card__title">{{ album.title || 'Sem título' }}</h2>
          </RouterLink>
          <p v-if="album.subtitle" class="gal-card__desc">{{ album.subtitle }}</p>
          <p class="gal-card__meta">
            {{ album.photo_count }} {{ album.photo_count === 1 ? 'foto' : 'fotos' }}
            · {{ formatDate(album.published_at || album.created_at) }}
          </p>
        </div>

        <div class="gal-card__foot">
          <RouterLink :to="albumLink(album)" class="gal-card__cta">
            {{ album.status === 'published' ? 'Ver analytics' : 'Continuar edição' }}
          </RouterLink>
          <div class="gal-card__actions">
            <button
              type="button"
              class="gal-card__action"
              :disabled="album.status !== 'published'"
              :title="album.status === 'published' ? 'Copiar link público' : 'Disponível após publicar'"
              @click="copyPublicLink(album)"
            >
              {{ copiedId === album.id ? 'Copiado' : 'Copiar' }}
            </button>
            <button
              type="button"
              class="gal-card__action gal-card__action--danger"
              :disabled="deletingId === album.id"
              @click="confirmDelete(album)"
            >
              <span v-if="deletingId === album.id" class="ml-spinner ml-spinner--xs" />
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
          <h2 id="delete-title" class="delete-modal__title">Excluir álbum?</h2>
          <p class="text-muted delete-modal__text">
            <strong>{{ deleteTarget.title || 'Sem título' }}</strong>
            será removido permanentemente, incluindo fotos e arquivos.
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
import { deleteAlbum, listAlbums } from '@/api/albums'
import type { AlbumSummary } from '@/api/types'
import { useModalLifecycle } from '@/composables/useModalLifecycle'

const rawAlbums = ref<AlbumSummary[]>([])
const loading = ref(true)
const error = ref('')
const activeFilter = ref<'all' | 'draft' | 'published'>('all')
const copiedId = ref<string | null>(null)
const deleteTarget = ref<AlbumSummary | null>(null)
const deletingId = ref<string | null>(null)
const deleteError = ref('')

const filterOptions = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'draft' as const, label: 'Rascunhos' },
  { value: 'published' as const, label: 'Publicados' },
]

const filteredAlbums = computed(() => {
  if (activeFilter.value === 'all') return rawAlbums.value
  if (activeFilter.value === 'published') {
    return rawAlbums.value.filter((a) => a.status === 'published')
  }
  return rawAlbums.value.filter((a) => a.status !== 'published')
})

function countFor(filter: 'all' | 'draft' | 'published') {
  if (filter === 'all') return rawAlbums.value.length
  if (filter === 'published') return rawAlbums.value.filter((a) => a.status === 'published').length
  return rawAlbums.value.filter((a) => a.status !== 'published').length
}

function albumLink(album: AlbumSummary) {
  return album.status === 'published'
    ? `/dashboard/albums/${album.id}`
    : `/dashboard/albums/${album.id}/edit`
}

function statusLabel(status: AlbumSummary['status']) {
  if (status === 'published') return 'Publicado'
  if (status === 'awaiting_payment') return 'Pagamento'
  if (status === 'archived') return 'Arquivado'
  return 'Rascunho'
}

function badgeClass(status: AlbumSummary['status']) {
  if (status === 'published') return 'ml-badge--success'
  if (status === 'awaiting_payment') return 'ml-badge--warn'
  return 'ml-badge--muted'
}

function emptyCoverStyle(album: AlbumSummary) {
  return {
    background: `linear-gradient(145deg, ${album.color_primary || '#c45d7a'}, color-mix(in srgb, ${album.color_primary || '#c45d7a'} 40%, #1c1814))`,
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
    rawAlbums.value = await listAlbums()
  } catch {
    error.value = 'Não foi possível carregar os álbuns.'
  } finally {
    loading.value = false
  }
}

async function copyPublicLink(album: AlbumSummary) {
  if (album.status !== 'published') return
  const url = `${window.location.origin}/a/${album.slug}`
  try {
    await navigator.clipboard.writeText(url)
    copiedId.value = album.id
    window.setTimeout(() => {
      if (copiedId.value === album.id) copiedId.value = null
    }, 1800)
  } catch {
    /* ignore */
  }
}

function confirmDelete(album: AlbumSummary) {
  deleteError.value = ''
  deleteTarget.value = album
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
    await deleteAlbum(deleteTarget.value.id)
    rawAlbums.value = rawAlbums.value.filter((item) => item.id !== deleteTarget.value?.id)
    deleteTarget.value = null
  } catch {
    deleteError.value = 'Não foi possível excluir o álbum.'
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.gal-dash__head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 28px;
}

.gal-dash__sub {
  max-width: 40rem;
  margin-top: 6px;
}

.dash-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.gal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: clamp(18px, 3vw, 28px);
}

.gal-card {
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

.gal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 48px -28px rgba(28, 24, 20, 0.42);
}

.gal-card__media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface-3);
}

.gal-card__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 420ms ease;
}

.gal-card:hover .gal-card__cover {
  transform: scale(1.04);
}

.gal-card__cover--empty {
  width: 100%;
  height: 100%;
}

.gal-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
}

.gal-card__thumbs {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  gap: 4px;
}

.gal-card__thumbs img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 16px -10px rgba(0, 0, 0, 0.5);
}

.gal-card__body {
  padding: 14px 16px 8px;
  display: grid;
  gap: 6px;
}

.gal-card__title-link {
  text-decoration: none;
  color: inherit;
}

.gal-card__title {
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.2;
}

.gal-card__desc {
  margin: 0;
  font-size: 0.88rem;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gal-card__meta {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}

.gal-card__foot {
  margin-top: auto;
  padding: 10px 16px 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  border-top: 1px solid var(--border);
}

.gal-card__cta {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--accent, #c45d7a);
  text-decoration: none;
}

.gal-card__actions {
  display: flex;
  gap: 8px;
}

.gal-card__action {
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 0.78rem;
  cursor: pointer;
}

.gal-card__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gal-card__action--danger:hover:not(:disabled) {
  color: var(--error, #b42318);
}

.gal-card--skeleton {
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
