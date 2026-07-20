<template>
  <div class="rom-form-step">
    <div class="rom-form-step__coach">
      <span class="rom-form-step__avatar" aria-hidden="true">{{ icon }}</span>
      <div class="rom-form-step__bubble">
        <p v-if="title" class="rom-form-step__title">{{ title }}</p>
        <p class="rom-form-step__prompt">{{ prompt }}</p>
      </div>
    </div>

    <section class="rom-form-card" :class="{ 'rom-form-card--flat': flat }">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title?: string
    prompt: string
    flat?: boolean
  }>(),
  { icon: '💕', flat: false },
)
</script>
