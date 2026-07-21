<template>
  <div class="bouquet-preview" :class="`bouquet-preview--wrap-${wrapColor}`">
    <p class="bouquet-preview__label">Prévia ao vivo</p>

    <div class="bouquet-preview__stage">
      <div v-if="!stems.length" class="bouquet-preview__empty">
        Seu buquê vai florescer aqui conforme você escolhe as flores.
      </div>

      <BouquetDisplay v-else :stems="stems" :wrap-color="wrapColor" size="lg" />

      <BouquetLetterPreview
        v-if="showLetter"
        :recipient-name="recipientName"
        :sender-name="senderName"
        :letter-body="letterBody"
        :letter-design="letterDesign"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BouquetLetterDesign, BouquetWrapColor } from '@/api/types'
import BouquetDisplay from './BouquetDisplay.vue'
import BouquetLetterPreview from './BouquetLetterPreview.vue'

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
  justify-content: flex-start;
  gap: 0;
  padding-top: 8px;
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

</style>
