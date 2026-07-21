<template>
  <div class="bouquet-preview" :class="`bouquet-preview--wrap-${wrapColor}`">
    <p class="bouquet-preview__label">Prévia ao vivo</p>

    <div class="bouquet-preview__stage">
      <div v-if="!stems.length" class="bouquet-preview__empty">
        Seu buquê vai florescer aqui conforme você escolhe as flores.
      </div>

      <template v-else>
        <div class="bouquet-preview__greenery" aria-hidden="true" />
        <div
          v-for="(stem, index) in positionedStems"
          :key="`${stem.id}-${index}`"
          class="bouquet-preview__flower"
          :style="{
            left: `${stem.left}%`,
            top: `${stem.top}%`,
            transform: `rotate(${stem.rotate}deg) scale(${stem.scale})`,
          }"
        >
          <span class="bouquet-preview__emoji">{{ stem.emoji }}</span>
        </div>
        <div class="bouquet-preview__stems-tie" aria-hidden="true" />
      </template>

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
import { BOUQUET_FLOWERS, getFlower } from '@/modules/bouquet/bouquetCatalog'

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

const positionedStems = computed(() =>
  props.stems.map((id, index) => {
    const flower = getFlower(id)
    const base = flower?.preview ?? { left: 45, top: 24, rotate: 0, scale: 1 }
    const offset = (index % 3) * 4 - 4
    return {
      id,
      emoji: flower?.emoji ?? '🌸',
      left: Math.min(68, Math.max(28, base.left + offset)),
      top: base.top + Math.floor(index / 3) * 3,
      rotate: base.rotate + offset,
      scale: base.scale,
    }
  }),
)

// re-export for template type hints
const wrapColor = computed(() => props.wrapColor)
const letterDesign = computed(() => props.letterDesign)
const recipientName = computed(() => props.recipientName)
const senderName = computed(() => props.senderName)
const letterBody = computed(() => props.letterBody)
const showLetter = computed(() => props.showLetter)
const stems = computed(() => props.stems)

void BOUQUET_FLOWERS
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
  align-items: center;
  justify-content: center;
}

.bouquet-preview__empty {
  max-width: 220px;
  text-align: center;
  color: #b0a59c;
  line-height: 1.5;
}

.bouquet-preview__greenery {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 60%, rgba(120, 150, 90, 0.25), transparent 70%),
    radial-gradient(circle at 35% 45%, rgba(90, 130, 70, 0.35), transparent 55%),
    radial-gradient(circle at 65% 48%, rgba(100, 140, 80, 0.3), transparent 50%);
  filter: blur(1px);
}

.bouquet-preview__flower {
  position: absolute;
  z-index: 2;
  font-size: 52px;
  line-height: 1;
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.12));
}

.bouquet-preview__emoji {
  display: block;
}

.bouquet-preview__stems-tie {
  position: absolute;
  bottom: 18%;
  width: 36px;
  height: 56px;
  border-radius: 999px;
  background: linear-gradient(180deg, #6f8f55, #4f6b3d);
  box-shadow: inset 0 -8px 0 rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.bouquet-preview__envelope {
  position: absolute;
  bottom: 8%;
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
  position: absolute;
  bottom: 6%;
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
