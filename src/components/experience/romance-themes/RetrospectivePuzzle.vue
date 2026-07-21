<template>
  <div class="retro-puzzle">
    <header class="retro-puzzle__head">
      <h3 class="retro-puzzle__title">🧩 Quebra-cabeça</h3>
      <p class="retro-puzzle__hint">Toque em duas peças para trocá-las de lugar</p>
    </header>

    <div class="retro-puzzle__grid" role="grid" aria-label="Quebra-cabeça 3 por 3">
      <button
        v-for="(piece, index) in order"
        :key="index"
        type="button"
        class="retro-puzzle__tile"
        :class="{ 'retro-puzzle__tile--selected': selected === index, 'retro-puzzle__tile--solved': solved }"
        :style="tileStyle(piece)"
        :aria-label="`Peça ${index + 1}`"
        @click="tap(index)"
      />
    </div>

    <div v-if="solved" class="retro-puzzle__success">
      <span class="retro-puzzle__success-icon" aria-hidden="true">🧩</span>
      <strong>Perfeito!</strong>
      <p>Você montou esse momento especial</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  imageUrl: string
}>()

const emit = defineEmits<{ solved: [] }>()

const order = ref(shuffle(Array.from({ length: 9 }, (_, index) => index)))
const selected = ref<number | null>(null)

const solved = computed(() => order.value.every((piece, index) => piece === index))

watch(solved, (value) => {
  if (value) emit('solved')
})

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  if (copy.every((piece, index) => piece === index)) {
    ;[copy[0], copy[1]] = [copy[1], copy[0]]
  }
  return copy
}

function tap(index: number) {
  if (solved.value) return
  if (selected.value === null) {
    selected.value = index
    return
  }
  if (selected.value === index) {
    selected.value = null
    return
  }
  const next = [...order.value]
  ;[next[selected.value], next[index]] = [next[index], next[selected.value]]
  order.value = next
  selected.value = null
}

function tileStyle(piece: number) {
  const col = piece % 3
  const row = Math.floor(piece / 3)
  return {
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: '300% 300%',
    backgroundPosition: `${col * 50}% ${row * 50}%`,
  }
}
</script>

<style scoped>
.retro-puzzle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}
.retro-puzzle__head {
  text-align: center;
}
.retro-puzzle__title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--retro-text, #f8fafc);
}
.retro-puzzle__hint {
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: var(--retro-text-muted, rgb(248 250 252 / 65%));
}
.retro-puzzle__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  width: min(100%, 240px);
  aspect-ratio: 1;
  padding: 4px;
  border-radius: 14px;
  border: 2px solid var(--retro-accent, #fbbf24);
  background: rgb(0 0 0 / 25%);
}
.retro-puzzle__tile {
  border: none;
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  background-color: rgb(255 255 255 / 8%);
  transition:
    outline 0.15s ease,
    transform 0.15s ease;
}
.retro-puzzle__tile--selected {
  outline: 2px solid var(--retro-accent, #fbbf24);
  transform: scale(0.96);
}
.retro-puzzle__tile--solved {
  cursor: default;
}
.retro-puzzle__success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  color: var(--retro-text, #f8fafc);
}
.retro-puzzle__success-icon {
  font-size: 1.4rem;
}
.retro-puzzle__success strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.05rem;
}
.retro-puzzle__success p {
  margin: 0;
  font-size: 0.78rem;
  color: var(--retro-text-muted, rgb(248 250 252 / 65%));
}
</style>
