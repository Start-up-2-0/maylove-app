<template>
  <header class="mb-6">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
    <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
    <slot />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
