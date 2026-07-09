import { defineAsyncComponent, type Component } from 'vue'
import type { SectionType } from './types'

/**
 * Registro de componentes de secao. Adicionar uma nova capacidade a biblioteca =
 * criar o componente + adicionar uma entrada aqui + o tipo em SectionType.
 * Os templates passam a poder usar a secao apenas referenciando o type.
 */
export const SECTION_REGISTRY: Record<SectionType, Component> = {
  hero: defineAsyncComponent(() => import('@/components/experience/sections/HeroSection.vue')),
  photoSlider: defineAsyncComponent(
    () => import('@/components/experience/sections/PhotoSliderSection.vue'),
  ),
  gallery: defineAsyncComponent(
    () => import('@/components/experience/sections/GallerySection.vue'),
  ),
  messageSlider: defineAsyncComponent(
    () => import('@/components/experience/sections/MessageSliderSection.vue'),
  ),
  typewriter: defineAsyncComponent(
    () => import('@/components/experience/sections/TypewriterSection.vue'),
  ),
  timeline: defineAsyncComponent(
    () => import('@/components/experience/sections/TimelineSection.vue'),
  ),
  countdown: defineAsyncComponent(
    () => import('@/components/experience/sections/CountdownSection.vue'),
  ),
  video: defineAsyncComponent(() => import('@/components/experience/sections/VideoSection.vue')),
  signature: defineAsyncComponent(
    () => import('@/components/experience/sections/SignatureSection.vue'),
  ),
  finalMessage: defineAsyncComponent(
    () => import('@/components/experience/sections/FinalMessageSection.vue'),
  ),
}

export function getSectionComponent(type: SectionType): Component | null {
  return SECTION_REGISTRY[type] ?? null
}
