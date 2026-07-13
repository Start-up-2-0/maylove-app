<template>
  <component
    :is="templateComponent"
    :book="book"
    :mode="mode"
    :share-url="shareUrl"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getBookTemplate } from './registry'
import type { BookRenderMode, MemoryBookModel } from './types'

const props = defineProps<{
  book: MemoryBookModel
  mode?: BookRenderMode
  shareUrl?: string
}>()

const mode = computed(() => props.mode ?? 'full')
const templateComponent = computed(() => getBookTemplate(props.book.presentation))
</script>
