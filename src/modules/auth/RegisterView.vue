<template>
  <div class="page auth-page grid place-items-center">
    <FwbCard class="w-full max-w-md p-8">
      <p class="text-xs font-bold uppercase tracking-widest text-pink-600 mb-2">MayLove</p>
      <h1>Criar conta</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 mb-6">
        Comece a criar homenagens digitais em poucos minutos.
      </p>

      <form class="grid gap-4" @submit.prevent="submit">
        <FwbInput v-model="name" label="Nome" type="text" required autocomplete="name" />
        <FwbInput v-model="email" label="E-mail" type="email" required autocomplete="email" />
        <FwbInput
          v-model="password"
          label="Senha"
          type="password"
          required
          minlength="8"
          autocomplete="off"
        />
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <FwbAlert v-if="success" type="success">{{ success }}</FwbAlert>
        <FwbButton type="submit" color="pink" class="w-full" :loading="loading" :disabled="loading">
          Criar conta
        </FwbButton>
      </form>

      <p class="text-gray-500 text-sm mt-6">
        Já tem conta?
        <RouterLink to="/login" class="text-pink-600 hover:underline">Entrar</RouterLink>
      </p>
    </FwbCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FwbAlert, FwbButton, FwbCard, FwbInput } from 'flowbite-vue'
import { register } from '@/api/auth'

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
    await register({
      name: name.value,
      email: email.value,
      password: password.value,
    })
    success.value = 'Conta criada! Verifique seu e-mail para confirmar o cadastro.'
  } catch {
    error.value = 'Não foi possível criar a conta. Tente outro e-mail.'
  } finally {
    loading.value = false
  }
}
</script>
