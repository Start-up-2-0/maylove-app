<template>
  <section v-if="content.photos.length" class="exp-section">
    <div class="exp-container slider" v-reveal>
      <p v-if="title" class="exp-eyebrow slider__eyebrow">{{ title }}</p>
      <PhotoSlider v-if="mode === 'slider'" :photos="content.photos" :autoplay="autoplay" />
      <PhotoGrid v-else :photos="content.photos" :mode="mode" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PhotoStyle, SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'
import PhotoGrid from '../shared/PhotoGrid.vue'
import PhotoSlider from '../shared/PhotoSlider.vue'

const props = defineProps<SectionComponentProps>()

const title = computed(() => (props.section.config?.title as string) || 'Nossas fotos')
const autoplay = computed(() => props.section.config?.autoplay !== false)

// Slider é o padrão deste bloco; a escolha do usuário pode trocar para grade.
const mode = computed<PhotoStyle>(() => props.content.photoStyle || 'slider')
</script>

<style scoped>
.slider__eyebrow {
  text-align: center;
  display: block;
  margin-bottom: 26px;
}
</style>
