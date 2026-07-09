<template>
  <div
    ref="root"
    class="exp-root"
    :class="[`exp-root--${theme.mode}`, `exp-entrance--${theme.entrance}`]"
    :style="rootStyle"
  >
    <EffectsLayer :effects="content.effects" :accent="theme.accentColor" />

    <div class="exp-shell">
      <component
        :is="layoutComponent"
        :definition="definition"
        :content="content"
        :theme="theme"
        :mode="mode"
        :share-url="shareUrl"
        :config="layoutConfig"
      />
    </div>

    <div v-if="isFull" class="exp-controls">
      <FullscreenToggle :target="root" />
    </div>

    <MusicPlayerFloat
      v-if="isFull && content.music.url && musicEnabled"
      :url="content.music.url"
      :loop="content.music.loop !== false"
      :autoplay="content.music.autoplay !== false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'
import type {
  ExperienceContent,
  LayoutConfig,
  ResolvedTheme,
  TemplateDefinition,
} from '@/templates/types'
import { getLayoutComponent } from '@/templates/layouts'
import { getPresentation } from '@/templates/presentations'
import { provideExperienceAudio } from '@/composables/experienceAudio'
import EffectsLayer from './shared/EffectsLayer.vue'
import FullscreenToggle from './shared/FullscreenToggle.vue'
import MusicPlayerFloat from './shared/MusicPlayerFloat.vue'

const props = withDefaults(
  defineProps<{
    definition: TemplateDefinition
    content: ExperienceContent
    theme: ResolvedTheme
    mode?: 'full' | 'preview'
    shareUrl?: string
    /** Estilo de apresentação escolhido (id). Sobrepõe o layout default do template. */
    presentation?: string | null
  }>(),
  { mode: 'full', shareUrl: '', presentation: null },
)

const root = ref<HTMLElement | null>(null)
const isFull = computed(() => props.mode === 'full')

// Apresentação escolhida define o layout + os ajustes (config). Se não houver,
// usa o layout default do template.
const presentation = computed(() => getPresentation(props.presentation))
const layoutConfig = computed<LayoutConfig>(() => presentation.value?.config ?? {})
const musicEnabled = computed(() => layoutConfig.value.music !== false)

// Áudio único compartilhado com os shells (só quando a apresentação usa música).
provideExperienceAudio(
  () => (musicEnabled.value ? props.content.music.url : null),
  {
    loop: () => props.content.music.loop !== false,
    autoplay: () => props.content.music.autoplay !== false,
  },
)

const layoutComponent = computed(() =>
  getLayoutComponent(presentation.value?.layout ?? props.definition.layout),
)

const rootStyle = computed<CSSProperties>(() => {
  const vars: Record<string, string> = { ...props.theme.cssVars }
  if (props.mode === 'preview') {
    vars['--exp-hero-min'] = '560px'
    vars['--exp-hero-card-min'] = '420px'
    vars['--exp-stage'] = '620px'
  } else {
    vars['--exp-stage'] = '100svh'
  }
  return { ...vars, fontFamily: props.theme.fontBody }
})
</script>

<style scoped>
.exp-root {
  position: relative;
  min-height: 100%;
  isolation: isolate;
}
.exp-shell {
  position: relative;
  z-index: 2;
}
.exp-controls {
  position: fixed;
  top: clamp(14px, 3vw, 24px);
  right: clamp(14px, 3vw, 24px);
  z-index: 60;
  display: flex;
  gap: 10px;
}
</style>
