<template>
  <ExperienceTimelineList
    :items="items"
    :title="title"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import ExperienceTimelineList from '../shared/ExperienceTimelineList.vue'

const props = defineProps<SectionComponentProps>()

const title = computed(() => (props.section.config?.title as string) || 'Nossa história')
const items = computed(() => props.content.timeline)
</script>
