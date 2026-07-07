<template>
  <header class="wizard-header mb-5">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <RouterLink
          to="/dashboard"
          class="inline-flex items-center text-sm text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 mb-2 no-underline"
        >
          ← Dashboard
        </RouterLink>
        <h1 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white truncate">
          {{ title }}
        </h1>
        <div class="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <FwbBadge :type="badgeType">{{ statusLabel }}</FwbBadge>
          <span v-if="saving">Salvando...</span>
          <span v-else-if="savedAt">Salvo {{ formatSavedAt(savedAt) }}</span>
          <span v-if="saveError" class="text-red-600">{{ saveError }}</span>
        </div>
      </div>
      <FwbButton color="alternative" size="sm" @click="$emit('toggle-theme')">
        {{ darkTheme ? 'Tema claro' : 'Tema escuro' }}
      </FwbButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { FwbBadge, FwbButton } from 'flowbite-vue'

const props = defineProps<{
  title: string
  status: string
  saving: boolean
  savedAt: Date | null
  saveError: string
  darkTheme: boolean
}>()

defineEmits<{ 'toggle-theme': [] }>()

const statusLabel = computed(() => {
  return (
    ({
      draft: 'Rascunho',
      awaiting_payment: 'Aguardando pagamento',
      published: 'Publicada',
    }) as Record<string, string>
  )[props.status] ?? props.status
})

const badgeType = computed(() => {
  if (props.status === 'published') return 'green'
  if (props.status === 'awaiting_payment') return 'yellow'
  return 'purple'
})

function formatSavedAt(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date)
}
</script>
