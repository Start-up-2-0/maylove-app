<template>
  <AuthLayout>
    <div class="verify">
      <span class="verify__icon" :class="iconClass" aria-hidden="true">
        <svg v-if="loading" class="verify__spin" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4">
          <path d="M21 12a9 9 0 1 1-6.2-8.6" stroke-linecap="round" />
        </svg>
        <svg v-else-if="error" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 8v5M12 16h.01" stroke-linecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <h1 class="auth-title">Confirmar e-mail</h1>
      <p v-if="loading" class="text-muted verify__msg">Validando seu link de confirmação...</p>
      <p v-else-if="error" class="auth-alert auth-alert--error verify__msg">{{ error }}</p>
      <p v-else class="auth-alert auth-alert--success verify__msg">
        E-mail confirmado! Redirecionando para o painel...
      </p>

      <RouterLink v-if="error" to="/login" class="ml-btn ml-btn--secondary verify__back">
        Voltar para o login
      </RouterLink>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')

const iconClass = computed(() => {
  if (loading.value) return 'verify__icon--loading'
  if (error.value) return 'verify__icon--error'
  return 'verify__icon--success'
})

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
.verify {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.verify__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  margin-bottom: 20px;
}
.verify__icon--loading {
  color: var(--primary-strong);
  background: var(--primary-soft);
}
.verify__icon--error {
  color: var(--error);
  background: var(--error-soft);
}
.verify__icon--success {
  color: var(--success);
  background: var(--success-soft);
}
.verify__spin {
  animation: verify-spin 0.9s linear infinite;
}
@keyframes verify-spin {
  to {
    transform: rotate(360deg);
  }
}
.auth-title {
  font-size: 1.9rem;
}
.verify__msg {
  margin-top: 14px;
}
.auth-alert {
  border-radius: var(--radius-md);
  padding: 11px 14px;
  font-size: 0.9rem;
  font-weight: 500;
}
.auth-alert--error {
  background: var(--error-soft);
  color: var(--error);
}
.auth-alert--success {
  background: var(--success-soft);
  color: var(--success);
}
.verify__back {
  margin-top: 22px;
}
</style>
