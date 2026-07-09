<template>
  <button class="fs-toggle" :title="isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'" @click="toggle">
    <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M9 4v4a1 1 0 0 1-1 1H4M15 4v4a1 1 0 0 0 1 1h4M9 20v-4a1 1 0 0 0-1-1H4M15 20v-4a1 1 0 0 1 1-1h4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ target?: HTMLElement | null }>()

const isFullscreen = ref(false)

function onChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

onMounted(() => document.addEventListener('fullscreenchange', onChange))
onUnmounted(() => document.removeEventListener('fullscreenchange', onChange))

async function toggle() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      const el = props.target ?? document.documentElement
      await el.requestFullscreen()
    }
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.fs-toggle {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  color: var(--exp-ink, #241820);
  background: var(--exp-surface, rgba(255, 255, 255, 0.85));
  border: 1px solid var(--exp-border, rgba(0, 0, 0, 0.1));
  backdrop-filter: blur(8px);
  transition: transform 0.18s ease;
}
.fs-toggle:hover {
  transform: scale(1.05);
}
</style>
