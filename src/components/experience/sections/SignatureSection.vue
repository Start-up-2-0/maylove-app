<template>
  <section v-if="signature" class="exp-section signature-section">
    <div class="exp-container signature" v-reveal>
      <span class="signature__flourish" aria-hidden="true">✦</span>
      <p class="signature__from">{{ prefix }}</p>
      <p class="signature__name">{{ signature }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'

const props = defineProps<SectionComponentProps>()

const prefix = computed(() => (props.section.config?.prefix as string) || 'Com amor,')
const signature = computed(() => props.content.signature || props.content.senderName)
</script>

<style scoped>
.signature-section {
  text-align: center;
}
.signature__flourish {
  display: block;
  color: var(--exp-primary);
  font-size: 1.4rem;
  margin-bottom: 14px;
}
.signature__from {
  color: var(--exp-muted);
  font-size: 1rem;
}
.signature__name {
  margin-top: 8px;
  font-family: var(--exp-font-display);
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  color: var(--exp-ink);
}
</style>
