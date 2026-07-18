<template>
  <footer class="wizard-footer-bar">
    <div class="wizard-footer-inner">
      <button class="ml-btn ml-btn--secondary" :disabled="!hasPrevious || loading" @click="$emit('previous')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Voltar
      </button>

      <div class="wizard-footer-actions">
        <button v-if="showPreviewButton" class="ml-btn ml-btn--ghost lg:hidden" @click="$emit('preview')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
        <button v-if="hasNext" class="ml-btn ml-btn--primary" :disabled="loading" @click="$emit('next')">
          <span v-if="loading" class="ml-spinner ml-spinner--sm" />
          Continuar
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  hasPrevious: boolean
  hasNext: boolean
  loading?: boolean
  showPreviewButton?: boolean
}>()

defineEmits<{
  previous: []
  next: []
  preview: []
}>()
</script>
