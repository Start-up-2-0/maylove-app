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
        <div class="flower-card__photo">
          <img :src="flower.image" :alt="flower.label" loading="lazy" draggable="false" />
        </div>
        <strong>{{ flower.label }}</strong>
        <span class="flower-card__meaning">{{ flower.meaning }}</span>
      </button>
    </div>

    <div v-if="stems.length" class="chosen-list">
      <p class="chosen-list__title">Seu buquê ({{ stems.length }})</p>
      <div class="chosen-list__chips">
        <div v-for="(stemId, index) in stems" :key="`${stemId}-${index}`" class="chosen-chip">
          <img
            v-if="getFlower(stemId)"
            :src="getFlower(stemId)!.image"
            :alt="getFlower(stemId)!.label"
            class="chosen-chip__thumb"
          />
          <span>{{ getFlower(stemId)?.label ?? stemId }}</span>
          <button type="button" class="chosen-chip__remove" aria-label="Remover" @click="$emit('remove', index)">
            ×
          </button>
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
          <span v-if="wrapColor === wrap.id" class="wrap-card__check" aria-hidden="true">✓</span>
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
  border: 2px solid #eadfd4;
  border-radius: 16px;
  background: #fffaf6;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.flower-card:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(196, 69, 106, 0.45);
  box-shadow: 0 8px 20px rgba(196, 69, 106, 0.08);
}

.flower-card:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.flower-card__photo {
  aspect-ratio: 3 / 4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 8px;
}

.flower-card__photo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.flower-card strong {
  display: block;
  font-size: 12px;
  color: #3d2b2f;
}

.flower-card__meaning {
  display: block;
  margin-top: 4px;
  font-size: 10px;
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
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  background: white;
  border: 1px solid #eadfd4;
  font-size: 12px;
}

.chosen-chip__thumb {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.chosen-chip__remove {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0 2px;
  color: #9a8d84;
  font-size: 16px;
  line-height: 1;
}

.chosen-chip__remove:hover {
  color: #c4456a;
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
  position: relative;
  border: 2px solid #eadfd4;
  border-radius: 14px;
  padding: 12px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.wrap-card--active {
  border-color: #c4456a;
  box-shadow: 0 0 0 1px rgba(196, 69, 106, 0.15);
}

.wrap-card__swatch {
  width: 100%;
  height: 48px;
  border-radius: 10px;
}

.wrap-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #c4456a;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .flower-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
