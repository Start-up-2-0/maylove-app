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
      <PageComposition :page="page" :theme="theme" :frame-style="bookConfig.frame_style" />
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
import { fontPresetVars, getBookTheme, getThemeCssVars } from '../themes'
import { normalizePresentationId } from '../presentations'
import { normalizeBookConfig } from '../bookConfig'
import type { BookRenderMode, MemoryBookModel } from '../types'

const props = defineProps<{
  book: MemoryBookModel
  mode: BookRenderMode
  shareUrl?: string
}>()

const theme = computed(() => getBookTheme(normalizePresentationId(props.book.presentation)))
const bookConfig = computed(() => normalizeBookConfig(props.book.bookConfig))
const fonts = computed(() => fontPresetVars(bookConfig.value.fonts.preset))

const shellStyle = computed(() =>
  getThemeCssVars(theme.value, bookConfig.value.colors.accent || props.book.colorPrimary, {
    paper: bookConfig.value.colors.paper,
    ink: bookConfig.value.colors.ink,
    page: bookConfig.value.colors.page || bookConfig.value.colors.paper,
    fontDisplay: fonts.value.display,
    fontBody: fonts.value.body,
  }),
)
</script>
