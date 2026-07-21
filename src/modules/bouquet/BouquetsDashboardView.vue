<template>
  <div class="view bouquet-dash ml-fade-up">
    <header class="bouquet-dash__head">
      <div>
        <p class="eyebrow">Buquês</p>
        <h1 class="section-title">Seus buquês digitais</h1>
        <p class="text-muted">Monte flor por flor, escreva a carta e compartilhe um presente emocionante.</p>
      </div>
      <RouterLink to="/dashboard/bouquets/new" class="ml-btn ml-btn--primary ml-btn--lg">Novo buquê</RouterLink>
    </header>

    <div v-if="loading" class="text-muted">Carregando...</div>
    <div v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</div>

    <div v-else-if="!bouquets.length" class="ml-card empty">
      <span class="empty__glyph">💐</span>
      <h2>Seu primeiro buquê</h2>
      <p class="text-muted">Escolha flores com significado e escreva uma carta que emociona.</p>
      <RouterLink to="/dashboard/bouquets/new" class="ml-btn ml-btn--primary">Começar</RouterLink>
    </div>

    <section v-else class="bouquet-grid">
      <article v-for="item in bouquets" :key="item.id" class="bouquet-card ml-card">
        <RouterLink :to="`/dashboard/bouquets/${item.id}/edit`" class="bouquet-card__link">
          <span class="bouquet-card__emoji">💐</span>
          <div>
            <h2>{{ item.title }}</h2>
            <p class="text-muted">
              {{ item.stems_count }} flores · {{ statusLabel(item.status) }}
            </p>
          </div>
        </RouterLink>
        <div class="bouquet-card__actions">
          <button
            v-if="item.status === 'published'"
            type="button"
            class="ml-btn ml-btn--secondary ml-btn--sm"
            @click="copyLink(item)"
          >
            {{ copiedId === item.id ? 'Copiado' : 'Copiar link' }}
          </button>
          <button
            type="button"
            class="ml-btn ml-btn--secondary ml-btn--sm"
            :disabled="deletingId === item.id"
            @click="remove(item.id)"
          >
            Excluir
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { deleteBouquet, listBouquets } from '@/api/bouquets'
import type { DigitalBouquetSummary } from '@/api/types'
import { resolveApiError } from '@/api/errors'

const bouquets = ref<DigitalBouquetSummary[]>([])
const loading = ref(true)
const error = ref('')
const deletingId = ref<string | null>(null)
const copiedId = ref<string | null>(null)

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    bouquets.value = await listBouquets()
  } catch {
    error.value = 'Não foi possível carregar os buquês.'
  } finally {
    loading.value = false
  }
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    awaiting_payment: 'Aguardando pagamento',
    published: 'Publicado',
    archived: 'Arquivado',
  }
  return labels[status] ?? status
}

async function copyLink(item: DigitalBouquetSummary) {
  const url = `${window.location.origin}/bouquet/${item.slug}`
  await navigator.clipboard.writeText(url)
  copiedId.value = item.id
  setTimeout(() => {
    copiedId.value = null
  }, 2000)
}

async function remove(id: string) {
  if (!confirm('Excluir este buquê?')) return
  deletingId.value = id
  try {
    await deleteBouquet(id)
    bouquets.value = bouquets.value.filter((b) => b.id !== id)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível excluir.')
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.bouquet-dash__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.bouquet-grid {
  display: grid;
  gap: 14px;
}

.bouquet-card {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.bouquet-card__link {
  display: flex;
  gap: 14px;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.bouquet-card__emoji {
  font-size: 28px;
}

.bouquet-card__link h2 {
  margin: 0 0 4px;
  font-size: 1.05rem;
}

.bouquet-card__actions {
  display: flex;
  gap: 8px;
}

.empty {
  text-align: center;
  padding: 40px 24px;
}

.empty__glyph {
  font-size: 40px;
}
</style>
