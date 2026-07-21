<template>
  <div class="retro-memory">
    <header class="retro-memory__head">
      <h3 class="retro-memory__title">🎴 Jogo da memória</h3>
      <p class="retro-memory__hint">Encontre todos os pares de fotos</p>
    </header>

    <div class="retro-memory__grid" role="grid" aria-label="Jogo da memória">
      <button
        v-for="(card, index) in cards"
        :key="card.uid"
        type="button"
        class="retro-memory__card"
        :class="{
          'retro-memory__card--flipped': card.flipped || card.matched,
          'retro-memory__card--matched': card.matched,
        }"
        :disabled="card.matched || busy"
        @click="flip(index)"
      >
        <span class="retro-memory__back" aria-hidden="true">♥♥</span>
        <img v-if="card.flipped || card.matched" :src="card.url" alt="" loading="lazy" />
      </button>
    </div>

    <div v-if="complete" class="retro-memory__success">
      <strong>Todos os pares!</strong>
      <p>Vocês têm memória afiada juntos</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface MemoryCard {
  uid: string
  pairId: string
  url: string
  flipped: boolean
  matched: boolean
}

const props = defineProps<{
  photos: { id: string; url: string }[]
}>()

const emit = defineEmits<{ complete: [] }>()

function buildCards(): MemoryCard[] {
  const pairs = props.photos.slice(0, 4)
  const deck = pairs.flatMap((photo) => [
    { uid: `${photo.id}-a`, pairId: photo.id, url: photo.url, flipped: false, matched: false },
    { uid: `${photo.id}-b`, pairId: photo.id, url: photo.url, flipped: false, matched: false },
  ])
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

const cards = ref<MemoryCard[]>(buildCards())
const openIndexes = ref<number[]>([])
const busy = ref(false)

const complete = computed(() => cards.value.length > 0 && cards.value.every((card) => card.matched))

function flip(index: number) {
  const card = cards.value[index]
  if (!card || card.flipped || card.matched || busy.value) return

  card.flipped = true
  const open = [...openIndexes.value, index]

  if (open.length < 2) {
    openIndexes.value = open
    return
  }

  busy.value = true
  openIndexes.value = []
  const [first, second] = open
  const a = cards.value[first]
  const b = cards.value[second]

  if (a.pairId === b.pairId) {
    a.matched = true
    b.matched = true
    busy.value = false
    if (complete.value) emit('complete')
    return
  }

  window.setTimeout(() => {
    a.flipped = false
    b.flipped = false
    busy.value = false
  }, 700)
}
</script>

<style scoped>
.retro-memory {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}
.retro-memory__head {
  text-align: center;
}
.retro-memory__title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--retro-text, #f8fafc);
}
.retro-memory__hint {
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: var(--retro-text-muted, rgb(248 250 252 / 65%));
}
.retro-memory__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  width: min(100%, 280px);
}
.retro-memory__card {
  position: relative;
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: var(--retro-card-bg, rgb(15 10 30 / 72%));
  border: 1px solid var(--retro-card-border, rgb(255 255 255 / 10%));
  transition: transform 0.2s ease;
}
.retro-memory__card:disabled {
  cursor: default;
}
.retro-memory__card--matched {
  opacity: 0.85;
  box-shadow: 0 0 0 2px var(--retro-accent, #fbbf24);
}
.retro-memory__back {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 0.85rem;
  color: #ef4444;
  letter-spacing: -0.12em;
}
.retro-memory__card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.retro-memory__card:not(.retro-memory__card--flipped) img {
  display: none;
}
.retro-memory__success {
  text-align: center;
  color: var(--retro-text, #f8fafc);
}
.retro-memory__success strong {
  display: block;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.05rem;
}
.retro-memory__success p {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--retro-text-muted, rgb(248 250 252 / 65%));
}
</style>
