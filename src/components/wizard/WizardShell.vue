<template>
  <div
    class="wizard-shell"
    :class="{ 'wizard-theme-dark': darkTheme }"
  >
    <div class="wizard-inner">
      <slot name="header" />
      <slot name="stepper" />
      <slot />
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  darkTheme?: boolean
}>()
</script>
