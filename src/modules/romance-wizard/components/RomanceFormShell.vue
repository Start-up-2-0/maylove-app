<template>
  <div class="rom-form-step">
    <div class="rom-form-step__coach">
      <RomanceCoachAvatar :large="coachLarge" />
      <div class="rom-form-step__bubble">
        <p class="rom-form-step__coach-name">{{ coachName }}</p>
        <p v-if="title" class="rom-form-step__title">{{ title }}</p>
        <p class="rom-form-step__prompt">{{ prompt }}</p>
      </div>
    </div>

    <section class="rom-form-card" :class="{ 'rom-form-card--flat': flat }">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
import RomanceCoachAvatar from '@/modules/romance-wizard/components/RomanceCoachAvatar.vue'
import { ROMANCE_COACH_NAME } from '@/modules/romance-wizard/romanceBuildCopy'

withDefaults(
  defineProps<{
    title?: string
    prompt: string
    flat?: boolean
    coachName?: string
    coachLarge?: boolean
  }>(),
  {
    flat: false,
    coachName: ROMANCE_COACH_NAME,
    coachLarge: false,
  },
)
</script>
