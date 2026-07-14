<template>
  <component
    :is="templateComponent"
    :book="book"
    :mode="mode"
    :share-url="shareUrl"
    :editable="editable"
    @update:board="onBoardUpdate"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getBookTemplate } from './registry'
import type { BookBoardItem } from './bookConfig'
import type { BookRenderMode, MemoryBookModel } from './types'

const props = withDefaults(
  defineProps<{
    book: MemoryBookModel
    mode?: BookRenderMode
    shareUrl?: string
    editable?: boolean
  }>(),
  {
    mode: 'full',
    editable: false,
  },
)

const emit = defineEmits<{
  'update:board': [items: BookBoardItem[]]
}>()

const mode = computed(() => props.mode ?? 'full')
const templateComponent = computed(() => getBookTemplate(props.book.presentation))

function onBoardUpdate(items: BookBoardItem[]) {
  emit('update:board', items)
}
</script>
