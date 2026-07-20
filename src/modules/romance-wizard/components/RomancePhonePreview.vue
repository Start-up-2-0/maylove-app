<template>
  <div class="rom-phone-preview" :class="{ 'rom-phone-preview--compact': compact }">
    <div v-if="showHead" class="rom-phone-preview__head">
      <p class="rom-phone-preview__eyebrow">{{ eyebrow }}</p>
      <p v-if="experienceLabel" class="rom-phone-preview__experience">{{ experienceLabel }}</p>
      <p v-if="hint" class="rom-phone-preview__hint">{{ hint }}</p>
    </div>

    <div class="rom-phone-preview__device">
      <div class="rom-phone-preview__bezel">
        <div class="rom-phone-preview__screen">
          <header v-if="!compact" class="rom-phone-preview__inbar">
            <span class="rom-phone-preview__inbar-back" aria-hidden="true">‹</span>
            <span class="rom-phone-preview__inbar-title">{{ experienceName || 'MayLov' }}</span>
            <span class="rom-phone-preview__inbar-spacer" />
          </header>

          <div v-if="!compact && experienceName" class="rom-phone-preview__selector">
            <span>{{ experienceName }}</span>
            <span v-if="stepTotal" class="rom-phone-preview__selector-meta">{{ stepCurrent }} / {{ stepTotal }}</span>
          </div>

          <div class="rom-phone-preview__content">
            <slot />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!compact && experienceName && stepTotal" class="rom-phone-preview__dock">
      <button type="button" class="rom-phone-preview__dock-btn" disabled aria-hidden="true">‹</button>
      <div class="rom-phone-preview__dock-pill">
        <span v-if="experienceIcon" class="rom-phone-preview__dock-icon">{{ experienceIcon }}</span>
        <span>{{ experienceName }} {{ stepCurrent }} / {{ stepTotal }}</span>
      </div>
      <button type="button" class="rom-phone-preview__dock-btn" disabled aria-hidden="true">›</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    experienceLabel?: string
    hint?: string
    experienceName?: string
    experienceIcon?: string
    stepCurrent?: number
    stepTotal?: number
    compact?: boolean
  }>(),
  {
    eyebrow: 'Veja como ficará',
    experienceLabel: '',
    hint: '',
    experienceName: '',
    experienceIcon: '',
    stepCurrent: 0,
    stepTotal: 0,
    compact: true,
  },
)

const showHead = computed(() => Boolean(props.experienceLabel || props.hint))
</script>

<style scoped>
.rom-phone-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.rom-phone-preview__head {
  width: 100%;
  max-width: 280px;
  text-align: center;
}
.rom-phone-preview__eyebrow {
  margin: 0 0 4px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rom-muted, #9f1239);
}
.rom-phone-preview__experience {
  margin: 0 0 4px;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--ink);
}
.rom-phone-preview__hint {
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.4;
  color: var(--muted);
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
  height: min(52vh, 460px);
  min-height: 320px;
  border-radius: 20px;
  overflow: hidden;
  background: #f3ece2;
  border: 2px solid #0b1020;
}
.rom-phone-preview__inbar {
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 6px;
  background: #faf4ea;
  border-bottom: 1px solid #ddd3c4;
}
.rom-phone-preview__inbar-back {
  font-size: 1.4rem;
  line-height: 1;
  color: #2f2a24;
}
.rom-phone-preview__inbar-title {
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: #2f2a24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rom-phone-preview__selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 8px 12px 0;
  padding: 8px 12px;
  border-radius: 999px;
  border: 2px solid #2f2a24;
  background: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  color: #2f2a24;
}
.rom-phone-preview__selector-meta {
  opacity: 0.72;
}
.rom-phone-preview__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.rom-phone-preview__dock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: min(100%, clamp(300px, 30vw, 390px));
}
.rom-phone-preview__dock-btn {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
  background: #fff;
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1;
}
.rom-phone-preview__dock-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
  background: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rom-phone-preview__dock-icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #f97316;
  font-size: 0.72rem;
  line-height: 1;
}
.rom-phone-preview--compact .rom-phone-preview__bezel {
  width: min(100%, 260px);
}
.rom-phone-preview--compact .rom-phone-preview__screen {
  height: min(48vh, 420px);
  min-height: 300px;
}
</style>
