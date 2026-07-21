<template>
  <div
    class="bouquet-preview"
    :class="[
      `bouquet-preview--wrap-${wrapColor}`,
      { 'bouquet-preview--embedded': embedded },
    ]"
  >
    <p v-if="!embedded" class="bouquet-preview__label">Prévia ao vivo</p>

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
    embedded?: boolean
  }>(),
  {
    recipientName: '',
    senderName: '',
    letterBody: '',
    letterDesign: 'classic',
    showLetter: false,
    embedded: false,
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
  --preview-bg-top: #faf6f0;
  --preview-bg-bottom: #f3ebe1;
  background: linear-gradient(180deg, var(--preview-bg-top) 0%, var(--preview-bg-bottom) 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 20px);
  padding: 20px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.bouquet-preview--embedded {
  min-height: 480px;
}

.bouquet-preview--wrap-cream {
  --wrap: #f5efe3;
}
.bouquet-preview--wrap-burgundy {
  --wrap: #6b1f2b;
}

.bouquet-preview__label {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
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
  color: var(--muted);
  line-height: 1.5;
  min-height: 280px;
  display: flex;
  align-items: center;
}

</style>
