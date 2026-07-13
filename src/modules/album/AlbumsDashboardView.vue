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

    <section v-if="loading" class="grid-cards">
      <div v-for="n in 3" :key="n" class="ml-card skeleton-card">
        <div class="skeleton skeleton--banner" />
      </div>
    </section>

    <div v-else-if="error" class="ml-card state state--error">
      <p>{{ error }}</p>
      <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else-if="!albums.length" class="ml-card state">
      <h2>Nenhum álbum ainda</h2>
      <p class="text-muted">Crie seu primeiro álbum de memórias em poucos passos.</p>
      <RouterLink to="/dashboard/albums/new" class="ml-btn ml-btn--primary">Criar álbum</RouterLink>
    </div>

    <section v-else class="grid-cards">
      <article v-for="album in albums" :key="album.id" class="ml-card album-card">
        <div class="album-card__banner" :style="{ background: album.color_primary || 'var(--accent)' }">
          <span class="album-card__badge">{{ statusLabel(album.status) }}</span>
        </div>
        <div class="album-card__body">
          <h2 class="album-card__title">{{ album.title || 'Sem título' }}</h2>
          <p v-if="album.subtitle" class="album-card__sub text-muted">{{ album.subtitle }}</p>
          <p class="album-card__meta text-muted">
            {{ album.photo_count }} foto(s) · {{ album.views_count }} visualizações
          </p>
          <div class="album-card__actions">
            <RouterLink :to="`/dashboard/albums/${album.id}/edit`" class="ml-btn ml-btn--secondary ml-btn--sm">
              Editar
            </RouterLink>
            <a
              v-if="album.status === 'published'"
              :href="publicUrl(album.slug)"
              target="_blank"
              rel="noopener"
              class="ml-btn ml-btn--ghost ml-btn--sm"
            >
              Ver público
            </a>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listAlbums } from '@/api/albums'
import type { AlbumSummary } from '@/api/types'
import { resolveApiError } from '@/api/errors'

const albums = ref<AlbumSummary[]>([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    albums.value = await listAlbums()
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível carregar os álbuns.')
  } finally {
    loading.value = false
  }
}

function statusLabel(status: string): string {
  if (status === 'published') return 'Publicado'
  if (status === 'archived') return 'Arquivado'
  return 'Rascunho'
}

function publicUrl(slug: string): string {
  return `/a/${slug}`
}

onMounted(load)
</script>

<style scoped>
.dash-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.dash-head__sub {
  margin-top: 6px;
  max-width: 520px;
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.album-card__banner {
  height: 120px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  position: relative;
}

.album-card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.album-card__body {
  padding: 16px;
}

.album-card__title {
  font-size: 1.05rem;
  margin: 0 0 4px;
}

.album-card__sub {
  margin: 0 0 8px;
  font-size: 0.9rem;
}

.album-card__meta {
  font-size: 0.85rem;
  margin-bottom: 14px;
}

.album-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.state {
  padding: 32px;
  text-align: center;
}

.state--error {
  border-color: var(--danger-border);
}
</style>
