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
import { resolveSupportedVideoEmbed } from '@/utils/videoUrl'

const props = defineProps<SectionComponentProps>()

const title = computed(() => (props.section.config?.title as string) || 'Vídeo especial')

const embed = computed(() => resolveSupportedVideoEmbed(props.content.videoUrl))
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
