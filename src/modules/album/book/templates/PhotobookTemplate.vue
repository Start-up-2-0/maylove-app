<template>
  <BookShell
    :book="book"
    :mode="mode"
    :share-url="shareUrl"
    :tpl-class="`book-tpl--${theme.id}`"
    :show-binder="theme.features.showBinder"
    :shell-style="shellStyle"
  >
    <template #cover="{ opened }">
      <BookCover :book="book" :theme="theme" :opened="opened" />
    </template>
    <template #page="{ page }">
      <PageComposition :page="page" :theme="theme" />
    </template>
    <template #back>
      <BookBackCover :book="book" :mode="mode" :share-url="shareUrl" />
    </template>
  </BookShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BookCover from '../shared/BookCover.vue'
import BookBackCover from '../shared/BookBackCover.vue'
import PageComposition from '../shared/PageComposition.vue'
import BookShell from '../shared/BookShell.vue'
import { getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import type { BookRenderMode, MemoryBookModel } from '../types'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const theme = computed(() => getBookTheme(normalizePresentationId(props.book.presentation)))

const shellStyle = computed(() => getThemeCssVars(theme.value, props.book.colorPrimary))
</script>
