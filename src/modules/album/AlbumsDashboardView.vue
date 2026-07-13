<template>
  <div class="view ml-fade-up">
    <header class="dash-head">
      <div>
        <p class="eyebrow">Álbuns digitais</p>
        <h1 class="section-title">Seus álbuns</h1>
        <p class="text-muted dash-head__sub">
          Monte livros digitais de memórias, independentes das homenagens, e compartilhe com quem você ama.
        </p>
      </div>
      <RouterLink to="/dashboard/albums/new" class="ml-btn ml-btn--primary ml-btn--lg">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Novo álbum
      </RouterLink>
    </header>

    <section class="stats-row" aria-label="Resumo">
      <article v-for="stat in stats" :key="stat.label" class="ml-card stat">
        <span class="stat__icon" :style="{ background: stat.tint, color: stat.color }" v-html="stat.icon" />
        <div class="stat__body">
          <span class="stat__value">{{ stat.value }}</span>
          <span class="stat__label">{{ stat.label }}</span>
        </div>
      </article>
    </section>

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

    <section v-if="loading" class="grid-cards">
      <div v-for="n in 3" :key="n" class="ml-card skeleton-card">
        <div class="skeleton skeleton--banner" />
        <div class="skeleton-card__body">
          <div class="skeleton skeleton--line w-24" />
          <div class="skeleton skeleton--line w-full" />
          <div class="skeleton skeleton--line w-32" />
        </div>
      </div>
    </section>

    <div v-else-if="error" class="ml-card state state--error">
      <p>{{ error }}</p>
      <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else-if="rawAlbums.length === 0" class="ml-card empty">
      <span class="empty__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M4 8h16M8 3v5M16 3v5" stroke-linecap="round" />
        </svg>
      </span>
      <h2>Seu primeiro livro de memórias espera por você</h2>
      <p class="text-muted">Transforme fotos e histórias em um presente digital cheio de carinho.</p>
      <RouterLink to="/dashboard/albums/new" class="ml-btn ml-btn--primary ml-btn--lg">
        Começar agora
      </RouterLink>
    </div>

    <section v-else class="grid-cards">
      <article
        v-for="album in filteredAlbums"
        :key="album.id"
        class="ml-card ml-card--interactive tribute-card"
      >
        <RouterLink :to="albumLink(album)" class="tribute-card__link">
          <div class="tribute-card__banner" :style="bannerStyle(album)">
            <span class="ml-badge tribute-card__badge" :class="badgeClass(album.status)">
              {{ statusLabel(album.status) }}
            </span>
            <span class="tribute-card__views">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {{ album.views_count }}
            </span>
          </div>
          <div class="tribute-card__body">
            <h2 class="tribute-card__title">{{ album.title || 'Sem título' }}</h2>
            <p class="tribute-card__meta">{{ formatAlbumMeta(album) }}</p>
            <p class="tribute-card__slug">/a/{{ album.slug }}</p>
          </div>
        </RouterLink>

        <div class="tribute-card__foot">
          <RouterLink :to="albumLink(album)" class="tribute-card__cta">
            {{ album.status === 'published' ? 'Ver analytics' : 'Continuar edição' }}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <div class="tribute-card__actions">
            <button
              type="button"
              class="tribute-card__action"
              :class="{ 'tribute-card__action--done': copiedId === album.id }"
              :disabled="album.status !== 'published'"
              :title="album.status === 'published' ? 'Copiar link público' : 'Disponível após publicar'"
              @click="copyPublicLink(album)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {{ copiedId === album.id ? 'Copiado' : 'Copiar' }}
            </button>

            <button
              type="button"
              class="tribute-card__action tribute-card__action--danger"
              title="Excluir álbum"
              :disabled="deletingId === album.id"
              @click="confirmDelete(album)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ deletingId === album.id ? 'Excluindo...' : 'Excluir' }}
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
            será removido permanentemente, incluindo fotos, músicas e demais arquivos armazenados.
          </p>
          <p v-if="deleteError" class="delete-modal__error">{{ deleteError }}</p>
          <div class="delete-modal__actions">
            <button type="button" class="ml-btn ml-btn--secondary" :disabled="deletingId !== null" @click="cancelDelete">
              Cancelar
            </button>
            <button
              type="button"
              class="ml-btn ml-btn--danger"
              :disabled="deletingId !== null"
              @click="executeDelete"
            >
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
import { getBookPresentation } from '@/modules/album/book/presentations'

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

const stats = computed(() => {
  const total = rawAlbums.value.length
  const published = rawAlbums.value.filter((a) => a.status === 'published').length
  const drafts = total - published
  const views = rawAlbums.value.reduce((sum, a) => sum + a.views_count, 0)
  return [
    {
      label: 'Álbuns',
      value: total,
      tint: 'var(--primary-soft)',
      color: 'var(--primary-strong)',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16" stroke-linecap="round"/></svg>',
    },
    {
      label: 'Publicados',
      value: published,
      tint: 'var(--success-soft)',
      color: 'var(--success)',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'Rascunhos',
      value: drafts,
      tint: 'var(--red-soft)',
      color: 'var(--red)',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      label: 'Views totais',
      value: views,
      tint: 'var(--rose-soft)',
      color: 'var(--primary)',
      icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    },
  ]
})

function countFor(value: 'all' | 'draft' | 'published'): number {
  if (value === 'all') return rawAlbums.value.length
  if (value === 'published') return rawAlbums.value.filter((a) => a.status === 'published').length
  return rawAlbums.value.filter((a) => a.status !== 'published').length
}

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    rawAlbums.value = await listAlbums()
  } catch {
    error.value = 'Não foi possível carregar seus álbuns.'
  } finally {
    loading.value = false
  }
}

function albumLink(album: AlbumSummary): string {
  return album.status === 'published'
    ? `/dashboard/albums/${album.id}`
    : `/dashboard/albums/${album.id}/edit`
}

function bannerStyle(album: AlbumSummary): Record<string, string> {
  return { background: album.color_primary || '#c45d7a' }
}

function formatAlbumMeta(album: AlbumSummary): string {
  const style = getBookPresentation(album.presentation)?.name ?? 'Livro digital'
  return `${style} · ${album.photo_count} foto(s)`
}

function statusLabel(status: string): string {
  return (
    ({
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado',
    }) as Record<string, string>
  )[status] ?? status
}

function badgeClass(status: string): string {
  if (status === 'published') return 'ml-badge--success'
  return 'ml-badge--info'
}

function publicUrl(album: AlbumSummary): string {
  return `${window.location.origin}/a/${album.slug}`
}

async function copyPublicLink(album: AlbumSummary) {
  if (album.status !== 'published') return
  try {
    await navigator.clipboard.writeText(publicUrl(album))
    copiedId.value = album.id
    window.setTimeout(() => {
      if (copiedId.value === album.id) copiedId.value = null
    }, 2000)
  } catch {
    // Clipboard pode falhar em contextos inseguros.
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

async function executeDelete() {
  if (!deleteTarget.value) return
  deletingId.value = deleteTarget.value.id
  deleteError.value = ''
  try {
    await deleteAlbum(deleteTarget.value.id)
    rawAlbums.value = rawAlbums.value.filter((item) => item.id !== deleteTarget.value?.id)
    deleteTarget.value = null
  } catch {
    deleteError.value = 'Não foi possível excluir o álbum. Tente novamente.'
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.dash-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}
.dash-head__sub {
  margin-top: 8px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--surface);
  border-color: color-mix(in srgb, var(--primary) 8%, var(--border));
}
.stat__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  flex-shrink: 0;
}
.stat__body {
  display: flex;
  flex-direction: column;
}
.stat__value {
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1;
}
.stat__label {
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 4px;
}

.dash-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}
.ml-chip__count {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 0.72rem;
  background: var(--surface-3);
  color: var(--muted);
}
.ml-chip--active .ml-chip__count {
  background: color-mix(in srgb, var(--primary) 22%, white);
  color: var(--primary-strong);
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.tribute-card {
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.tribute-card__link {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  color: inherit;
}
.tribute-card__banner {
  position: relative;
  height: 96px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.tribute-card__badge {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
}
.tribute-card__views {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary-strong);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(4px);
}
.tribute-card__body {
  padding: 16px 18px 10px;
  flex: 1;
}
.tribute-card__title {
  font-size: 1.12rem;
  font-weight: 600;
  color: var(--ink);
}
.tribute-card__meta {
  margin-top: 6px;
  font-size: 0.86rem;
  color: var(--muted);
}
.tribute-card__slug {
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--subtle);
  font-family: var(--font-sans);
}
.tribute-card__foot {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  flex-shrink: 0;
  padding: 12px 18px 18px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}
@media (min-width: 360px) {
  .tribute-card__foot {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }
}
.tribute-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-strong);
  transition: gap var(--dur) var(--ease);
}
.tribute-card:hover .tribute-card__cta {
  gap: 11px;
}
.tribute-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
  width: 100%;
  justify-content: flex-end;
}
@media (min-width: 360px) {
  .tribute-card__actions {
    width: auto;
  }
}
.tribute-card__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--ink);
  font-size: 0.8rem;
  font-weight: 600;
  transition:
    background var(--dur) var(--ease),
    color var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.tribute-card__action:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--border-strong);
  background: var(--surface-3);
}
.tribute-card__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.tribute-card__action--done {
  color: var(--success);
  border-color: color-mix(in srgb, var(--success) 35%, var(--border));
}
.tribute-card__action--danger:hover:not(:disabled) {
  color: var(--error);
  border-color: color-mix(in srgb, var(--error) 35%, var(--border));
  background: color-mix(in srgb, var(--error) 8%, var(--surface-2));
}

.delete-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
}
.delete-modal__backdrop {
  position: absolute;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(3px);
}
.delete-modal__panel {
  position: relative;
  width: min(100%, 440px);
  padding: 24px;
}
.delete-modal__title {
  font-size: 1.2rem;
  margin-bottom: 10px;
}
.delete-modal__text {
  line-height: 1.55;
}
.delete-modal__error {
  margin-top: 12px;
  color: var(--error);
  font-size: 0.9rem;
}
.delete-modal__actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.state {
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}
.state--error {
  color: var(--error);
}

.empty {
  padding: 56px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: color-mix(in srgb, var(--primary-softer) 50%, var(--surface));
  border-color: color-mix(in srgb, var(--primary) 14%, var(--border));
}
.empty__glyph {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border-radius: 20px;
  margin-bottom: 8px;
  color: var(--primary-strong);
  background: var(--primary-soft);
}
.empty h2 {
  font-size: 1.35rem;
}
.empty .ml-btn {
  margin-top: 12px;
}

.skeleton-card {
  overflow: hidden;
  padding: 0;
}
.skeleton-card__body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skeleton {
  background: linear-gradient(90deg, var(--surface-3) 25%, var(--bg-tint) 37%, var(--surface-3) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 8px;
}
.skeleton--banner {
  height: 96px;
  border-radius: 0;
}
.skeleton--line {
  height: 12px;
}
.w-24 {
  width: 96px;
}
.w-32 {
  width: 132px;
}
.w-full {
  width: 100%;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}

@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .dash-head .ml-btn {
    width: 100%;
  }
}
</style>
