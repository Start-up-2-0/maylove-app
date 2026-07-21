<template>
  <div
    ref="root"
    class="exp-root"
    :class="[
      `exp-root--${theme.mode}`,
      `exp-entrance--${theme.entrance}`,
      { 'exp-root--contained': contained },
    ]"
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
      v-if="isFull && content.music.url && musicEnabled && !usesThemePlayer"
      :url="content.music.url"
      :loop="content.music.loop !== false"
      :autoplay="content.music.autoplay !== false"
      :start-at="content.music.startAt ?? 0"
      :end-at="content.music.endAt ?? null"
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
import {
  getRomanceThemeLayout,
  romanceThemeUsesInlinePlayer,
} from '@/modules/romance-wizard/romanceThemeLayouts'
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
    /** Renderiza dentro de um frame estreito (mockup do wizard), sem unidades de viewport. */
    contained?: boolean
  }>(),
  { mode: 'full', shareUrl: '', presentation: null, contained: false },
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
    startAt: () => props.content.music.startAt ?? 0,
    endAt: () => props.content.music.endAt ?? null,
  },
)

const layoutComponent = computed(() => {
  const themeLayout = getRomanceThemeLayout(props.content.romanceThemeId)
  if (themeLayout) return themeLayout
  return getLayoutComponent(presentation.value?.layout ?? props.definition.layout)
})

const usesThemePlayer = computed(() => romanceThemeUsesInlinePlayer(props.content.romanceThemeId))

const rootStyle = computed<CSSProperties>(() => {
  const vars: Record<string, string> = { ...props.theme.cssVars }
  if (props.contained) {
    vars['--exp-hero-min'] = '220px'
    vars['--exp-hero-card-min'] = '180px'
    vars['--exp-stage'] = 'auto'
  } else if (props.mode === 'preview') {
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
.exp-root--contained {
  min-height: 0;
  width: 100%;
  max-width: 100%;
}
.exp-root--contained .exp-controls {
  display: none;
}
.exp-root--contained :deep(.env) {
  min-height: auto;
  padding: 12px 8px 16px;
  gap: 12px;
}
.exp-root--contained :deep(.env--preview) {
  min-height: auto;
}
.exp-root--contained :deep(.env-stage--animating) {
  min-height: calc(var(--pack-h) + clamp(100px, 40cqw, 200px));
}
.exp-root--contained :deep(.cin-root) {
  min-height: 0;
}
.exp-root--contained :deep(.cin) {
  min-height: auto;
  padding: 0;
}
.exp-root--contained :deep(.cin__stage) {
  height: auto;
  min-height: 280px;
  max-height: 360px;
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
