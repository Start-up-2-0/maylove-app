<template>
  <aside class="journey-timeline">
    <p class="journey-timeline__eyebrow">Nossa história</p>
    <ol class="journey-timeline__list">
      <li
        v-for="(place, index) in places"
        :key="place.id"
        class="journey-timeline__item"
        :class="{ 'journey-timeline__item--active': place.id === activePlaceId }"
      >
        <button type="button" class="journey-timeline__btn" @click="$emit('select', place.id)">
          <span class="journey-timeline__emoji">{{ getPlaceEmoji(place) }}</span>
          <span class="journey-timeline__body">
            <strong>{{ place.title }}</strong>
            <span>{{ formatMemoryDate(place.memory_date) || place.city || MAP_PLACE_TYPE_LABELS[place.place_type] }}</span>
          </span>
        </button>
        <span v-if="index < places.length - 1" class="journey-timeline__connector" aria-hidden="true" />
      </li>
    </ol>
  </aside>
</template>

<script setup lang="ts">
import type { MapPlace } from '@/api/types'
import { formatMemoryDate } from '../mapJourney'
import { getPlaceEmoji, MAP_PLACE_TYPE_LABELS } from '../mapPlaceTypes'

defineProps<{
  places: MapPlace[]
  activePlaceId?: string | null
}>()

defineEmits<{ select: [placeId: string] }>()
</script>

<style scoped>
.journey-timeline {
  padding: 20px 16px;
  max-height: min(72vh, 640px);
  overflow: auto;
}
.journey-timeline__eyebrow {
  margin: 0 0 16px;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e11d7a;
  font-weight: 700;
}
.journey-timeline__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.journey-timeline__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.journey-timeline__btn {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(225, 29, 122, 0.12);
  background: rgba(255, 255, 255, 0.72);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.journey-timeline__item--active .journey-timeline__btn {
  border-color: #e11d7a;
  box-shadow: 0 12px 32px rgba(225, 29, 122, 0.14);
  transform: translateX(4px);
}
.journey-timeline__emoji {
  font-size: 1.4rem;
  line-height: 1;
}
.journey-timeline__body strong {
  display: block;
  font-size: 0.95rem;
}
.journey-timeline__body span {
  display: block;
  margin-top: 2px;
  font-size: 0.78rem;
  color: #6b7280;
}
.journey-timeline__connector {
  width: 2px;
  height: 18px;
  margin: 4px 0 4px 28px;
  background: linear-gradient(180deg, #e11d7a, rgba(225, 29, 122, 0.15));
  border-radius: 999px;
}
</style>
