<template>
  <div class="envelope-frame" :class="{ open: isOpen && !flat, flat }">
    <div class="envelope-frame-inner">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    autoOpen?: boolean
    /** Sem perspectiva 3D — usado no preview ao vivo do wizard. */
    flat?: boolean
  }>(),
  { autoOpen: true, flat: false },
)

const isOpen = ref(false)

onMounted(() => {
  if (!props.autoOpen) return
  requestAnimationFrame(() => {
    isOpen.value = true
  })
})
</script>
