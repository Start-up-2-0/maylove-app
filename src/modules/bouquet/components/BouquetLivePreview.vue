<template>
  <div class="bouquet-preview" :class="`bouquet-preview--wrap-${wrapColor}`">
    <p class="bouquet-preview__label">Prévia ao vivo</p>

    <div class="bouquet-preview__stage">
      <div v-if="!stems.length" class="bouquet-preview__empty">
        Seu buquê vai florescer aqui conforme você escolhe as flores.
      </div>

      <BouquetDisplay v-else :stems="stems" :wrap-color="wrapColor" size="lg" />

      <button
        v-if="showLetter && letterOpen"
        type="button"
        class="bouquet-preview__letter bouquet-preview__letter--open"
        :class="`bouquet-preview__letter--${letterDesign}`"
        @click="letterOpen = false"
      >
        <p class="bouquet-preview__letter-kicker">~ uma carta para você ~</p>
        <h3>Dear {{ recipientName || '...' }},</h3>
        <p class="bouquet-preview__letter-body">{{ letterBody || '...' }}</p>
        <p class="bouquet-preview__letter-sign">Forever yours,</p>
        <p class="bouquet-preview__letter-from">{{ senderName || '...' }}</p>
        <span class="bouquet-preview__letter-hint">Toque para fechar</span>
      </button>

      <button
        v-else-if="showLetter"
        type="button"
        class="bouquet-preview__envelope"
        :class="`bouquet-preview__envelope--${letterDesign}`"
        @click="letterOpen = true"
      >
        <span class="bouquet-preview__seal">♥</span>
        <span class="bouquet-preview__letter-hint">Toque para abrir</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BouquetLetterDesign, BouquetWrapColor } from '@/api/types'
import BouquetDisplay from './BouquetDisplay.vue'

const props = withDefaults(
  defineProps<{
    stems: string[]
    wrapColor: BouquetWrapColor
    recipientName?: string
    senderName?: string
    letterBody?: string
    letterDesign?: BouquetLetterDesign
    showLetter?: boolean
  }>(),
  {
    recipientName: '',
    senderName: '',
    letterBody: '',
    letterDesign: 'classic',
    showLetter: false,
  },
)

const letterOpen = ref(false)

watch(
  () => [props.recipientName, props.senderName, props.letterBody, props.letterDesign],
  () => {
    letterOpen.value = false
  },
)

const wrapColor = computed(() => props.wrapColor)
const letterDesign = computed(() => props.letterDesign)
const recipientName = computed(() => props.recipientName)
const senderName = computed(() => props.senderName)
const letterBody = computed(() => props.letterBody)
const showLetter = computed(() => props.showLetter)
const stems = computed(() => props.stems)
</script>

<style scoped>
.bouquet-preview {
  --wrap: #f2c4c4;
  background: linear-gradient(180deg, #faf6f0 0%, #f3ebe1 100%);
  border-radius: 24px;
  padding: 20px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
}

.bouquet-preview--wrap-cream {
  --wrap: #f5efe3;
}
.bouquet-preview--wrap-burgundy {
  --wrap: #6b1f2b;
}

.bouquet-preview__label {
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9a8d84;
  margin: 0 0 16px;
}

.bouquet-preview__stage {
  position: relative;
  flex: 1;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.bouquet-preview__empty {
  max-width: 220px;
  text-align: center;
  color: #b0a59c;
  line-height: 1.5;
  min-height: 280px;
  display: flex;
  align-items: center;
}

.bouquet-preview__envelope {
  position: relative;
  width: 180px;
  height: 110px;
  border: none;
  border-radius: 8px;
  background: var(--wrap);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  z-index: 4;
}

.bouquet-preview__envelope--romantic {
  background: linear-gradient(180deg, #8f2740, #5c1428);
}

.bouquet-preview__seal {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #c4456a;
  color: white;
  font-size: 14px;
}

.bouquet-preview__letter {
  width: min(260px, 90%);
  border: none;
  border-radius: 12px;
  padding: 18px 20px;
  text-align: center;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

.bouquet-preview__letter--classic {
  background: #fffaf3;
  color: #4a2f35;
}

.bouquet-preview__letter--romantic {
  background: linear-gradient(180deg, #fff7f8, #fdecef);
  color: #5c1428;
}

.bouquet-preview__letter-kicker {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  margin: 0 0 8px;
  opacity: 0.7;
}

.bouquet-preview__letter h3 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  margin: 0 0 10px;
  color: #c4456a;
}

.bouquet-preview__letter-body {
  margin: 0 0 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.bouquet-preview__letter-sign,
.bouquet-preview__letter-from {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
}

.bouquet-preview__letter-from {
  color: #c4456a;
  font-size: 18px;
}

.bouquet-preview__letter-hint {
  display: block;
  margin-top: 10px;
  font-size: 11px;
  color: #9a8d84;
}
</style>
