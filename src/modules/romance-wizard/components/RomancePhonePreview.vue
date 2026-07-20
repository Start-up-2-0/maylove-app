<template>
  <div class="rom-phone-preview">
    <div class="rom-phone-preview__head">
      <p class="rom-phone-preview__eyebrow">{{ eyebrow }}</p>
      <p v-if="experienceLabel" class="rom-phone-preview__experience">{{ experienceLabel }}</p>
      <p v-if="hint" class="rom-phone-preview__hint">{{ hint }}</p>
    </div>

    <div class="rom-phone-preview__device" aria-hidden="true">
      <div class="rom-phone-preview__bezel">
        <div class="rom-phone-preview__notch" />
        <div class="rom-phone-preview__screen">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    experienceLabel?: string
    hint?: string
  }>(),
  {
    eyebrow: 'Veja como ficará',
    experienceLabel: '',
    hint: '',
  },
)
</script>

<style scoped>
.rom-phone-preview {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
}
.rom-phone-preview__head {
  text-align: center;
  padding: 0 8px;
}
.rom-phone-preview__eyebrow {
  margin: 0 0 6px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rom-muted, #9f1239);
}
.rom-phone-preview__experience {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
}
.rom-phone-preview__hint {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--muted);
}
.rom-phone-preview__device {
  display: flex;
  justify-content: center;
  flex: 1;
  min-height: 0;
}
.rom-phone-preview__bezel {
  width: min(100%, 320px);
  padding: 10px;
  border-radius: 36px;
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--ink) 8%, var(--surface)),
    color-mix(in srgb, var(--ink) 4%, var(--surface))
  );
  border: 2px solid color-mix(in srgb, var(--ink) 12%, var(--border));
  box-shadow:
    0 28px 60px -32px color-mix(in srgb, var(--rom-accent, #e11d48) 35%, transparent),
    inset 0 0 0 1px color-mix(in srgb, #fff 40%, transparent);
}
.rom-phone-preview__notch {
  width: 96px;
  height: 22px;
  margin: 0 auto 8px;
  border-radius: 0 0 14px 14px;
  background: color-mix(in srgb, var(--ink) 10%, var(--surface));
}
.rom-phone-preview__screen {
  min-height: 420px;
  max-height: min(68vh, 640px);
  overflow: hidden;
  border-radius: 26px;
  background: var(--bg);
  border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
}
@media (min-width: 1024px) {
  .rom-phone-preview__screen {
    min-height: 480px;
  }
}
</style>
