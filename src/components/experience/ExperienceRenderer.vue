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
        :config="mergedLayoutConfig"
      />
      <ProposalMoment
        v-if="themeLayout && showProposalMoment"
        :content="content"
        :theme="theme"
        :mode="mode"
        :share-url="shareUrl"
      />
      <footer v-if="themeLayout && showSignature" class="exp-signature" aria-label="Criado com MayLov">
        <span aria-hidden="true">♥</span>
        <span>Feito com carinho no <strong>MayLov</strong></span>
      </footer>
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
import ProposalMoment from './shared/ProposalMoment.vue'

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
    /** Exibe a assinatura interna; páginas públicas podem usar um rodapé próprio com CTA. */
    showSignature?: boolean
  }>(),
  { mode: 'full', shareUrl: '', presentation: null, contained: false, showSignature: true },
)

const root = ref<HTMLElement | null>(null)
const isFull = computed(() => props.mode === 'full')

// Apresentação escolhida define o layout + os ajustes (config). Se não houver,
// usa o layout default do template.
const presentation = computed(() => getPresentation(props.presentation))
const layoutConfig = computed<LayoutConfig>(() => presentation.value?.config ?? {})
const mergedLayoutConfig = computed<LayoutConfig>(() => ({
  ...layoutConfig.value,
  ...(props.contained ? { contained: true } : {}),
}))
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
  if (themeLayout.value) return themeLayout.value
  return getLayoutComponent(presentation.value?.layout ?? props.definition.layout)
})

const themeLayout = computed(() => getRomanceThemeLayout(props.content.romanceThemeId))

const showProposalMoment = computed(() =>
  Boolean(
    props.content.question ||
    props.content.romanceExperienceId === 'pedido-namoro' ||
    props.content.romanceExperienceId === 'pedido-casamento' ||
    presentation.value?.layout === 'proposal' ||
    props.definition.layout === 'proposal',
  ),
)

const usesThemePlayer = computed(() => romanceThemeUsesInlinePlayer(props.content.romanceThemeId))

const rootStyle = computed<CSSProperties>(() => {
  const vars: Record<string, string> = { ...props.theme.cssVars }
  if (props.contained) {
    vars['--exp-hero-min'] = '220px'
    vars['--exp-hero-card-min'] = '180px'
    vars['--exp-stage'] = 'auto'
    vars['--exp-first-fold'] = '460px'
  } else if (props.mode === 'preview') {
    vars['--exp-hero-min'] = '560px'
    vars['--exp-hero-card-min'] = '420px'
    vars['--exp-stage'] = '620px'
    vars['--exp-first-fold'] = '620px'
  } else {
    vars['--exp-stage'] = '100svh'
    vars['--exp-first-fold'] = 'min(100svh, 900px)'
  }
  return { ...vars, fontFamily: props.theme.fontBody }
})
</script>

<style scoped>
.exp-root {
  --exp-type-display: clamp(2rem, 8cqi, 5.5rem);
  --exp-type-title: clamp(1.5rem, 5cqi, 3rem);
  --exp-type-body: clamp(1rem, 2.2cqi, 1.2rem);
  --exp-type-caption: clamp(0.72rem, 1.7cqi, 0.88rem);
  --exp-space-section: clamp(36px, 8cqi, 88px);
  --exp-motion-fast: 180ms;
  --exp-motion-base: 420ms;
  --exp-motion-slow: 800ms;
  --exp-ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
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
.exp-root--contained :deep(.curtain-overlay--embedded) {
  position: absolute;
}
.exp-root--contained :deep(.curtain-theme) {
  position: relative;
  min-height: 100%;
}
.exp-root--contained :deep(.gift-overlay--embedded) {
  position: absolute;
}
.exp-root--contained :deep(.gift-theme) {
  position: relative;
  min-height: 100%;
}
.exp-shell {
  position: relative;
  z-index: 2;
  container-type: inline-size;
}
.exp-signature {
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 64px;
  padding: 18px 20px;
  border-top: 1px solid color-mix(in srgb, var(--exp-primary, #e11d7a) 18%, transparent);
  background: color-mix(in srgb, var(--exp-bg, #fff) 94%, transparent);
  color: var(--exp-muted, #745f6b);
  font: 600 var(--exp-type-caption, 0.78rem)/1.3 system-ui, sans-serif;
  letter-spacing: 0.035em;
  text-align: center;
}
.exp-signature > span:first-child {
  color: var(--exp-primary, #e11d7a);
  font-size: 0.92rem;
}
.exp-signature strong {
  color: var(--exp-ink, currentColor);
  font-weight: 800;
}
.exp-controls {
  position: fixed;
  top: clamp(14px, 3vw, 24px);
  right: clamp(14px, 3vw, 24px);
  z-index: 60;
  display: flex;
  gap: 10px;
}
@media (prefers-reduced-motion: reduce) {
  .exp-root {
    --exp-motion-fast: 1ms;
    --exp-motion-base: 1ms;
    --exp-motion-slow: 1ms;
  }
}
</style>
