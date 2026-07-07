<template>
  <div class="page">
    <div class="shell">
      <header class="flex flex-wrap justify-between gap-4 items-start mb-7">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-pink-600 mb-2">MayLove</p>
          <h1>Minhas homenagens</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">
            Olá, {{ auth.user?.name }}. Acompanhe views e status de cada projeto.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <FwbButton to="/dashboard/tributes/new" tag="router-link" color="pink">
            Nova homenagem
          </FwbButton>
          <FwbButton color="alternative" @click="logout">Sair</FwbButton>
        </div>
      </header>

      <section v-if="loading" class="text-gray-500 py-12 text-center">
        Carregando homenagens...
      </section>
      <section v-else-if="error" class="text-red-600 py-8">{{ error }}</section>

      <FwbCard v-else-if="tributes.length === 0" class="p-8 text-center">
        <h2 class="text-xl font-semibold mb-2">Nenhuma homenagem ainda</h2>
        <p class="text-gray-500 mb-4">Crie sua primeira homenagem em poucos passos.</p>
        <FwbButton to="/dashboard/tributes/new" tag="router-link" color="pink">
          Começar agora
        </FwbButton>
      </FwbCard>

      <section v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <FwbCard
          v-for="tribute in tributes"
          :key="tribute.id"
          class="p-5 flex flex-col gap-3"
        >
          <div class="flex items-center justify-between gap-2">
            <FwbBadge :type="badgeType(tribute.status)">{{ statusLabel(tribute.status) }}</FwbBadge>
            <span class="text-sm text-gray-500">{{ tribute.views_count }} views</span>
          </div>
          <h2 class="text-lg font-semibold">
            {{ tribute.title || tribute.honoree_name || 'Sem título' }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ tribute.tribute_type.name }} · {{ tribute.template.name }}
          </p>
          <p class="text-sm text-gray-400">/h/{{ tribute.slug }}</p>
          <FwbButton :to="tributeLink(tribute)" tag="router-link" color="pink" class="mt-auto">
            {{ tribute.status === 'published' ? 'Ver analytics' : 'Continuar edição' }}
          </FwbButton>
        </FwbCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbBadge, FwbButton, FwbCard } from 'flowbite-vue'
import { listTributes } from '@/api/tributes'
import type { TributeSummary } from '@/api/types'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const tributes = ref<TributeSummary[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    tributes.value = await listTributes()
  } catch {
    error.value = 'Não foi possível carregar suas homenagens.'
  } finally {
    loading.value = false
  }
})

async function logout() {
  await auth.logout()
  await router.push('/login')
}

function tributeLink(tribute: TributeSummary): string {
  if (tribute.status === 'published') {
    return `/dashboard/tributes/${tribute.id}`
  }
  return `/dashboard/tributes/${tribute.id}/edit`
}

function statusLabel(status: string): string {
  return (
    ({
      draft: 'Rascunho',
      awaiting_payment: 'Aguardando pagamento',
      published: 'Publicada',
      archived: 'Arquivada',
    }) as Record<string, string>
  )[status] ?? status
}

function badgeType(status: string): 'green' | 'yellow' | 'purple' {
  if (status === 'published') return 'green'
  if (status === 'awaiting_payment') return 'yellow'
  return 'purple'
}
</script>
