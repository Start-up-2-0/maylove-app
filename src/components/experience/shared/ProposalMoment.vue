<template>
  <section class="proposal-moment" :class="{ 'proposal-moment--accepted': accepted }">
    <EffectsLayer
      v-if="accepted"
      :effects="celebrationEffects"
      :accent="theme.accentColor"
    />

    <div class="proposal-moment__content">
      <template v-if="!accepted">
        <p class="proposal-moment__eyebrow">A pergunta especial</p>
        <h2 class="proposal-moment__question">{{ proposal.question }}</h2>
        <button type="button" class="proposal-moment__accept" @click="accept">
          Sim! 💍
        </button>
      </template>

      <template v-else>
        <p class="proposal-moment__eyebrow">Um novo capítulo começa agora</p>
        <h2 class="proposal-moment__celebration">{{ celebration }}</h2>
        <p v-if="signature" class="proposal-moment__signature">Com amor, {{ signature }}</p>
        <ShareBar
          v-if="mode === 'full' && shareUrl"
          :url="shareUrl"
          :text="content.title"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExperienceContent, ResolvedTheme } from '@/templates/types'
import type { TributeEffect } from '@/api/types'
import { useExperienceAudio } from '@/composables/experienceAudio'
import EffectsLayer from '@/components/experience/shared/EffectsLayer.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import { resolveProposalCopy } from '@/modules/romance-wizard/proposalCopy'

const props = defineProps<{
  content: ExperienceContent
  theme: ResolvedTheme
  mode?: 'full' | 'preview'
  shareUrl?: string
}>()

const accepted = ref(false)
const audio = useExperienceAudio()
const proposal = computed(() =>
  resolveProposalCopy(
    props.content.romanceExperienceId,
    props.content.question,
    props.content.celebration,
  ),
)
const celebration = computed(() => proposal.value.celebration)
const signature = computed(() => props.content.signature || props.content.senderName)
const celebrationEffects = computed<TributeEffect[]>(() =>
  Array.from(new Set<TributeEffect>([...props.content.effects, 'hearts', 'confetti'])),
)

function accept() {
  if (accepted.value) return
  accepted.value = true
  if (audio?.hasAudio) audio.play()
}
</script>

<style scoped>
.proposal-moment {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  min-height: min(620px, 82svh);
  padding: clamp(48px, 8vw, 96px) 20px;
  overflow: hidden;
  color: #fff;
  text-align: center;
  background:
    radial-gradient(circle at 50% 15%, color-mix(in srgb, var(--exp-accent, #e11d48) 42%, transparent), transparent 44%),
    linear-gradient(155deg, #16070d, color-mix(in srgb, var(--exp-accent, #e11d48) 46%, #240914));
}
.proposal-moment__content {
  position: relative;
  z-index: 2;
  width: min(720px, 100%);
}
.proposal-moment__eyebrow {
  margin: 0 0 18px;
  color: color-mix(in srgb, var(--exp-accent, #fda4af) 52%, #fff);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.proposal-moment__question,
.proposal-moment__celebration {
  margin: 0;
  font-family: var(--exp-font-display, Georgia, serif);
  font-size: clamp(2rem, 7vw, 4.8rem);
  line-height: 1.06;
  overflow-wrap: anywhere;
  text-wrap: balance;
}
.proposal-moment__accept {
  margin-top: 34px;
  padding: 14px 30px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: var(--exp-accent, #e11d48);
  box-shadow: 0 18px 42px color-mix(in srgb, var(--exp-accent, #e11d48) 42%, transparent);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.proposal-moment__accept:hover { transform: translateY(-2px) scale(1.02); }
.proposal-moment__accept:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }
.proposal-moment__signature { margin: 24px 0 0; color: rgb(255 255 255 / 78%); }
.proposal-moment--accepted .proposal-moment__content { animation: proposal-arrive 0.55s ease both; }
@keyframes proposal-arrive {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .proposal-moment--accepted .proposal-moment__content { animation: none; }
  .proposal-moment__accept { transition: none; }
}
</style>
