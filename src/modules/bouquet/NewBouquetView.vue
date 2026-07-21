<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard/bouquets" class="back-link">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Voltar aos buquês
    </RouterLink>

    <header class="new-head">
      <p class="eyebrow">Começar</p>
      <h1 class="section-title">Novo buquê digital</h1>
      <p class="text-muted">
        Monte flor por flor, escolha o embrulho e escreva a carta — como um presente físico.
      </p>
    </header>

    <div class="model-grid">
      <div class="style-card style-card--active">
        <span class="style-card__emoji" aria-hidden="true">💐</span>
        <div>
          <h2 class="style-card__title">Buquê com carta</h2>
          <p class="style-card__tagline">Presente emocional</p>
          <p class="style-card__desc">
            Escolha até 7 flores com significado, personalize o embrulho e escreva uma carta para acompanhar o buquê.
          </p>
        </div>
      </div>
    </div>

    <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>

    <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating" @click="create">
      <span v-if="creating" class="ml-spinner ml-spinner--sm" />
      {{ creating ? 'Criando buquê...' : 'Criar buquê' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createBouquet } from '@/api/bouquets'
import { resolveApiError } from '@/api/errors'

const router = useRouter()
const creating = ref(false)
const error = ref('')

async function create() {
  creating.value = true
  error.value = ''
  try {
    const bouquet = await createBouquet({ title: 'Meu buquê digital' })
    await router.push(`/dashboard/bouquets/${bouquet.id}/edit`)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível criar o buquê.')
  } finally {
    creating.value = false
  }
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

.new-head {
  margin-bottom: 22px;
}

.model-grid {
  display: grid;
  gap: 14px;
  max-width: 640px;
  margin-bottom: 20px;
}

.style-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  padding: 18px 20px;
  text-align: left;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: #fff;
}

.style-card--active {
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 55%, #fff);
  box-shadow: 0 8px 24px -16px color-mix(in srgb, var(--primary) 30%, transparent);
}

.style-card__emoji {
  font-size: 1.6rem;
  line-height: 1;
}

.style-card__title {
  margin: 0 0 2px;
  font-size: 1.1rem;
}

.style-card__tagline {
  margin: 0 0 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary-strong, var(--primary));
}

.style-card__desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}
</style>
