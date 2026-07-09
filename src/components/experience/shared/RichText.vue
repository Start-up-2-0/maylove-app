<template>
  <component :is="tag" class="rich-text" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toDisplayHtml } from '@/utils/richText'

const props = withDefaults(
  defineProps<{
    text?: string | null
    tag?: string
  }>(),
  { text: '', tag: 'div' },
)

const html = computed(() => toDisplayHtml(props.text))
</script>

<style scoped>
.rich-text {
  white-space: normal;
}
.rich-text :deep(p) {
  margin: 0 0 0.8em;
}
.rich-text :deep(p:last-child) {
  margin-bottom: 0;
}
.rich-text :deep(strong),
.rich-text :deep(b) {
  font-weight: 700;
}
.rich-text :deep(em),
.rich-text :deep(i) {
  font-style: italic;
}
.rich-text :deep(u) {
  text-decoration: underline;
}
.rich-text :deep(s),
.rich-text :deep(strike) {
  text-decoration: line-through;
}
.rich-text :deep(ul),
.rich-text :deep(ol) {
  margin: 0 0 0.8em;
  padding-left: 1.4em;
  text-align: left;
  display: inline-block;
}
.rich-text :deep(li) {
  margin: 0.15em 0;
}
.rich-text :deep(a) {
  color: var(--exp-primary, currentColor);
  text-decoration: underline;
}
.rich-text :deep(blockquote) {
  margin: 0 0 0.8em;
  padding-left: 0.9em;
  border-left: 3px solid color-mix(in srgb, var(--exp-primary, currentColor) 40%, transparent);
  font-style: italic;
}
</style>
