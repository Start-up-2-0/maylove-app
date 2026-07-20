<template>
  <div class="rom-floating-hearts" aria-hidden="true">
    <span
      v-for="heart in hearts"
      :key="heart.id"
      class="rom-floating-hearts__item"
      :style="{
        left: heart.left,
        animationDelay: heart.delay,
        animationDuration: heart.duration,
        fontSize: heart.size,
        opacity: heart.opacity,
      }"
    >
      {{ heart.glyph }}
    </span>
  </div>
</template>

<script setup lang="ts">
const glyphs = ['♥', '♡', '💕', '❤'] as const

const hearts = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  glyph: glyphs[index % glyphs.length],
  left: `${6 + ((index * 7.3) % 88)}%`,
  delay: `${(index * 0.55) % 4.5}s`,
  duration: `${9 + (index % 5) * 1.4}s`,
  size: `${0.85 + (index % 4) * 0.22}rem`,
  opacity: `${0.12 + (index % 3) * 0.08}`,
}))
</script>

<style scoped>
.rom-floating-hearts {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}
.rom-floating-hearts__item {
  position: absolute;
  bottom: -12%;
  color: var(--rom-accent, #e11d48);
  animation: rom-heart-float linear infinite;
  filter: blur(0.2px);
}
@keyframes rom-heart-float {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    transform: translateY(-118vh) translateX(18px) rotate(18deg);
    opacity: 0;
  }
}
</style>
