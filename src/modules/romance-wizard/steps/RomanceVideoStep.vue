<template>
  <RomanceFormShell :title="stepTitle" :prompt="stepPrompt">
    <label class="rom-field">
      <span class="rom-field__label">URL do vídeo</span>
      <input
        v-model="form.video_url"
        class="rom-field__input"
        type="url"
        placeholder="https://www.youtube.com/watch?v=..."
        maxlength="500"
        autocomplete="off"
      />
      <span class="rom-field__hint">
        Opcional · YouTube, Vimeo ou arquivo HTTPS em MP4/WebM · {{ form.video_url.length }}/500
      </span>
      <span v-if="form.video_url && provider" class="rom-video-status rom-video-status--valid">
        ✓ Link {{ providerLabel }} reconhecido
      </span>
      <span v-else-if="form.video_url" class="rom-video-status rom-video-status--invalid">
        Use um link HTTPS válido e publicamente acessível.
      </span>
    </label>
    <div class="rom-video-privacy" role="note">
      <strong>Privacidade e exibição</strong>
      <span>O vídeo será incorporado na página compartilhável. No YouTube ou Vimeo, configure a visibilidade para permitir incorporação. O MayLov não altera a privacidade definida na plataforma de origem.</span>
    </div>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'
import { resolveSupportedVideoProvider } from '@/utils/videoUrl'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
}>()

const stepTitle = computed(() => getCoachStepTitle('video', 'Vídeo especial'))
const stepPrompt = computed(() => getCoachPrompt('video', props.experienceId))
const provider = computed(() => resolveSupportedVideoProvider(props.form.video_url))
const providerLabel = computed(() => ({
  youtube: 'do YouTube',
  vimeo: 'do Vimeo',
  direct: 'de vídeo direto',
})[provider.value ?? 'direct'])
</script>

<style scoped>
.rom-video-status { display: block; margin-top: 6px; font-size: 0.78rem; font-weight: 700; }
.rom-video-status--valid { color: var(--success); }
.rom-video-status--invalid { color: var(--danger); }
.rom-video-privacy {
  display: grid;
  gap: 4px;
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.45;
}
.rom-video-privacy strong { color: var(--ink); }
</style>
