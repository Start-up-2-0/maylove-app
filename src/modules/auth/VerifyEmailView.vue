<template>
  <div class="page auth-page">
    <div class="shell auth-shell card">
      <p class="eyebrow">MayLove</p>
      <h1>Confirmar e-mail</h1>
      <p v-if="loading" class="subtitle">Validando seu link...</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <p v-else class="success">E-mail confirmado! Redirecionando para o dashboard...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    loading.value = false
    error.value = 'Link de verificação inválido.'
    return
  }

  try {
    await auth.verifyEmail(token)
    await router.replace('/dashboard')
  } catch {
    error.value = 'Não foi possível confirmar o e-mail. Solicite um novo link.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.auth-page {
  display: grid;
  place-items: center;
}

.auth-shell {
  width: min(460px, 100%);
  padding: 36px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  font-weight: 700;
}

.subtitle,
.success {
  margin-top: 12px;
  color: var(--muted);
}

.success {
  color: #1f7a45;
}
</style>
