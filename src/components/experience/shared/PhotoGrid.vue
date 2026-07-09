<template>
  <div class="pgrid" :class="`pgrid--${mode}`">
    <figure
      v-for="(photo, index) in photos"
      :key="photo.id"
      v-reveal="index * 70"
      class="pgrid__item"
    >
      <img :src="photo.url" alt="" loading="lazy" />
    </figure>
  </div>
</template>

<script setup lang="ts">
import type { ExperienceMediaItem, PhotoStyle } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'

defineProps<{
  photos: ExperienceMediaItem[]
  mode: Exclude<PhotoStyle, 'slider'>
}>()
</script>

<style scoped>
.pgrid {
  display: grid;
  gap: 16px;
}
.pgrid__item {
  margin: 0;
  overflow: hidden;
  border-radius: 18px;
  background: var(--exp-surface);
  box-shadow: 0 24px 48px -30px rgba(0, 0, 0, 0.4);
}
.pgrid__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}
.pgrid__item:hover img {
  transform: scale(1.05);
}

/* Galeria: grade uniforme */
.pgrid--gallery {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.pgrid--gallery .pgrid__item {
  aspect-ratio: 4 / 3;
}

/* Mosaico: alturas alternadas em colunas */
.pgrid--mosaic {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 12px;
}
.pgrid--mosaic .pgrid__item {
  grid-row: span 18;
}
.pgrid--mosaic .pgrid__item:nth-child(3n) {
  grid-row: span 26;
}
.pgrid--mosaic .pgrid__item:nth-child(4n) {
  grid-row: span 14;
}

/* Polaroid: molduras inclinadas com legenda-espaço */
.pgrid--polaroid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 26px;
  padding: 6px;
}
.pgrid--polaroid .pgrid__item {
  border-radius: 4px;
  padding: 12px 12px 34px;
  background: #fff;
  box-shadow: 0 18px 40px -20px rgba(0, 0, 0, 0.5);
  transform: rotate(-2deg);
  transition: transform 0.3s ease;
}
.pgrid--polaroid .pgrid__item:nth-child(even) {
  transform: rotate(2deg);
}
.pgrid--polaroid .pgrid__item:hover {
  transform: rotate(0) scale(1.03);
}
.pgrid--polaroid .pgrid__item img {
  aspect-ratio: 1 / 1;
  border-radius: 2px;
}

@media (max-width: 520px) {
  .pgrid--polaroid .pgrid__item {
    transform: none;
  }
}
</style>
