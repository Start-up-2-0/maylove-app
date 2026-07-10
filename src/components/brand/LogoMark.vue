<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="['logo-mark', `logo-mark--${variant}`]"
    aria-hidden="true"
  >
    <path
      :d="LOGO_MARK_PATH"
      :fill="fillColor"
      :stroke="variant === 'mono' ? 'currentColor' : 'none'"
      :stroke-width="variant === 'mono' ? 1.2 : 0"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LOGO_MARK_PATH } from './logoPaths'

const props = withDefaults(
  defineProps<{
    size?: number | string
    variant?: 'light' | 'dark' | 'mono'
  }>(),
  {
    size: 24,
    variant: 'light',
  },
)

const fillColor = computed(() => {
  if (props.variant === 'mono') return 'currentColor'
  if (props.variant === 'dark') return '#ffffff'
  return '#e11d7a'
})
</script>

<style scoped>
.logo-mark {
  display: block;
  flex-shrink: 0;
}

.logo-mark--light {
  color: var(--primary, #e11d7a);
}
</style>
