<template>
  <div v-if="particles.length" class="exp-effects" aria-hidden="true">
    <span
      v-for="p in particles"
      :key="p.key"
      class="exp-particle"
      :class="p.cssClass"
      :style="p.style"
      >{{ p.glyph }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeEffect } from '@/api/types'

const props = withDefaults(
  defineProps<{
    effects: TributeEffect[]
    accent?: string
    density?: number
  }>(),
  { accent: '#e11d7a', density: 14 },
)

interface Particle {
  key: string
  glyph: string
  cssClass: string
  style: Record<string, string>
}

const CONFETTI_COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function buildFalling(effect: TributeEffect, glyph: string, count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const duration = rand(6, 12)
    const size = rand(14, 26)
    return {
      key: `${effect}-${i}`,
      glyph,
      cssClass: 'exp-particle--fall',
      style: {
        left: `${rand(0, 100)}%`,
        fontSize: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${rand(-duration, 0)}s`,
        opacity: String(rand(0.6, 1)),
      },
    }
  })
}

const particles = computed<Particle[]>(() => {
  const out: Particle[] = []
  const n = props.density

  for (const effect of props.effects) {
    switch (effect) {
      case 'hearts':
        out.push(...buildFalling('hearts', '\u2764\uFE0F', n))
        break
      case 'petals':
        out.push(...buildFalling('petals', '\uD83C\uDF38', n))
        break
      case 'snow':
        out.push(...buildFalling('snow', '\u2744\uFE0F', n + 4))
        break
      case 'confetti':
        for (let i = 0; i < n + 6; i += 1) {
          const duration = rand(5, 10)
          out.push({
            key: `confetti-${i}`,
            glyph: '',
            cssClass: 'exp-particle--fall exp-confetti',
            style: {
              left: `${rand(0, 100)}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDuration: `${duration}s`,
              animationDelay: `${rand(-duration, 0)}s`,
            },
          })
        }
        break
      case 'stars':
        for (let i = 0; i < n; i += 1) {
          out.push({
            key: `star-${i}`,
            glyph: '\u2728',
            cssClass: 'exp-particle--twinkle',
            style: {
              left: `${rand(2, 98)}%`,
              top: `${rand(4, 92)}%`,
              fontSize: `${rand(12, 22)}px`,
              animationDuration: `${rand(1.4, 3)}s`,
              animationDelay: `${rand(0, 2)}s`,
            },
          })
        }
        break
      case 'fireworks':
        for (let i = 0; i < Math.max(6, n - 4); i += 1) {
          out.push({
            key: `fw-${i}`,
            glyph: '',
            cssClass: 'exp-particle--burst',
            style: {
              left: `${rand(10, 90)}%`,
              top: `${rand(8, 60)}%`,
              width: `${rand(30, 60)}px`,
              height: `${rand(30, 60)}px`,
              background: `radial-gradient(circle, ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} 0%, transparent 70%)`,
              animationDuration: `${rand(1.6, 2.8)}s`,
              animationDelay: `${rand(0, 2.5)}s`,
            },
          })
        }
        break
    }
  }
  return out
})
</script>
