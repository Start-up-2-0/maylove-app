<template>
  <div v-if="visible" class="journey-controls">
    <div class="journey-controls__progress">
      <span
        class="journey-controls__bar"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
    <div class="journey-controls__row">
      <p class="journey-controls__label">
        <span class="journey-controls__pulse" />
        Nossa Jornada — {{ currentIndex + 1 }}/{{ total }}
      </p>
      <div class="journey-controls__actions">
        <button type="button" class="journey-controls__btn" @click="$emit('prev')" :disabled="currentIndex <= 0">←</button>
        <button type="button" class="journey-controls__btn journey-controls__btn--primary" @click="$emit('toggle')">
          {{ playing ? 'Pausar' : 'Continuar' }}
        </button>
        <button type="button" class="journey-controls__btn" @click="$emit('next')" :disabled="currentIndex >= total - 1">→</button>
        <button type="button" class="journey-controls__btn" @click="$emit('stop')">Sair</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  playing: boolean
  currentIndex: number
  total: number
}>()

defineEmits<{ toggle: []; next: []; prev: []; stop: [] }>()

const progressPercent = computed(() =>
  props.total <= 1 ? 100 : ((props.currentIndex + 1) / props.total) * 100,
)
</script>

<style scoped>
.journey-controls {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  width: min(560px, calc(100% - 32px));
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(12, 10, 14, 0.82);
  backdrop-filter: blur(12px);
  color: #fff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  z-index: 30;
}
.journey-controls__progress {
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  margin-bottom: 12px;
}
.journey-controls__bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #e11d7a, #f472b6);
  transition: width 0.45s ease;
}
.journey-controls__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.journey-controls__label {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}
.journey-controls__pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e11d7a;
  animation: pulse 1.2s ease infinite;
}
.journey-controls__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.journey-controls__btn {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 0.82rem;
}
.journey-controls__btn:disabled {
  opacity: 0.35;
}
.journey-controls__btn--primary {
  background: #e11d7a;
  border-color: #e11d7a;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.55; }
}
</style>
