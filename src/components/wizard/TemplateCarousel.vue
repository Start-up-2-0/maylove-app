<template>
  <div class="template-carousel" role="listbox" :aria-label="ariaLabel">
    <button
      v-for="template in templates"
      :key="template.id"
      type="button"
      role="option"
      :aria-selected="modelValue === template.id"
      class="template-carousel-item text-left"
      :class="{ active: modelValue === template.id }"
      @click="$emit('update:modelValue', template.id)"
    >
      <div
        class="template-swatch"
        :style="{
          background: `linear-gradient(135deg, ${template.primary_color}, color-mix(in srgb, ${template.primary_color} 55%, white))`,
        }"
      />
      <div class="p-4">
        <strong class="block text-gray-900 dark:text-white">{{ template.name }}</strong>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          até {{ template.max_photos }} fotos
        </span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Template } from '@/api/types'

defineProps<{
  templates: Template[]
  modelValue: string
  ariaLabel?: string
}>()

defineEmits<{ 'update:modelValue': [id: string] }>()
</script>
