<template>
  <button
    class="music-float"
    :class="{ 'music-float--playing': playing }"
    :title="playing ? 'Pausar música' : 'Tocar música'"
    @click="toggle"
  >
    <span class="music-float__bars" aria-hidden="true">
      <span /><span /><span /><span />
    </span>
    <svg v-if="!playing" class="music-float__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M9 18V5l10-2v13" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useTributeAudio } from '@/composables/useTributeAudio'
import { useExperienceAudio } from '@/composables/experienceAudio'

const props = defineProps<{
  url: string | null
  loop?: boolean
  autoplay?: boolean
  startAt?: number
  endAt?: number | null
}>()

// Usa o áudio único provido pelo ExperienceRenderer quando disponível; senão,
// cria um próprio (fallback para uso isolado do componente).
const shared = useExperienceAudio()
const urlRef = toRef(props, 'url')
const fallback = shared
  ? null
  : useTributeAudio(() => urlRef.value, {
      loop: () => props.loop !== false,
      autoplay: () => props.autoplay !== false,
      startAt: () => props.startAt ?? 0,
      endAt: () => props.endAt ?? null,
    })
const playing = shared ? shared.playing : fallback!.playing
const toggle = shared ? shared.toggle : fallback!.toggle
</script>

<style scoped>
.music-float {
  position: fixed;
  right: clamp(14px, 3vw, 26px);
  bottom: clamp(14px, 3vw, 26px);
  z-index: 60;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: none;
  color: #fff;
  background: var(--exp-primary, #d94f7a);
  box-shadow: 0 12px 30px -8px color-mix(in srgb, var(--exp-primary, #d94f7a) 60%, transparent);
  transition: transform 0.2s ease;
}
.music-float:hover {
  transform: scale(1.06);
}
.music-float__bars {
  display: none;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}
.music-float__bars span {
  width: 3px;
  height: 100%;
  border-radius: 2px;
  background: #fff;
  animation: music-eq 0.9s ease-in-out infinite;
}
.music-float__bars span:nth-child(2) {
  animation-delay: 0.2s;
}
.music-float__bars span:nth-child(3) {
  animation-delay: 0.4s;
}
.music-float__bars span:nth-child(4) {
  animation-delay: 0.15s;
}
.music-float--playing .music-float__bars {
  display: flex;
}
@keyframes music-eq {
  0%,
  100% {
    transform: scaleY(0.35);
  }
  50% {
    transform: scaleY(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .music-float__bars span {
    animation: none;
  }
}
</style>
