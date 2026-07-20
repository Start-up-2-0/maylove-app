<template>
  <footer class="rom-wizard-footer">
    <div class="rom-wizard-footer__inner">
      <button
        type="button"
        class="rom-wizard-footer__back"
        :disabled="!hasPrevious || loading"
        @click="$emit('previous')"
      >
        Voltar
      </button>

      <div class="rom-wizard-footer__actions">
        <button
          v-if="showPreviewButton"
          type="button"
          class="rom-wizard-footer__ghost lg:hidden"
          @click="$emit('preview')"
        >
          Ver prévia
        </button>
        <button
          v-if="hasNext"
          type="button"
          class="rom-wizard-footer__continue"
          :disabled="loading"
          @click="$emit('next')"
        >
          <span v-if="loading" class="ml-spinner ml-spinner--sm" />
          {{ continueLabel }}
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    hasPrevious: boolean
    hasNext: boolean
    loading?: boolean
    showPreviewButton?: boolean
    continueLabel?: string
  }>(),
  {
    loading: false,
    showPreviewButton: true,
    continueLabel: 'Continuar',
  },
)

defineEmits<{
  previous: []
  next: []
  preview: []
}>()
</script>

<style scoped>
.rom-wizard-footer {
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--bg) 92%, transparent),
    transparent
  );
  backdrop-filter: blur(8px);
}
.rom-wizard-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 520px;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 14%, var(--border));
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  box-shadow: 0 18px 40px -28px color-mix(in srgb, var(--rom-accent, #e11d48) 35%, transparent);
}
.rom-wizard-footer__back {
  border: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}
.rom-wizard-footer__back:hover:not(:disabled) {
  color: var(--ink);
}
.rom-wizard-footer__back:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.rom-wizard-footer__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.rom-wizard-footer__ghost {
  border: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--rom-accent, #e11d48);
  cursor: pointer;
}
.rom-wizard-footer__continue {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 148px;
  padding: 12px 22px;
  border: none;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--rom-accent, #e11d48),
    color-mix(in srgb, var(--rom-accent, #e11d48) 75%, #fb7185)
  );
  box-shadow: 0 14px 30px -16px color-mix(in srgb, var(--rom-accent, #e11d48) 70%, transparent);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.rom-wizard-footer__continue:hover:not(:disabled) {
  transform: translateY(-1px);
}
.rom-wizard-footer__continue:disabled {
  opacity: 0.65;
  cursor: wait;
}
</style>
