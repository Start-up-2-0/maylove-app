<template>
  <div class="page auth-page grid place-items-center">
    <FwbCard class="w-full max-w-md p-8">
      <p class="text-xs font-bold uppercase tracking-widest text-pink-600 mb-2">MayLove</p>
      <h1>Entrar</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 mb-6">
        Acesse seu dashboard e gerencie suas homenagens.
      </p>

      <form class="grid gap-4" @submit.prevent="submit">
        <FwbInput v-model="email" label="E-mail" type="email" required autocomplete="email" />
        <FwbInput
          v-model="password"
          label="Senha"
          type="password"
          required
          autocomplete="current-password"
        />
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <FwbButton type="submit" color="pink" class="w-full" :loading="loading" :disabled="loading">
          Entrar
        </FwbButton>
      </form>

      <p class="text-gray-500 text-sm mt-6">
        Ainda não tem conta?
        <RouterLink to="/register" class="text-pink-600 hover:underline">Criar conta</RouterLink>
      </p>
    </FwbCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { FwbButton, FwbCard, FwbInput } from 'flowbite-vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.push(redirect)
  } catch {
    error.value = 'Não foi possível entrar. Verifique e-mail e senha.'
  } finally {
    loading.value = false
  }
}
</script>
