<template>
  <div class="bouquet-letter" :class="`bouquet-letter--${letterDesign}`">
    <div v-if="open" class="bouquet-letter__open">
      <button type="button" class="bouquet-letter__card" @click="open = false">
        <span class="bouquet-letter__card-heart bouquet-letter__card-heart--left" aria-hidden="true">♡</span>
        <span class="bouquet-letter__card-heart bouquet-letter__card-heart--center" aria-hidden="true">♥</span>

        <div class="bouquet-letter__row">
          <span
            class="bouquet-letter__row-value"
            :class="{ 'bouquet-letter__row-value--empty': !recipientName }"
          >
            {{ recipientName || 'Para...' }}
          </span>
          <span class="bouquet-letter__row-line" aria-hidden="true" />
        </div>

        <div class="bouquet-letter__body-wrap">
          <p
            class="bouquet-letter__body"
            :class="{ 'bouquet-letter__body--empty': !letterBody }"
          >
            {{ letterBody || 'Sua carta...' }}
          </p>
          <span class="bouquet-letter__row-line" aria-hidden="true" />
        </div>

        <div class="bouquet-letter__row bouquet-letter__row--from">
          <span
            class="bouquet-letter__row-value"
            :class="{ 'bouquet-letter__row-value--empty': !senderName }"
          >
            {{ senderName || 'De...' }}
          </span>
        </div>

        <span class="bouquet-letter__hint">Toque para fechar</span>
      </button>

      <div class="bouquet-letter__envelope-open" aria-hidden="true">
        <span class="bouquet-letter__envelope-pocket" />
      </div>
    </div>

    <button
      v-else
      type="button"
      class="bouquet-letter__envelope-closed"
      @click="open = true"
    >
      <span class="bouquet-letter__envelope-face" aria-hidden="true">
        <span class="bouquet-letter__envelope-flap bouquet-letter__envelope-flap--tl" />
        <span class="bouquet-letter__envelope-flap bouquet-letter__envelope-flap--tr" />
        <span class="bouquet-letter__envelope-flap bouquet-letter__envelope-flap--bl" />
        <span class="bouquet-letter__envelope-flap bouquet-letter__envelope-flap--br" />
        <span class="bouquet-letter__seal">♥</span>
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
  --letter-card: #fffdf9;
  --letter-ink: #4a2f35;
  --letter-accent: #c4456a;
  --letter-muted: #a89f94;
  --envelope: #f3e8d8;
  --envelope-line: rgba(120, 96, 72, 0.18);
  --seal: #8f2740;
  width: 100%;
  display: flex;
  justify-content: center;
}

.bouquet-letter--romantic {
  --letter-card: linear-gradient(180deg, #fff7f8, #fdecef);
  --letter-ink: #5c1428;
  --letter-accent: #8f2740;
  --envelope: #ead8c8;
  --seal: #6b1f2b;
}

.bouquet-letter__hint {
  display: block;
  margin-top: 10px;
  font-size: 11px;
  color: var(--letter-muted);
  letter-spacing: 0.02em;
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
  width: 200px;
  height: 128px;
  border-radius: 10px;
  background:
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 5px,
      rgba(255, 255, 255, 0.35) 5px,
      rgba(255, 255, 255, 0.35) 6px
    ),
    var(--envelope);
  box-shadow:
    0 14px 32px rgba(74, 47, 53, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  overflow: hidden;
}

.bouquet-letter__envelope-flap {
  position: absolute;
  width: 50%;
  height: 50%;
  border: 1px solid var(--envelope-line);
}

.bouquet-letter__envelope-flap--tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-radius: 10px 0 0 0;
}

.bouquet-letter__envelope-flap--tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-radius: 0 10px 0 0;
}

.bouquet-letter__envelope-flap--bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 10px;
}

.bouquet-letter__envelope-flap--br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-radius: 0 0 10px 0;
}

.bouquet-letter__seal {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--seal);
  color: white;
  font-size: 14px;
  box-shadow:
    0 0 0 6px rgba(196, 69, 106, 0.12),
    0 0 24px rgba(196, 69, 106, 0.28);
}

/* —— Carta aberta —— */
.bouquet-letter__open {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(280px, 100%);
}

.bouquet-letter__card {
  position: relative;
  z-index: 2;
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 22px 20px 16px;
  text-align: center;
  cursor: pointer;
  background: var(--letter-card);
  color: var(--letter-ink);
  box-shadow: 0 16px 40px rgba(74, 47, 53, 0.14);
}

.bouquet-letter__card-heart {
  color: var(--letter-accent);
  line-height: 1;
}

.bouquet-letter__card-heart--left {
  position: absolute;
  top: 14px;
  left: 16px;
  font-size: 14px;
  opacity: 0.85;
}

.bouquet-letter__card-heart--center {
  display: block;
  font-size: 13px;
  margin-bottom: 14px;
}

.bouquet-letter__row {
  position: relative;
  margin-bottom: 16px;
}

.bouquet-letter__row--from {
  margin-bottom: 0;
  margin-top: 4px;
}

.bouquet-letter__row-value {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  color: var(--letter-ink);
}

.bouquet-letter__row-value--empty {
  color: var(--letter-muted);
  opacity: 0.7;
}

.bouquet-letter__row-line {
  display: block;
  height: 1px;
  margin-top: 8px;
  background: linear-gradient(90deg, transparent, rgba(196, 69, 106, 0.35), transparent);
}

.bouquet-letter__body-wrap {
  margin-bottom: 14px;
}

.bouquet-letter__body {
  margin: 0;
  min-height: 72px;
  line-height: 1.55;
  white-space: pre-wrap;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 15px;
  color: var(--letter-ink);
}

.bouquet-letter__body--empty {
  font-style: italic;
  color: var(--letter-muted);
  opacity: 0.75;
}

.bouquet-letter__envelope-open {
  position: relative;
  width: 210px;
  height: 72px;
  margin-top: -18px;
  z-index: 1;
}

.bouquet-letter__envelope-pocket {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 0 0 12px 12px;
  background:
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 5px,
      rgba(255, 255, 255, 0.28) 5px,
      rgba(255, 255, 255, 0.28) 6px
    ),
    var(--envelope);
  box-shadow:
    0 10px 24px rgba(74, 47, 53, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.5);
  clip-path: polygon(0 0, 100% 0, 92% 100%, 8% 100%);
}
</style>
