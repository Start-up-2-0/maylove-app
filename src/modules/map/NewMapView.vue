<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard/maps" class="back-link">← Voltar aos mapas</RouterLink>
    <header class="new-head">
      <h1 class="section-title">Novo Mapa do Casal</h1>
      <p class="text-muted">Produto independente — marque lugares especiais no mapa.</p>
    </header>
    <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>
    <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating" @click="create">
      <span v-if="creating" class="ml-spinner ml-spinner--sm" />
      {{ creating ? 'Criando...' : 'Criar mapa' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createMap } from '@/api/maps'
import { resolveApiError } from '@/api/errors'

const router = useRouter()
const creating = ref(false)
const error = ref('')

async function create() {
  creating.value = true
  error.value = ''
  try {
    const map = await createMap()
    await router.replace({ path: `/dashboard/maps/${map.id}/edit`, query: { step: 'basics' } })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível criar o mapa.')
    creating.value = false
  }
}
</script>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--muted);
  font-weight: 600;
}
.new-head {
  margin-bottom: 24px;
}
</style>
