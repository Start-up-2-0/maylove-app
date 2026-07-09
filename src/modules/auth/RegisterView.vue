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
import { register } from '@/api/auth'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await register({ name: name.value, email: email.value, password: password.value })
    success.value = 'Conta criada! Verifique seu e-mail para confirmar o cadastro.'
  } catch {
    error.value = 'Não foi possível criar a conta. Tente outro e-mail.'
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
