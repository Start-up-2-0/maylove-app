<template>
  <section class="rom-moments">
    <header class="rom-moments__head">
      <button
        type="button"
        class="rom-moments__toggle"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        <span class="rom-moments__toggle-icon" aria-hidden="true">〰️</span>
        <span class="rom-moments__toggle-text">
          <strong>Momentos da História</strong>
          <span class="rom-moments__badge">Opcional</span>
        </span>
        <span class="rom-moments__toggle-meta">Datas especiais do relacionamento de vocês</span>
        <span class="rom-moments__chevron" :class="{ 'rom-moments__chevron--open': expanded }" aria-hidden="true">
          ⌃
        </span>
      </button>
    </header>

    <div v-show="expanded" class="rom-moments__body">
      <article
        v-for="(moment, index) in form.timeline"
        :key="index"
        class="rom-moments__card"
      >
        <div class="rom-moments__card-top">
          <span class="rom-moments__drag" aria-hidden="true">⠿</span>
          <button
            type="button"
            class="rom-moments__emoji"
            :title="'Ícone do marco'"
            @click="cycleEmoji(index)"
          >
            {{ emojiFor(moment) }}
          </button>
          <button
            type="button"
            class="rom-moments__remove"
            title="Remover marco"
            @click="remove(index)"
          >
            🗑
          </button>
        </div>

        <label class="rom-field">
          <span class="rom-field__label">Título</span>
          <input
            v-model="moment.title"
            type="text"
            class="rom-field__input"
            maxlength="120"
            placeholder="Nome do evento"
          />
        </label>

        <label class="rom-field">
          <span class="rom-field__label">Data</span>
          <input
            v-model="moment.date"
            type="date"
            class="rom-field__input"
          />
          <span class="rom-field__hint">Ex.: 25/04/2024</span>
        </label>

        <label class="rom-field">
          <span class="rom-field__label">Descrição</span>
          <textarea
            v-model="moment.description"
            class="rom-field__input rom-field__textarea"
            rows="3"
            maxlength="2000"
            placeholder="Descreva este momento..."
          />
        </label>
      </article>

      <button type="button" class="rom-moments__add" @click="add">
        <span aria-hidden="true">+</span>
        Adicionar Marco
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { STORY_EMOTION_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()

const expanded = ref(true)

const EMOJI_OPTIONS: string[] = STORY_EMOTION_OPTIONS.map((item) => item.icon)

function emojiFor(moment: { emotion?: string }) {
  const raw = moment.emotion?.trim()
  if (raw && EMOJI_OPTIONS.includes(raw)) return raw
  if (raw && raw.length <= 4) return raw
  const match = STORY_EMOTION_OPTIONS.find((item) => item.id === raw)
  return match?.icon ?? '🎉'
}

function add() {
  props.form.timeline.push({
    title: '',
    date: '',
    description: '',
    emotion: '🎉',
  })
}

function remove(index: number) {
  props.form.timeline.splice(index, 1)
}

function cycleEmoji(index: number) {
  const moment = props.form.timeline[index]
  if (!moment) return
  const current = emojiFor(moment)
  const currentIndex = EMOJI_OPTIONS.indexOf(current)
  const next = EMOJI_OPTIONS[(currentIndex + 1 + EMOJI_OPTIONS.length) % EMOJI_OPTIONS.length]
  moment.emotion = next
}
</script>

<style scoped>
.rom-moments {
  margin-top: 22px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 16%, var(--border));
  background: color-mix(in srgb, var(--rom-accent-soft, #fff1f2) 35%, var(--surface));
  overflow: hidden;
}
.rom-moments__head {
  padding: 0;
}
.rom-moments__toggle {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 2px 12px;
  align-items: center;
  width: 100%;
  padding: 16px 18px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.rom-moments__toggle-icon {
  grid-row: 1 / span 2;
  font-size: 1.1rem;
}
.rom-moments__toggle-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--ink);
}
.rom-moments__badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface-3);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.rom-moments__toggle-meta {
  grid-column: 2;
  font-size: 0.82rem;
  color: var(--muted);
}
.rom-moments__chevron {
  grid-row: 1 / span 2;
  font-size: 1rem;
  color: var(--muted);
  transition: transform 0.2s ease;
}
.rom-moments__chevron--open {
  transform: rotate(180deg);
}
.rom-moments__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 16px 16px;
}
.rom-moments__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 6%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 12%, var(--border));
}
.rom-moments__card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rom-moments__drag {
  color: var(--muted);
  font-size: 0.9rem;
  cursor: grab;
}
.rom-moments__emoji {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 1.35rem;
  cursor: pointer;
}
.rom-moments__remove {
  margin-left: auto;
  border: none;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.65;
}
.rom-moments__remove:hover {
  opacity: 1;
}
.rom-moments__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 2px dashed color-mix(in srgb, var(--rom-accent, #e11d48) 35%, var(--border));
  background: transparent;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--rom-accent, #e11d48);
  cursor: pointer;
}
.rom-moments__add span {
  font-size: 1.1rem;
  line-height: 1;
}
</style>
