<template>
  <div class="rom-phone-preview">
    <div class="rom-phone-preview__head">
      <p class="rom-phone-preview__eyebrow">{{ eyebrow }}</p>
    </div>

    <div class="rom-phone-preview__device">
      <div class="rom-phone-preview__bezel">
        <div class="rom-phone-preview__screen">
          <div class="rom-phone-preview__content">
            <slot />
          </div>
        </div>
      </div>
    </div>

    <div v-if="$slots.footer" class="rom-phone-preview__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
  }>(),
  {
    eyebrow: 'Prévia ao vivo',
  },
)
</script>

<style scoped>
.rom-phone-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}
.rom-phone-preview__head {
  width: 100%;
  text-align: center;
}
.rom-phone-preview__eyebrow {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--rom-muted, #9f1239);
}
.rom-phone-preview__device {
  display: flex;
  justify-content: center;
  width: 100%;
}
.rom-phone-preview__bezel {
  width: min(100%, 272px);
  padding: 10px 8px;
  border-radius: 28px;
  background: linear-gradient(180deg, #243049 0%, #121a2b 100%);
  border: 2px solid #0b1020;
  box-shadow:
    0 20px 44px -24px rgb(15 23 42 / 50%),
    inset 0 0 0 1px rgb(255 255 255 / 8%);
}
.rom-phone-preview__screen {
  display: flex;
  flex-direction: column;
  height: min(52vh, 480px);
  min-height: 340px;
  border-radius: 20px;
  overflow: hidden;
  background: #0b0b0f;
  border: 2px solid #0b1020;
}
.rom-phone-preview__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.rom-phone-preview__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink);
}
</style>
