<template>
  <div class="retro-quiz">
    <header class="retro-quiz__head">
      <h3 class="retro-quiz__title">📸 Quiz de fotos</h3>
      <p class="retro-quiz__hint">Qual foto guarda este momento?</p>
    </header>

    <div class="retro-quiz__prompt">
      <img :src="target.url" alt="" loading="lazy" />
      <p v-if="targetCaption">{{ targetCaption }}</p>
    </div>

    <div class="retro-quiz__options">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="retro-quiz__option"
        :class="{
          'retro-quiz__option--correct': answered && option.id === target.id,
          'retro-quiz__option--wrong': answered && picked === option.id && option.id !== target.id,
        }"
        :disabled="answered"
        @click="pick(option.id)"
      >
        <img :src="option.url" alt="" loading="lazy" />
      </button>
    </div>

    <p v-if="answered && picked === target.id" class="retro-quiz__feedback retro-quiz__feedback--ok">
      Acertou! Esse momento é inesquecível ♥
    </p>
    <p v-else-if="answered" class="retro-quiz__feedback">Quase! Tente de novo na próxima.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  photos: { id: string; url: string; caption?: string }[]
}>()

const emit = defineEmits<{ answered: [correct: boolean] }>()

const target = computed(() => props.photos[0])
const targetCaption = computed(() => target.value.caption?.trim() || 'Um momento especial...')

const options = computed(() => {
  const shuffled = [...props.photos.slice(0, 3)]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
})

const picked = ref<string | null>(null)
const answered = ref(false)

function pick(id: string) {
  if (answered.value) return
  picked.value = id
  answered.value = true
  emit('answered', id === target.value.id)
}
</script>

<style scoped>
.retro-quiz {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}
.retro-quiz__head {
  text-align: center;
}
.retro-quiz__title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--retro-text, #f8fafc);
}
.retro-quiz__hint {
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: var(--retro-text-muted, rgb(248 250 252 / 65%));
}
.retro-quiz__prompt {
  width: min(100%, 200px);
  text-align: center;
}
.retro-quiz__prompt img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 14px;
  border: 2px solid var(--retro-accent, #fbbf24);
}
.retro-quiz__prompt p {
  margin: 8px 0 0;
  font-size: 0.82rem;
  font-style: italic;
  color: var(--retro-text-muted, rgb(248 250 252 / 65%));
}
.retro-quiz__options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: min(100%, 260px);
}
.retro-quiz__option {
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: none;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.retro-quiz__option:hover:not(:disabled) {
  transform: scale(1.03);
}
.retro-quiz__option img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.retro-quiz__option--correct {
  border-color: #22c55e;
}
.retro-quiz__option--wrong {
  border-color: #ef4444;
}
.retro-quiz__feedback {
  margin: 0;
  font-size: 0.82rem;
  text-align: center;
  color: var(--retro-text-muted, rgb(248 250 252 / 65%));
}
.retro-quiz__feedback--ok {
  color: var(--retro-accent, #fbbf24);
  font-weight: 700;
}
</style>
