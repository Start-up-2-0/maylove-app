<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard/bouquets" class="back-link">← Voltar aos buquês</RouterLink>
    <header class="new-head">
      <p class="eyebrow">Começar</p>
      <h1 class="section-title">Novo buquê digital</h1>
      <p class="text-muted">Monte flor por flor, escolha o embrulho e escreva a carta — como um presente físico.</p>
    </header>

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
  display: inline-block;
  margin-bottom: 16px;
  color: var(--muted);
  text-decoration: none;
}

.new-head {
  margin-bottom: 24px;
}
</style>
