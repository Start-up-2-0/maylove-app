<template>
  <AuthLayout>
    <p class="eyebrow">Bem-vindo de volta</p>
    <h1 class="auth-title">Entrar</h1>
    <p class="text-muted auth-sub">Acesse seu painel e gerencie suas homenagens.</p>

    <form class="auth-form" @submit.prevent="submit">
      <div class="ml-field">
        <label class="ml-label" for="email">E-mail</label>
        <input
          id="email"
          v-model="email"
          class="ml-input"
          type="email"
          required
          autocomplete="email"
          placeholder="voce@exemplo.com"
        />
      </div>

      <div class="ml-field">
        <div class="auth-form__label-row">
          <label class="ml-label" for="password">Senha</label>
          <a class="auth-form__forgot" href="#" @click.prevent>Esqueci a senha</a>
        </div>
        <div class="auth-form__password">
          <input
            id="password"
            v-model="password"
            class="ml-input"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••"
          />
          <button
            type="button"
            class="auth-form__toggle"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            @click="showPassword = !showPassword"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      <p v-if="error" class="auth-alert auth-alert--error">{{ error }}</p>

      <button type="submit" class="ml-btn ml-btn--primary ml-btn--block ml-btn--lg" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="auth-foot">
      Ainda não tem conta?
      <RouterLink to="/register">Criar conta</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { resolveApiError } from '@/api/errors'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.push(redirect)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível entrar. Verifique e-mail e senha.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-title {
  font-size: 2rem;
  margin-top: 6px;
}
.auth-sub {
  margin-top: 8px;
  margin-bottom: 28px;
}
.auth-form {
  display: grid;
  gap: 18px;
}
.auth-form__label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.auth-form__forgot {
  font-size: 0.82rem;
  font-weight: 600;
}
.auth-form__password {
  position: relative;
}
.auth-form__toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--subtle);
  border-radius: 10px;
}
.auth-form__toggle:hover {
  color: var(--primary-strong);
  background: var(--surface-3);
}
.auth-alert {
  border-radius: var(--radius-md);
  padding: 11px 14px;
  font-size: 0.88rem;
  font-weight: 500;
}
.auth-alert--error {
  background: var(--error-soft);
  color: var(--error);
}
.auth-foot {
  margin-top: 26px;
  font-size: 0.9rem;
  color: var(--muted);
  text-align: center;
}
.auth-foot a {
  font-weight: 600;
}
</style>
