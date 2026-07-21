<template>
  <div class="bouquet-letter" :class="`bouquet-letter--${letterDesign}`">
    <div v-if="open" class="bouquet-letter__open">
      <div class="bouquet-letter__stack">
        <button type="button" class="bouquet-letter__card" @click="open = false">
          <svg
            class="bouquet-letter__icon bouquet-letter__icon--heart-outline"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 21s-7-4.6-9.5-8.8C.8 9.2 2.6 5.8 6.2 5.2c2-.3 3.8.8 4.7 2.1.9-1.3 2.7-2.4 4.7-2.1 3.6.6 5.4 4 3.7 7-2.5 4.2-9.5 8.8-9.5 8.8z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
            />
          </svg>

          <svg
            class="bouquet-letter__icon bouquet-letter__icon--expand"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M8 3H3v5M16 3h5v5M16 21h5v-5M8 21H3v-5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>

          <svg class="bouquet-letter__icon bouquet-letter__icon--heart-center" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 21s-7-4.6-9.5-8.8C.8 9.2 2.6 5.8 6.2 5.2c2-.3 3.8.8 4.7 2.1.9-1.3 2.7-2.4 4.7-2.1 3.6.6 5.4 4 3.7 7-2.5 4.2-9.5 8.8-9.5 8.8z"
              fill="currentColor"
            />
          </svg>

          <div class="bouquet-letter__field">
            <span
              class="bouquet-letter__to"
              :class="{ 'bouquet-letter__to--empty': !recipientName }"
            >
              <template v-if="recipientName">Para {{ recipientName }}</template>
              <template v-else>Para...</template>
            </span>
            <span class="bouquet-letter__line" aria-hidden="true" />
          </div>

          <div class="bouquet-letter__field bouquet-letter__field--body">
            <p class="bouquet-letter__body" :class="{ 'bouquet-letter__body--empty': !letterBody }">
              {{ letterBody || 'Sua carta...' }}
            </p>
            <span class="bouquet-letter__line" aria-hidden="true" />
          </div>

          <div class="bouquet-letter__field bouquet-letter__field--from">
            <span
              class="bouquet-letter__from"
              :class="{ 'bouquet-letter__from--empty': !senderName }"
            >
              <template v-if="senderName">De {{ senderName }}</template>
              <template v-else>De...</template>
            </span>
          </div>
        </button>

        <div class="bouquet-letter__envelope-open" aria-hidden="true">
          <span class="bouquet-letter__envelope-flap-open" />
          <span class="bouquet-letter__envelope-pocket" />
        </div>
      </div>

      <span class="bouquet-letter__hint">Toque para fechar</span>
    </div>

    <button v-else type="button" class="bouquet-letter__envelope-closed" @click="open = true">
      <span class="bouquet-letter__envelope-face" aria-hidden="true">
        <span class="bouquet-letter__seal">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 21s-7-4.6-9.5-8.8C.8 9.2 2.6 5.8 6.2 5.2c2-.3 3.8.8 4.7 2.1.9-1.3 2.7-2.4 4.7-2.1 3.6.6 5.4 4 3.7 7-2.5 4.2-9.5 8.8-9.5 8.8z"
              fill="currentColor"
            />
          </svg>
        </span>
      </span>
      <span class="bouquet-letter__hint">Toque para abrir</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BouquetLetterDesign } from '@/api/types'

const props = withDefaults(
  defineProps<{
    recipientName?: string
    senderName?: string
    letterBody?: string
    letterDesign?: BouquetLetterDesign
  }>(),
  {
    recipientName: '',
    senderName: '',
    letterBody: '',
    letterDesign: 'classic',
  },
)

const open = ref(false)

watch(
  () => [props.recipientName, props.senderName, props.letterBody, props.letterDesign],
  () => {
    open.value = false
  },
)
</script>

<style scoped>
.bouquet-letter {
  --letter-card: #ffffff;
  --letter-ink: #3d2b2f;
  --letter-accent: #c4456a;
  --letter-muted: #b0a59c;
  --letter-line: rgba(196, 69, 106, 0.28);
  --envelope: #f0e4d4;
  --envelope-stripe: rgba(255, 255, 255, 0.42);
  --envelope-line: rgba(130, 105, 82, 0.16);
  --seal: #7a2035;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: -12px;
}

.bouquet-letter--romantic {
  --letter-card: #fffafb;
  --letter-ink: #5c1428;
  --letter-accent: #8f2740;
  --envelope: #ead8c8;
  --seal: #6b1f2b;
}

.bouquet-letter__hint {
  display: block;
  margin-top: 12px;
  font-size: 11px;
  color: var(--letter-muted);
  letter-spacing: 0.02em;
  text-align: center;
}

/* —— Envelope fechado —— */
.bouquet-letter__envelope-closed {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bouquet-letter__envelope-face {
  position: relative;
  width: 228px;
  height: 132px;
  border-radius: 12px;
  background:
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 6px,
      var(--envelope-stripe) 6px,
      var(--envelope-stripe) 7px
    ),
    var(--envelope);
  box-shadow:
    0 16px 36px rgba(74, 47, 53, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.bouquet-letter__envelope-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      135deg,
      transparent calc(50% - 0.5px),
      var(--envelope-line) calc(50% - 0.5px),
      var(--envelope-line) calc(50% + 0.5px),
      transparent calc(50% + 0.5px)
    ),
    linear-gradient(
      45deg,
      transparent calc(50% - 0.5px),
      var(--envelope-line) calc(50% - 0.5px),
      var(--envelope-line) calc(50% + 0.5px),
      transparent calc(50% + 0.5px)
    );
  pointer-events: none;
}

.bouquet-letter__seal {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--seal);
  color: white;
  box-shadow:
    0 0 0 7px rgba(196, 69, 106, 0.1),
    0 0 28px rgba(196, 69, 106, 0.22);
}

.bouquet-letter__seal svg {
  width: 15px;
  height: 15px;
}

/* —— Carta aberta —— */
.bouquet-letter__open {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(292px, 100%);
}

.bouquet-letter__stack {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bouquet-letter__card {
  position: relative;
  z-index: 2;
  width: calc(100% - 8px);
  max-width: 268px;
  border: none;
  border-radius: 16px;
  padding: 26px 22px 22px;
  text-align: center;
  cursor: pointer;
  background: var(--letter-card);
  color: var(--letter-ink);
  box-shadow:
    0 18px 44px rgba(74, 47, 53, 0.12),
    0 2px 0 rgba(255, 255, 255, 0.8) inset;
}

.bouquet-letter__icon {
  color: var(--letter-accent);
}

.bouquet-letter__icon--heart-outline {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 15px;
  height: 15px;
}

.bouquet-letter__icon--expand {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 14px;
  height: 14px;
  opacity: 0.55;
}

.bouquet-letter__icon--heart-center {
  width: 13px;
  height: 13px;
  margin: 0 auto 18px;
  display: block;
}

.bouquet-letter__field {
  margin-bottom: 12px;
}

.bouquet-letter__field--body {
  margin-bottom: 10px;
}

.bouquet-letter__field--from {
  margin-bottom: 0;
}

.bouquet-letter__to,
.bouquet-letter__from {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 17px;
  line-height: 1.3;
  color: var(--letter-ink);
}

.bouquet-letter__from {
  font-weight: 700;
}

.bouquet-letter__to--empty,
.bouquet-letter__from--empty {
  color: var(--letter-muted);
  font-weight: 400;
}

.bouquet-letter__line {
  display: block;
  height: 1px;
  margin-top: 10px;
  background: var(--letter-line);
}

.bouquet-letter__body {
  margin: 0;
  line-height: 1.55;
  white-space: pre-wrap;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 15px;
  color: var(--letter-ink);
}

.bouquet-letter__body--empty {
  font-style: italic;
  color: var(--letter-muted);
}

.bouquet-letter__envelope-open {
  position: relative;
  width: 100%;
  max-width: 288px;
  height: 88px;
  margin-top: -36px;
  z-index: 1;
}

.bouquet-letter__envelope-flap-open {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 72px solid transparent;
  border-right: 72px solid transparent;
  border-top: 52px solid color-mix(in srgb, var(--envelope) 92%, #dcc9ad);
  filter: drop-shadow(0 2px 4px rgba(74, 47, 53, 0.06));
}

.bouquet-letter__envelope-pocket {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  border-radius: 0 0 14px 14px;
  background:
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 6px,
      var(--envelope-stripe) 6px,
      var(--envelope-stripe) 7px
    ),
    var(--envelope);
  box-shadow:
    0 12px 28px rgba(74, 47, 53, 0.08),
    inset 0 2px 0 rgba(255, 255, 255, 0.55);
  clip-path: polygon(0 0, 100% 0, 94% 100%, 6% 100%);
}
</style>
