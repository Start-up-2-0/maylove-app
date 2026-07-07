<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { reinitFlowbite } from '@/plugins/flowbite'

const route = useRoute()

onMounted(() => {
  reinitFlowbite()
})

watch(
  () => route.path,
  () => {
    reinitFlowbite()
  },
)
</script>
