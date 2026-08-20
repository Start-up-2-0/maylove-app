<template>
  <div class="stems-step wiz-step-content">
    <h2 class="wiz-card__title">Escolha as flores</h2>
    <p class="wiz-card__hint">
      Cada flor comunica um sentimento. Toque para adicionar até {{ maxStems }} flores digitais.
      {{ stems.length }}/{{ maxStems }} escolhidas.
    </p>

    <section class="combination-guide" aria-labelledby="combination-guide-title">
      <div>
        <h3 id="combination-guide-title">Combinações sugeridas</h3>
        <p>Use como ponto de partida ou monte uma mensagem só sua.</p>
      </div>
      <div class="combination-guide__list">
        <button
          v-for="combination in BOUQUET_COMBINATIONS"
          :key="combination.id"
          type="button"
          class="combination-card"
          :disabled="!canApplyCombination(combination.flowerIds)"
          @click="applyCombination(combination.flowerIds)"
        >
          <strong>{{ combination.label }}</strong>
          <span>{{ combination.description }}</span>
          <small>{{ combination.flowerIds.map(flowerLabel).join(' + ') }}</small>
        </button>
      </div>
    </section>

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
  BOUQUET_COMBINATIONS,
  BOUQUET_MAX_STEMS,
  BOUQUET_WRAP_COLORS,
  getFlower,
  type BouquetFlowerId,
} from '@/modules/bouquet/bouquetCatalog'

const props = defineProps<{
  stems: string[]
  wrapColor: BouquetWrapColor
}>()

const emit = defineEmits<{
  add: [flowerId: string]
  remove: [index: number]
  'update:wrapColor': [value: BouquetWrapColor]
}>()

const maxStems = BOUQUET_MAX_STEMS

function flowerLabel(flowerId: BouquetFlowerId): string {
  return getFlower(flowerId)?.label ?? flowerId
}

function canApplyCombination(flowerIds: BouquetFlowerId[]): boolean {
  return props.stems.length + flowerIds.length <= maxStems
}

function applyCombination(flowerIds: BouquetFlowerId[]) {
  if (!canApplyCombination(flowerIds)) return
  flowerIds.forEach((flowerId) => emit('add', flowerId))
}
</script>

<style scoped>
.combination-guide {
  padding: 14px;
  margin: 16px 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 35%, var(--surface));
}
.combination-guide h3,
.combination-guide p {
  margin: 0;
}
.combination-guide p {
  margin-top: 3px;
  color: var(--muted);
  font-size: 0.82rem;
}
.combination-guide__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}
.combination-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.combination-card:hover:not(:disabled),
.combination-card:focus-visible {
  border-color: var(--primary);
  outline: none;
}
.combination-card:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.combination-card span,
.combination-card small {
  color: var(--muted);
}
.combination-card small {
  margin-top: 3px;
  font-size: 0.68rem;
}
.flower-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.flower-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.flower-card:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
  box-shadow: 0 8px 20px color-mix(in srgb, var(--primary) 8%, transparent);
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
  color: var(--ink);
}

.flower-card__meaning {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: var(--muted);
}

.chosen-list {
  margin-top: 22px;
}

.chosen-list__title {
  margin: 0 0 10px;
  font-weight: 600;
  color: var(--ink);
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
  background: var(--surface);
  border: 1px solid var(--border);
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
  color: var(--muted);
  font-size: 16px;
  line-height: 1;
}

.chosen-chip__remove:hover {
  color: var(--primary);
}

.wrap-section {
  margin-top: 24px;
}

.wrap-section__label {
  margin: 0 0 10px;
  font-weight: 600;
  color: var(--ink);
}

.wrap-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.wrap-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  background: var(--surface);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.wrap-card--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 15%, transparent);
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
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .combination-guide__list {
    grid-template-columns: 1fr;
  }
  .flower-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1440px) {
  .flower-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
