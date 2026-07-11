<template>
  <section v-if="text" class="exp-section final-section">
    <div class="exp-container final" v-reveal>
      <span class="final__mark" aria-hidden="true">♥</span>
      <TypewriterText
        class="final__text"
        tag="p"
        :text="text"
        :active="typing"
        :speed-multiplier="theme.speedMultiplier"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'
import TypewriterText from '../shared/TypewriterText.vue'

const props = defineProps<SectionComponentProps>()

const text = computed(() => {
  if (!props.content.includeClosingMessage) return ''
  return (props.section.config?.text as string) || props.content.closingMessage || 'Com todo o carinho.'
})
const typing = computed(() => props.content.textStyle === 'typewriter')
</script>

<style scoped>
.final-section {
  text-align: center;
  padding-bottom: clamp(70px, 12vw, 140px);
}
.final__mark {
  display: block;
  color: var(--exp-primary);
  font-size: 2rem;
  margin-bottom: 20px;
}
.final__text {
  font-family: var(--exp-font-display);
  font-size: clamp(1.5rem, 4.5vw, 2.6rem);
  line-height: 1.4;
  color: var(--exp-ink);
}
</style>
