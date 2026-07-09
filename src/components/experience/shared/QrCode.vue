<template>
  <div class="qr">
    <img class="qr__img" :src="src" :alt="`QR code para ${value}`" width="140" height="140" loading="lazy" />
    <span v-if="label" class="qr__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    color?: string
  }>(),
  { label: '', color: '241820' },
)

const src = computed(() => {
  const data = encodeURIComponent(props.value)
  const color = props.color.replace('#', '')
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&color=${color}&data=${data}`
})
</script>

<style scoped>
.qr {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.qr__img {
  width: 140px;
  height: 140px;
  border-radius: 14px;
  background: #fff;
  padding: 8px;
  box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.4);
}
.qr__label {
  font-size: 0.78rem;
  color: var(--exp-muted, #7c6a74);
}
</style>
