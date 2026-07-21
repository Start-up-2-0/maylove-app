<template>
  <div class="video-step">
    <WizardStepHeader
      v-if="!compact"
      title="Vídeo"
      description="Adicione um vídeo de abertura ou de fundo (YouTube, Vimeo ou MP4)."
    />

    <label class="ml-field video-field">
      <span class="ml-field__label">Link do vídeo</span>
      <input
        v-model="form.video_url"
        type="url"
        class="ml-input"
        placeholder="https://www.youtube.com/watch?v=..."
      />
      <span class="ml-field__hint">
        Deixe em branco para não usar vídeo. Aceita links do YouTube, Vimeo ou um arquivo .mp4.
      </span>
    </label>

    <div v-if="embedUrl" class="video-preview">
      <iframe
        v-if="isEmbed"
        :src="embedUrl"
        class="video-preview__frame"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
      <video v-else :src="embedUrl" class="video-preview__frame" controls />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = withDefaults(
  defineProps<{
    form: ReturnType<typeof useTributeWizard>['form']
    compact?: boolean
  }>(),
  { compact: false },
)

const isEmbed = computed(() => /youtube|youtu\.be|vimeo/i.test(props.form.video_url))

const embedUrl = computed(() => {
  const url = props.form.video_url?.trim()
  if (!url) return ''
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/i)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
})
</script>

<style scoped>
.video-field {
  max-width: 560px;
}
.video-preview {
  margin-top: 18px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  aspect-ratio: 16 / 9;
  max-width: 560px;
  background: #000;
}
.video-preview__frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
