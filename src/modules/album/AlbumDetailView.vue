<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard/albums" class="back-link">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Voltar aos álbuns
    </RouterLink>

    <header class="detail-head">
      <div>
        <p class="eyebrow">Analytics</p>
        <h1 class="section-title">{{ albumTitle }}</h1>
        <p v-if="albumMeta" class="detail-head__meta text-muted">{{ albumMeta }}</p>
        <p v-if="publicPath" class="detail-head__slug text-muted">{{ publicPath }}</p>
      </div>
      <div class="detail-head__actions">
        <RouterLink
          v-if="album && album.status !== 'published'"
          :to="`/dashboard/albums/${albumId}/edit`"
          class="ml-btn ml-btn--secondary"
        >
          Continuar edição
        </RouterLink>
        <button
          v-if="album?.status === 'published'"
          type="button"
          class="ml-btn ml-btn--secondary"
          @click="copyPublicLink"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {{ copied ? 'Link copiado' : 'Copiar link' }}
        </button>
        <a
          v-if="album?.status === 'published' && publicUrl"
          :href="publicUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-btn ml-btn--secondary"
        >
          Abrir página
        </a>
        <button type="button" class="ml-btn ml-btn--danger" @click="confirmDelete">
          Excluir
        </button>
      </div>
    </header>

    <section v-if="loading" class="ml-card state">Carregando estatísticas...</section>
    <section v-else-if="error" class="ml-card state state--error">{{ error }}</section>

    <template v-else-if="album">
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
            <p class="hero-stat__value">{{ album.views_count }}</p>
          </div>
        </div>
        <span class="ml-badge" :class="statusBadgeClass">{{ statusLabel }}</span>
      </section>

      <section class="metrics">
        <article v-for="metric in metrics" :key="metric.label" class="ml-card metric">
          <span class="metric__icon" :style="{ background: metric.tint, color: metric.color }" v-html="metric.icon" />
          <p class="metric__value">{{ metric.value }}</p>
          <p class="metric__label">{{ metric.label }}</p>
        </article>
      </section>
    </template>

    <Teleport to="body">
      <div v-if="deleteOpen" class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div class="delete-modal__backdrop" @click="cancelDelete" />
        <div class="delete-modal__panel ml-card">
          <h2 id="delete-title" class="delete-modal__title">Excluir álbum?</h2>
          <p class="text-muted delete-modal__text">
            <strong>{{ albumTitle }}</strong>
            será removido permanentemente, incluindo fotos, músicas e demais arquivos armazenados.
          </p>
          <p v-if="deleteError" class="delete-modal__error">{{ deleteError }}</p>
          <div class="delete-modal__actions">
            <button type="button" class="ml-btn ml-btn--secondary" :disabled="deleting" @click="cancelDelete">
              Cancelar
            </button>
            <button type="button" class="ml-btn ml-btn--danger" :disabled="deleting" @click="executeDelete">
              <span v-if="deleting" class="ml-spinner ml-spinner--sm" />
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
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { deleteAlbum, fetchAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { getBookPresentation } from '@/modules/album/book/presentations'

const route = useRoute()
const router = useRouter()
const albumId = route.params.id as string
const album = ref<AlbumDetail | null>(null)
const loading = ref(true)
const error = ref('')
const copied = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)
const deleteError = ref('')

const albumTitle = computed(() => album.value?.title || 'Desempenho do álbum')

const albumMeta = computed(() => {
  const item = album.value
  if (!item) return ''
  const style = getBookPresentation(item.presentation)?.name ?? 'Livro digital'
  return `${style} · ${item.photo_count} foto(s)`
})

const publicPath = computed(() => (album.value?.slug ? `/a/${album.value.slug}` : ''))

const publicUrl = computed(() =>
  album.value?.slug ? `${window.location.origin}/a/${album.value.slug}` : '',
)

const statusLabel = computed(() => {
  const status = album.value?.status ?? ''
  return (
    ({
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado',
    }) as Record<string, string>
  )[status] ?? status
})

const statusBadgeClass = computed(() => {
  if (album.value?.status === 'published') return 'ml-badge--success'
  return 'ml-badge--info'
})

const metrics = computed(() => {
  const item = album.value
  if (!item) return []
  const hasMusic = (item.media ?? []).some((m) => m.media_type === 'audio')
  return [
    {
      label: 'Fotos',
      value: String(item.photo_count),
      tint: 'var(--gold-soft)',
      color: 'var(--gold)',
      icon: iconImage,
    },
    {
      label: 'Música',
      value: hasMusic ? 'Sim' : 'Não',
      tint: 'var(--success-soft)',
      color: 'var(--success)',
      icon: iconMusic,
    },
    {
      label: 'Estilo',
      value: getBookPresentation(item.presentation)?.name ?? '—',
      tint: 'var(--violet-soft)',
      color: 'var(--violet)',
      icon: iconBook,
    },
    {
      label: 'Publicado em',
      value: formatDate(item.published_at),
      tint: 'var(--surface-3)',
      color: 'var(--muted)',
      icon: iconCalendar,
    },
    {
      label: 'Criado em',
      value: formatDate(item.created_at),
      tint: 'var(--primary-soft)',
      color: 'var(--primary-strong)',
      icon: iconCalendar,
    },
    {
      label: 'Atualizado em',
      value: formatDate(item.updated_at),
      tint: 'var(--info-soft)',
      color: 'var(--info)',
      icon: iconClock,
    },
  ]
})

const iconClock =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconImage =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-4 3 2 3-3 3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconMusic =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V5l10-2v13" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>'
const iconBook =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>'
const iconCalendar =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>'

onMounted(async () => {
  try {
    album.value = await fetchAlbum(albumId)
  } catch {
    error.value = 'Não foi possível carregar as estatísticas.'
  } finally {
    loading.value = false
  }
})

async function copyPublicLink() {
  if (!publicUrl.value || album.value?.status !== 'published') return
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Clipboard pode falhar em contextos inseguros.
  }
}

function confirmDelete() {
  deleteError.value = ''
  deleteOpen.value = true
}

function cancelDelete() {
  if (deleting.value) return
  deleteOpen.value = false
  deleteError.value = ''
}

async function executeDelete() {
  deleting.value = true
  deleteError.value = ''
  try {
    await deleteAlbum(albumId)
    await router.push('/dashboard/albums')
  } catch {
    deleteError.value = 'Não foi possível excluir o álbum. Tente novamente.'
  } finally {
    deleting.value = false
  }
}

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
.detail-head__meta {
  margin-top: 8px;
  font-size: 0.92rem;
}
.detail-head__slug {
  margin-top: 4px;
  font-size: 0.88rem;
  font-family: var(--font-sans);
}
.detail-head__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-stat {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px;
  margin-bottom: 20px;
  background: color-mix(in srgb, var(--primary-softer) 55%, var(--surface));
  border-color: color-mix(in srgb, var(--primary) 12%, var(--border));
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
  background: var(--primary);
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
</style>
