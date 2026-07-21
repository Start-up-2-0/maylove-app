<template>
  <div class="stems-step">
    <h2 class="stems-step__title">Escolha as flores</h2>
    <p class="stems-step__hint">
      Toque para adicionar. {{ stems.length }}/{{ maxStems }} escolhidas.
    </p>

    <div class="flower-grid">
      <button
        v-for="flower in BOUQUET_FLOWERS"
        :key="flower.id"
        type="button"
        class="flower-card"
        :disabled="stems.length >= maxStems"
        @click="$emit('add', flower.id)"
      >
        <span class="flower-card__emoji">{{ flower.emoji }}</span>
        <strong>{{ flower.label }}</strong>
        <span class="flower-card__meaning">{{ flower.meaning }}</span>
      </button>
    </div>

    <div v-if="stems.length" class="chosen-list">
      <p class="chosen-list__title">Seu buquê ({{ stems.length }})</p>
      <div class="chosen-list__chips">
        <div v-for="(stemId, index) in stems" :key="`${stemId}-${index}`" class="chosen-chip">
          <span>{{ getFlower(stemId)?.emoji }}</span>
          <span>{{ getFlower(stemId)?.label ?? stemId }}</span>
          <button type="button" aria-label="Remover" @click="$emit('remove', index)">🗑</button>
        </div>
      </div>
    </div>

    <div class="wrap-section">
      <p class="wrap-section__label">Cor do embrulho</p>
      <div class="wrap-grid">
        <button
          v-for="wrap in BOUQUET_WRAP_COLORS"
          :key="wrap.id"
          type="button"
          class="wrap-card"
          :class="{ 'wrap-card--active': wrapColor === wrap.id }"
          @click="$emit('update:wrapColor', wrap.id)"
        >
          <span class="wrap-card__swatch" :style="{ background: wrap.swatch }" />
          <span>{{ wrap.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BouquetWrapColor } from '@/api/types'
import {
  BOUQUET_FLOWERS,
  BOUQUET_MAX_STEMS,
  BOUQUET_WRAP_COLORS,
  getFlower,
} from '@/modules/bouquet/bouquetCatalog'

defineProps<{
  stems: string[]
  wrapColor: BouquetWrapColor
}>()

defineEmits<{
  add: [flowerId: string]
  remove: [index: number]
  'update:wrapColor': [value: BouquetWrapColor]
}>()

const maxStems = BOUQUET_MAX_STEMS
</script>

<style scoped>
.stems-step__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.6rem, 3vw, 2rem);
  margin: 0 0 6px;
  color: #3d2b2f;
}

.stems-step__hint {
  margin: 0 0 20px;
  color: #8a7d74;
}

.flower-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.flower-card {
  border: 1px solid #eadfd4;
  border-radius: 16px;
  background: white;
  padding: 12px 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.flower-card:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.flower-card:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.flower-card__emoji {
  display: block;
  font-size: 34px;
  margin-bottom: 8px;
}

.flower-card strong {
  display: block;
  font-size: 13px;
  color: #3d2b2f;
}

.flower-card__meaning {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #9a8d84;
}

.chosen-list {
  margin-top: 22px;
}

.chosen-list__title {
  margin: 0 0 10px;
  font-weight: 600;
  color: #3d2b2f;
}

.chosen-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chosen-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: white;
  border: 1px solid #eadfd4;
  font-size: 13px;
}

.chosen-chip button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.wrap-section {
  margin-top: 24px;
}

.wrap-section__label {
  margin: 0 0 10px;
  font-weight: 600;
}

.wrap-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.wrap-card {
  border: 2px solid transparent;
  border-radius: 14px;
  padding: 14px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.wrap-card--active {
  border-color: #c4456a;
}

.wrap-card__swatch {
  width: 100%;
  height: 42px;
  border-radius: 10px;
}

@media (max-width: 900px) {
  .flower-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
