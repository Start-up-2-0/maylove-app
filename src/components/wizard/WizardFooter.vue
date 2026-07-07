<template>
  <footer class="wizard-footer-bar">
    <div class="wizard-footer-inner">
      <FwbButton
        color="alternative"
        :disabled="!hasPrevious"
        @click="$emit('previous')"
      >
        Voltar
      </FwbButton>

      <div class="wizard-footer-actions">
        <FwbButton
          v-if="showPreviewButton"
          color="light"
          class="lg:hidden"
          @click="$emit('preview')"
        >
          Preview
        </FwbButton>
        <FwbButton
          v-if="hasNext"
          color="pink"
          @click="$emit('next')"
        >
          Continuar
        </FwbButton>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { FwbButton } from 'flowbite-vue'

defineProps<{
  hasPrevious: boolean
  hasNext: boolean
  showPreviewButton?: boolean
}>()

defineEmits<{
  previous: []
  next: []
  preview: []
}>()
</script>
