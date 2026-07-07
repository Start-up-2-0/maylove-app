<template>
  <div class="envelope-frame" :class="{ open: isOpen }">
    <div class="envelope-frame-inner rounded-2xl border border-[var(--border,#ecd9df)] bg-white shadow-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    autoOpen?: boolean
  }>(),
  { autoOpen: true },
)

const isOpen = ref(false)

onMounted(() => {
  if (!props.autoOpen) return
  requestAnimationFrame(() => {
    isOpen.value = true
  })
})
</script>
