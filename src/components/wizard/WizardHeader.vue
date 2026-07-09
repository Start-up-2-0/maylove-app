<template>
  <header class="wiz-header">
    <div class="wiz-header__main">
      <RouterLink to="/dashboard" class="wiz-header__back">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Painel
      </RouterLink>
      <h1 class="wiz-header__title">{{ title }}</h1>
      <div class="wiz-header__meta">
        <span class="ml-badge" :class="badgeClass">{{ statusLabel }}</span>
        <span v-if="saving" class="wiz-header__save">
          <span class="wiz-header__dot wiz-header__dot--saving" />
          Salvando...
        </span>
        <span v-else-if="savedAt" class="wiz-header__save">
          <span class="wiz-header__dot wiz-header__dot--saved" />
          Salvo {{ formatSavedAt(savedAt) }}
        </span>
        <span v-if="saveError" class="wiz-header__error">{{ saveError }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  title: string
  status: string
  saving: boolean
  savedAt: Date | null
  saveError: string
}>()

const statusLabel = computed(() => {
  return (
    ({
      draft: 'Rascunho',
      awaiting_payment: 'Aguardando pagamento',
      published: 'Publicada',
    }) as Record<string, string>
  )[props.status] ?? props.status
})

const badgeClass = computed(() => {
  if (props.status === 'published') return 'ml-badge--success'
  if (props.status === 'awaiting_payment') return 'ml-badge--warning'
  return 'ml-badge--info'
})

function formatSavedAt(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date)
}
</script>

<style scoped>
.wiz-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.wiz-header__main {
  min-width: 0;
}
.wiz-header__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 10px;
  transition: color var(--dur) var(--ease);
}
.wiz-header__back:hover {
  color: var(--primary-strong);
}
.wiz-header__title {
  font-size: clamp(1.5rem, 2.6vw, 2.1rem);
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wiz-header__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--muted);
}
.wiz-header__save {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.wiz-header__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.wiz-header__dot--saving {
  background: var(--warning);
  animation: pulse 1s ease infinite;
}
.wiz-header__dot--saved {
  background: var(--success);
}
@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}
.wiz-header__error {
  color: var(--error);
}
</style>
