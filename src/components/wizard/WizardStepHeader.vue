<template>
  <header class="wiz-step-header">
    <h2 class="wiz-step-header__title">{{ title }}</h2>
    <p v-if="description" class="wiz-step-header__desc">{{ description }}</p>
    <slot />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped>
.wiz-step-header {
  margin-bottom: 22px;
}
.wiz-step-header__title {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--ink);
}
.wiz-step-header__desc {
  margin-top: 6px;
  font-size: 0.9rem;
  color: var(--muted);
  max-width: 60ch;
}
</style>
