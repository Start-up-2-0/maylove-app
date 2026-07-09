<template>
  <AuthLayout>
    <p class="eyebrow">Comece agora</p>
    <h1 class="auth-title">Criar conta</h1>
    <p class="text-muted auth-sub">Crie homenagens digitais em poucos minutos.</p>

    <form class="auth-form" @submit.prevent="submit">
      <div class="ml-field">
        <label class="ml-label" for="name">Nome</label>
        <input id="name" v-model="name" class="ml-input" type="text" required autocomplete="name" placeholder="Seu nome" />
      </div>

      <div class="ml-field">
        <label class="ml-label" for="email">E-mail</label>
        <input id="email" v-model="email" class="ml-input" type="email" required autocomplete="email" placeholder="voce@exemplo.com" />
      </div>

      <div class="ml-field">
        <label class="ml-label" for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          class="ml-input"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
        <span class="ml-hint">Use pelo menos 8 caracteres.</span>
      </div>

      <label class="auth-terms">
        <input v-model="acceptTerms" type="checkbox" required />
        <span>Li e aceito os termos de uso.</span>
      </label>

      <p v-if="error" class="auth-alert auth-alert--error">{{ error }}</p>
      <p v-if="success" class="auth-alert auth-alert--success">{{ success }}</p>

      <button type="submit" class="ml-btn ml-btn--primary ml-btn--block ml-btn--lg" :disabled="loading">
        {{ loading ? 'Criando...' : 'Criar conta' }}
      </button>
    </form>

    <p class="auth-foot">
      Já tem conta?
      <RouterLink to="/login">Entrar</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { AxiosError } from 'axios'
import { register } from '@/api/auth'
import type { ApiErrorBody } from '@/api/types'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const name = ref('')
const email = ref('')
const password = ref('')
const acceptTerms = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

function resolveRegisterError(err: unknown): string {
  const axiosErr = err as AxiosError<ApiErrorBody>
  const code = axiosErr.response?.data?.code
  const message = axiosErr.response?.data?.message

  if (code === 'EMAIL_ALREADY_EXISTS') {
    return message ?? 'Este e-mail já está cadastrado. Tente outro ou faça login.'
  }

  if (code === 'VALIDATION_ERROR') {
    return message ?? 'Verifique os dados do formulário.'
  }

  if (message) {
    return message
  }

  return 'Não foi possível criar a conta. Tente novamente.'
}

async function submit() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const result = await register({
      name: name.value,
      email: email.value,
      password: password.value,
      accept_terms: acceptTerms.value,
    })
    success.value = result.message
  } catch (err) {
    error.value = resolveRegisterError(err)
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
.auth-terms {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.45;
}
.auth-terms input {
  margin-top: 3px;
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
.auth-alert--success {
  background: var(--success-soft);
  color: var(--success);
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
