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
    <defs v-if="variant !== 'mono'">
      <linearGradient :id="gradientId" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1D4ED8" />
        <stop offset="55%" stop-color="#E11D7A" />
        <stop offset="100%" stop-color="#DC2626" />
      </linearGradient>
    </defs>
    <path
      :d="LOGO_MARK_PATH"
      :fill="fillColor"
      :stroke="variant === 'mono' ? 'currentColor' : 'none'"
      :stroke-width="variant === 'mono' ? 1.2 : 0"
    />
    <path
      v-if="variant !== 'mono'"
      :d="LOGO_MARK_INNER"
      fill="rgba(255,255,255,0.22)"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LOGO_MARK_INNER, LOGO_MARK_PATH } from './logoPaths'

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

const gradientId = `maylov-grad-${Math.random().toString(36).slice(2, 9)}`

const fillColor = computed(() => {
  if (props.variant === 'mono') return 'currentColor'
  return `url(#${gradientId})`
})
</script>

<style scoped>
.logo-mark {
  display: block;
  flex-shrink: 0;
}
</style>
