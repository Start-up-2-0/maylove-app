<template>
  <div class="romance-wizard rom-build-shell">
    <RomanceFloatingHearts />

    <header v-if="showHeader" class="rom-build-shell__header">
      <div class="rom-build-shell__header-main">
        <RouterLink v-if="backHref" :to="backHref" class="rom-build-shell__back">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ backLabel }}
        </RouterLink>

        <div class="rom-build-shell__brand">
          <p class="rom-build-shell__eyebrow">{{ ROMANCE_LOVE_CARDS_TAGLINE }}</p>
          <h1 v-if="title" class="rom-build-shell__title">{{ title }}</h1>
          <p v-if="subtitle" class="rom-build-shell__subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div v-if="$slots.meta" class="rom-build-shell__meta">
        <slot name="meta" />
      </div>
    </header>

    <div class="rom-build-shell__body" :class="{ 'rom-build-shell__body--split': split }">
      <div class="rom-build-shell__main">
        <slot />
      </div>
      <aside v-if="$slots.preview" class="rom-build-shell__preview">
        <slot name="preview" />
      </aside>
    </div>

    <footer v-if="$slots.footer" class="rom-build-shell__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import RomanceFloatingHearts from '@/modules/romance-wizard/components/RomanceFloatingHearts.vue'
import { ROMANCE_LOVE_CARDS_TAGLINE } from '@/modules/romance-wizard/romanceBuildCopy'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    backHref?: string
    backLabel?: string
    showHeader?: boolean
    split?: boolean
  }>(),
  {
    title: '',
    subtitle: '',
    backHref: '/dashboard',
    backLabel: 'Romances',
    showHeader: true,
    split: true,
  },
)
</script>

<style scoped>
.rom-build-shell {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 64px);
  padding: 0 clamp(12px, 2.5vw, 28px) 24px;
}
.rom-build-shell__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin-bottom: 22px;
  padding-top: 8px;
}
.rom-build-shell__header-main {
  flex: 1;
  min-width: 220px;
}
.rom-build-shell__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted);
  text-decoration: none;
}
.rom-build-shell__back:hover {
  color: var(--ink);
}
.rom-build-shell__eyebrow {
  margin: 0 0 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--rom-muted, #9f1239);
}
.rom-build-shell__title {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.95rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--ink);
}
.rom-build-shell__subtitle {
  margin: 8px 0 0;
  max-width: 520px;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}
.rom-build-shell__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.rom-build-shell__body {
  display: grid;
  gap: 24px;
  align-items: start;
  width: 100%;
}
.rom-build-shell__body--split {
  gap: clamp(24px, 3vw, 40px);
}
@media (min-width: 1024px) {
  .rom-build-shell__body--split {
    grid-template-columns: minmax(380px, 46fr) minmax(420px, 54fr);
  }
}
@media (min-width: 1440px) {
  .rom-build-shell__body--split {
    grid-template-columns: minmax(420px, 44fr) minmax(520px, 56fr);
  }
}
.rom-build-shell__main {
  min-width: 0;
}
.rom-build-shell__preview {
  min-width: 0;
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  padding: clamp(16px, 2vw, 24px);
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 12%, var(--border));
  background: color-mix(in srgb, var(--rom-accent-soft, #fff1f2) 35%, var(--surface));
  box-shadow: 0 24px 56px -40px color-mix(in srgb, var(--rom-accent, #e11d48) 28%, transparent);
  min-height: min(72vh, 760px);
}
.rom-build-shell__footer {
  position: sticky;
  bottom: 0;
  z-index: 5;
  width: 100%;
  margin-top: 20px;
  padding-top: 8px;
}
</style>
