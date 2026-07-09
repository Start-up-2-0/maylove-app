<template>
  <section v-if="messages.length" class="exp-section msg-section">
    <div class="exp-container" v-reveal>
      <p v-if="title" class="exp-eyebrow msg__eyebrow">{{ title }}</p>

      <div class="msg__card">
        <svg class="msg__quote" viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true">
          <path d="M7 7h4v4c0 3-2 5-5 5v-2c1.5 0 2.5-1 2.5-2H7V7Zm8 0h4v4c0 3-2 5-5 5v-2c1.5 0 2.5-1 2.5-2H15V7Z" />
        </svg>
        <transition name="msg-fade" mode="out-in">
          <p :key="active" class="msg__text">{{ messages[active] }}</p>
        </transition>
      </div>

      <div v-if="messages.length > 1" class="msg__dots">
        <button
          v-for="(_, index) in messages"
          :key="index"
          class="msg__dot"
          :class="{ 'msg__dot--active': index === active }"
          :aria-label="`Mensagem ${index + 1}`"
          @click="active = index"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { SectionComponentProps } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'

const props = defineProps<SectionComponentProps>()

const active = ref(0)
const title = computed(() => (props.section.config?.title as string) || 'Mensagens')
const messages = computed(() => props.content.messages)

let timer: number | undefined
onMounted(() => {
  if (messages.value.length > 1) {
    timer = window.setInterval(() => {
      active.value = (active.value + 1) % messages.value.length
    }, 6000)
  }
})
onUnmounted(() => window.clearInterval(timer))
</script>

<style scoped>
.msg-section {
  text-align: center;
}
.msg__eyebrow {
  display: block;
  margin-bottom: 26px;
}
.msg__card {
  position: relative;
  padding: clamp(32px, 5vw, 52px);
  border-radius: 24px;
  background: var(--exp-surface);
  border: 1px solid var(--exp-border);
  box-shadow: 0 30px 60px -34px rgba(0, 0, 0, 0.4);
}
.msg__quote {
  color: var(--exp-primary);
  opacity: 0.5;
  margin-bottom: 12px;
}
.msg__text {
  font-family: var(--exp-font-display);
  font-size: clamp(1.2rem, 3vw, 1.7rem);
  line-height: 1.5;
  color: var(--exp-ink);
  min-height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
}
.msg__dot {
  width: 8px;
  height: 8px;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--exp-primary) 30%, transparent);
  transition: width 0.2s ease, background 0.2s ease;
}
.msg__dot--active {
  width: 22px;
  background: var(--exp-primary);
}
.msg-fade-enter-active,
.msg-fade-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.msg-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.msg-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
