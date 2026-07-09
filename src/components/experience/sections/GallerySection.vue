<template>
  <section v-if="content.photos.length" class="exp-section gallery-section">
    <div class="gallery-wrap">
      <p v-if="title" v-reveal class="exp-eyebrow gallery__eyebrow">{{ title }}</p>
      <div v-reveal>
        <PhotoSlider v-if="mode === 'slider'" :photos="content.photos" :autoplay="autoplay" />
        <PhotoGrid v-else :photos="content.photos" :mode="mode" />
      </div>
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

const title = computed(() => (props.section.config?.title as string) || 'Galeria')
const autoplay = computed(() => props.section.config?.autoplay !== false)

// Modo escolhido pelo usuário tem prioridade; senão usa a config do template.
const mode = computed<PhotoStyle>(() => {
  if (props.content.photoStyle) return props.content.photoStyle
  const legacy = props.section.config?.layout as string | undefined
  return legacy === 'grid' ? 'gallery' : 'mosaic'
})
</script>

<style scoped>
.gallery-wrap {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
}
.gallery__eyebrow {
  text-align: center;
  display: block;
  margin-bottom: 30px;
}
</style>
