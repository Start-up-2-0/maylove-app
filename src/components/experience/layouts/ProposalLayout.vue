<template>
  <div class="prop" :class="{ 'prop--preview': mode === 'preview' }">
    <div v-if="accepted" class="prop__burst">
      <EffectsLayer :effects="celebrationEffects" :accent="theme.accentColor" />
    </div>

    <transition name="prop-fade" mode="out-in">
      <!-- Etapas da história -->
      <section v-if="!isQuestion" :key="index" class="prop__step">
        <div v-if="current.photo" class="prop__bg" :style="bgStyle(current.photo.url)" />
        <div class="prop__scrim" />
        <div class="prop__inner">
          <p v-if="current.eyebrow" class="prop__eyebrow">{{ current.eyebrow }}</p>
          <h1 v-if="current.title" class="prop__title">{{ current.title }}</h1>
          <p v-if="current.text" class="prop__text">{{ current.text }}</p>
          <button class="prop__next" @click="go(1)">
            {{ index === steps.length - 1 ? 'Chegou a hora...' : 'Continuar' }}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      <!-- Pergunta / resposta -->
      <section v-else key="question" class="prop__step prop__step--question">
        <div class="prop__scrim prop__scrim--q" />
        <div class="prop__inner">
          <template v-if="!accepted">
            <h1 class="prop__question">{{ question }}</h1>
            <div class="prop__answers">
              <button class="prop__yes" @click="accept">Sim! 💍</button>
              <button
                class="prop__no"
                :style="noStyle"
                @mouseenter="dodge"
                @click="dodge"
              >
                Não
              </button>
            </div>
          </template>
          <template v-else>
            <p class="prop__celebrate">{{ celebration }}</p>
            <RichText
              v-if="content.includeClosingMessage && content.closingMessage"
              :text="content.closingMessage"
              class="prop__closing"
            />
            <p class="prop__sign">{{ content.signature || content.senderName }}</p>
            <ShareBar v-if="mode === 'full' && shareUrl" :url="shareUrl" :text="content.title" />
          </template>
        </div>
      </section>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'
import type { ExperienceMediaItem, LayoutComponentProps } from '@/templates/types'
import type { TributeEffect } from '@/api/types'
import { useExperienceAudio } from '@/composables/experienceAudio'
import EffectsLayer from '../shared/EffectsLayer.vue'
import ShareBar from '../shared/ShareBar.vue'
import RichText from '../shared/RichText.vue'

interface Step {
  eyebrow?: string
  title?: string
  text?: string
  photo?: ExperienceMediaItem
}

const props = defineProps<LayoutComponentProps>()
const audio = useExperienceAudio()

const index = ref(0)
const accepted = ref(false)
const noStyle = ref<CSSProperties>({})

const steps = computed<Step[]>(() => {
  const list: Step[] = [
    {
      eyebrow: props.content.senderName || 'A nossa história',
      title: props.content.title,
      text: props.content.subtitle,
      photo: props.content.photos[0],
    },
  ]
  if (props.content.timeline.length) {
    props.content.timeline.forEach((item, i) => {
      list.push({
        eyebrow: item.date,
        title: item.title,
        text: item.description,
        photo: props.content.photos[i + 1] ?? props.content.photos[i],
      })
    })
  } else if (props.content.includeOpeningMessage) {
    props.content.messages.filter(Boolean).forEach((msg, i) => {
      list.push({ text: msg, photo: props.content.photos[i + 1] ?? props.content.photos[i] })
    })
  }
  return list
})

// A "pergunta" é o passo logo após o último passo da história.
const isQuestion = computed(() => index.value >= steps.value.length)
const current = computed(() => steps.value[Math.min(index.value, steps.value.length - 1)])

const question = computed(() => {
  if (props.content.question) return props.content.question
  return 'Você aceita casar comigo?'
})

const celebration = computed(() => props.content.celebration || 'Ela disse SIM! 🎉')

const celebrationEffects = computed<TributeEffect[]>(() => {
  const base = props.content.effects.length ? props.content.effects : []
  return Array.from(new Set<TributeEffect>([...base, 'hearts', 'confetti', 'fireworks']))
})

function bgStyle(url: string): CSSProperties {
  return { backgroundImage: `url("${url}")` }
}

function go(delta: number) {
  const next = index.value + delta
  if (next < 0 || next > steps.value.length) return
  index.value = next
}

function accept() {
  accepted.value = true
  if (audio?.hasAudio) audio.play()
}

function dodge() {
  if (accepted.value) return
  const x = (Math.random() - 0.5) * 220
  const y = (Math.random() - 0.5) * 160
  noStyle.value = {
    transform: `translate(${x}px, ${y}px) scale(${Math.max(0.6, 1 - Math.random() * 0.3)})`,
  }
}
</script>

<style scoped>
.prop {
  position: relative;
  height: var(--exp-stage, 100svh);
  overflow: hidden;
  background: #000;
}
.prop--preview {
  height: var(--exp-stage, 620px);
}
.prop__burst {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}
.prop__step {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  padding: clamp(30px, 8vw, 90px);
}
.prop__bg {
  position: absolute;
  inset: -4%;
  background-size: cover;
  background-position: center;
  z-index: 0;
  animation: prop-kb 12s ease-out forwards;
}
.prop__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.7) 100%);
}
.prop__scrim--q {
  background:
    radial-gradient(120% 120% at 50% 30%, color-mix(in srgb, var(--exp-primary) 55%, transparent), transparent 65%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.82));
}
.prop__inner {
  position: relative;
  z-index: 2;
  max-width: 760px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.prop__eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--exp-accent) 60%, #fff);
}
.prop__title {
  color: #fff;
  font-size: clamp(2rem, 7vw, 4.4rem);
  text-shadow: 0 6px 30px rgba(0, 0, 0, 0.45);
}
.prop__text {
  font-family: var(--exp-font-display);
  font-size: clamp(1.1rem, 3vw, 1.7rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.94);
  max-width: 56ch;
}
.prop__next {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border: none;
  border-radius: 999px;
  font-weight: 600;
  color: #fff;
  background: var(--exp-primary);
  cursor: pointer;
  box-shadow: 0 16px 34px -12px color-mix(in srgb, var(--exp-primary) 70%, transparent);
  transition: transform 0.2s var(--exp-ease);
}
.prop__next:hover {
  transform: translateY(-2px);
}
.prop__question {
  color: #fff;
  font-size: clamp(2.2rem, 8vw, 5rem);
  text-shadow: 0 6px 36px rgba(0, 0, 0, 0.5);
  animation: prop-pulse 2.4s ease-in-out infinite;
}
.prop__answers {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
  justify-content: center;
}
.prop__yes {
  padding: 16px 42px;
  border: none;
  border-radius: 999px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  background: var(--exp-primary);
  cursor: pointer;
  box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--exp-primary) 80%, transparent);
  transition: transform 0.2s var(--exp-ease);
}
.prop__yes:hover {
  transform: scale(1.06);
}
.prop__no {
  padding: 12px 26px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  font-size: 0.95rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.25s var(--exp-ease);
}
.prop__celebrate {
  font-size: clamp(1.8rem, 6vw, 3.4rem);
  font-family: var(--exp-font-display);
  color: #fff;
}
.prop__closing {
  font-family: var(--exp-font-display);
  font-style: italic;
  font-size: clamp(1.1rem, 3vw, 1.6rem);
  color: rgba(255, 255, 255, 0.92);
}
.prop__sign {
  font-family: 'Caveat', cursive;
  font-size: 2.2rem;
  color: color-mix(in srgb, var(--exp-accent) 70%, #fff);
}

@keyframes prop-kb {
  from { transform: scale(1.1); }
  to { transform: scale(1); }
}
@keyframes prop-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.prop-fade-enter-active,
.prop-fade-leave-active {
  transition: opacity 0.6s var(--exp-ease), transform 0.6s var(--exp-ease);
}
.prop-fade-enter-from {
  opacity: 0;
  transform: scale(1.02);
}
.prop-fade-leave-to {
  opacity: 0;
  transform: scale(0.99);
}
@media (prefers-reduced-motion: reduce) {
  .prop__bg { animation: none; }
  .prop__question { animation: none; }
}
</style>
