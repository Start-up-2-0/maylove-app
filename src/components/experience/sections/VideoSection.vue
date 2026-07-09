<template>
  <section v-if="embed" class="exp-section video-section">
    <div class="exp-container" v-reveal>
      <p v-if="title" class="exp-eyebrow video__eyebrow">{{ title }}</p>
      <div class="video__frame">
        <iframe
          v-if="embed.type === 'iframe'"
          :src="embed.src"
          class="video__media"
          title="Vídeo da homenagem"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        <video v-else :src="embed.src" class="video__media" controls playsinline />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'

const props = defineProps<SectionComponentProps>()

const title = computed(() => (props.section.config?.title as string) || 'Vídeo especial')

const embed = computed(() => {
  const url = props.content.videoUrl
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) return { type: 'iframe' as const, src: `https://www.youtube.com/embed/${yt[1]}` }
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return { type: 'iframe' as const, src: `https://player.vimeo.com/video/${vimeo[1]}` }
  return { type: 'video' as const, src: url }
})
</script>

<style scoped>
.video-section {
  text-align: center;
}
.video__eyebrow {
  display: block;
  margin-bottom: 24px;
}
.video__frame {
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.5);
}
.video__media {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
</style>
