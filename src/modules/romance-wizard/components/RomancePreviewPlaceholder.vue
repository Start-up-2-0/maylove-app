<template>
  <div class="rom-preview-placeholder">
    <div class="rom-preview-placeholder__hero" :style="heroStyle">
      <span class="rom-preview-placeholder__icon">{{ icon }}</span>
    </div>
    <div class="rom-preview-placeholder__body">
      <h2 class="rom-preview-placeholder__title">
        {{ title || 'Seu título aparecerá aqui' }}
      </h2>
      <p class="rom-preview-placeholder__message">
        {{ message || 'Sua mensagem aparecerá aqui enquanto você responde.' }}
      </p>
      <div v-if="showPhotoSlot" class="rom-preview-placeholder__photo">
        <span>📷</span>
        <span>Foto de capa</span>
      </div>
    </div>
    <div class="rom-preview-placeholder__shimmer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    icon?: string
    title?: string
    message?: string
    accent?: string
    showPhotoSlot?: boolean
  }>(),
  {
    icon: '💕',
    title: '',
    message: '',
    accent: '#e11d48',
    showPhotoSlot: true,
  },
)

const heroStyle = computed(() => ({
  background: `linear-gradient(145deg, color-mix(in srgb, ${props.accent} 18%, #fff), color-mix(in srgb, ${props.accent} 6%, #fff))`,
}))
</script>

<style scoped>
.rom-preview-placeholder {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: hidden;
  background: var(--surface);
}
.rom-preview-placeholder__hero {
  display: grid;
  place-items: center;
  min-height: 140px;
  padding: 24px;
}
.rom-preview-placeholder__icon {
  font-size: 2.5rem;
  line-height: 1;
  filter: drop-shadow(0 8px 16px color-mix(in srgb, var(--rom-accent, #e11d48) 25%, transparent));
}
.rom-preview-placeholder__body {
  padding: 20px 18px 28px;
  text-align: center;
}
.rom-preview-placeholder__title {
  margin: 0 0 10px;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.25;
}
.rom-preview-placeholder__message {
  margin: 0 auto;
  max-width: 240px;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--muted);
}
.rom-preview-placeholder__photo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 6%, var(--surface));
  border: 1px dashed color-mix(in srgb, var(--rom-accent, #e11d48) 22%, var(--border));
}
.rom-preview-placeholder__shimmer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    110deg,
    transparent 30%,
    color-mix(in srgb, #fff 35%, transparent) 50%,
    transparent 70%
  );
  transform: translateX(-120%);
  animation: rom-shimmer 3.2s ease-in-out infinite;
}
@keyframes rom-shimmer {
  0%,
  100% {
    transform: translateX(-120%);
  }
  55% {
    transform: translateX(120%);
  }
}
</style>
