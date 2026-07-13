<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard/albums" class="back-link">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Voltar aos álbuns
    </RouterLink>

    <header class="new-head">
      <p class="eyebrow">Começar</p>
      <h1 class="section-title">Novo Memory Book</h1>
      <p class="text-muted">
        Monte um livro editorial personalizável — capa, cores e páginas sob seu controle.
      </p>
    </header>

    <div class="ml-card step-card">
      <div class="hero-style">
        <span class="hero-style__emoji" aria-hidden="true">📖</span>
        <div>
          <h2 class="step-title">{{ memoryBook.name }}</h2>
          <p class="text-muted step-desc">{{ memoryBook.description }}</p>
        </div>
      </div>

      <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>

      <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating" @click="create">
        <span v-if="creating" class="ml-spinner ml-spinner--sm" />
        {{ creating ? 'Criando álbum...' : 'Criar Memory Book' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createAlbum } from '@/api/albums'
import { resolveApiError } from '@/api/errors'
import { BOOK_PRESENTATIONS, DEFAULT_BOOK_PRESENTATION } from './book/presentations'

const router = useRouter()
const memoryBook = BOOK_PRESENTATIONS[0] ?? {
  id: DEFAULT_BOOK_PRESENTATION,
  name: 'Memory Book',
  description: 'Livro editorial personalizável.',
  emoji: '📖',
}
const creating = ref(false)
const error = ref('')

async function create() {
  creating.value = true
  error.value = ''
  try {
    const album = await createAlbum()
    await router.replace({
      path: `/dashboard/albums/${album.id}/edit`,
      query: { step: 'basics' },
    })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível criar o álbum.')
    creating.value = false
  }
}

onMounted(() => {
  // Mantém página estável; criação sob demanda no botão.
})
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
  margin-bottom: 24px;
}

.step-card {
  padding: clamp(20px, 3vw, 28px);
  max-width: 560px;
}

.hero-style {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 22px;
}

.hero-style__emoji {
  font-size: 2rem;
  line-height: 1;
}

.step-title {
  font-size: 1.15rem;
  font-weight: 600;
}
.step-desc {
  margin-top: 4px;
  font-size: 0.9rem;
}
</style>
