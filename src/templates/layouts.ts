import { defineAsyncComponent, type Component } from 'vue'
import type { ExperienceLayout } from './types'

/**
 * Registro dos shells de experiência. Cada layout define um fluxo de navegação e
 * composição visual próprios. Adicionar um novo layout = criar o componente +
 * uma entrada aqui + o tipo em ExperienceLayout.
 */
export const LAYOUT_REGISTRY: Record<ExperienceLayout, Component> = {
  scroll: defineAsyncComponent(() => import('@/components/experience/layouts/ScrollLayout.vue')),
  letter: defineAsyncComponent(() => import('@/components/experience/layouts/LetterLayout.vue')),
  envelope: defineAsyncComponent(
    () => import('@/components/experience/layouts/EnvelopeLayout.vue'),
  ),
  album: defineAsyncComponent(() => import('@/components/experience/layouts/AlbumLayout.vue')),
  storytelling: defineAsyncComponent(
    () => import('@/components/experience/layouts/StorytellingLayout.vue'),
  ),
  cinematic: defineAsyncComponent(
    () => import('@/components/experience/layouts/CinematicLayout.vue'),
  ),
  proposal: defineAsyncComponent(
    () => import('@/components/experience/layouts/ProposalLayout.vue'),
  ),
  timeline: defineAsyncComponent(
    () => import('@/components/experience/layouts/TimelineLayout.vue'),
  ),
}

export function getLayoutComponent(layout: ExperienceLayout | undefined): Component {
  return LAYOUT_REGISTRY[layout ?? 'scroll'] ?? LAYOUT_REGISTRY.scroll
}
