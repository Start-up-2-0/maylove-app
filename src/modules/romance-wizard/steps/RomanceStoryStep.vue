<template>
  <div class="rom-story">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">Passo 3</p>
      <h2 class="rom-step-intro__title">Escreva sua história</h2>
      <p class="rom-step-intro__desc">
        A carta de amor, momentos marcantes e — se quiser — a data que mudou tudo.
      </p>
    </header>

    <div class="rom-story__stack">
      <section class="rom-panel">
        <h3 class="rom-panel__title">Sua mensagem</h3>
        <p class="rom-panel__hint">O texto principal — como uma carta do LoveTale.</p>
        <RichTextEditor v-model="form.message" placeholder="Escreva do coração..." />
        <label class="rom-inline-toggle">
          <input v-model="form.include_opening_message" type="checkbox" />
          <span>Exibir mensagem como abertura da experiência</span>
        </label>
      </section>

      <section class="rom-panel">
        <StoryStep :form="form" :photos="photos" />
      </section>

      <section class="rom-panel">
        <SpecialDateStep :form="form" />
      </section>

      <section v-if="showEventInfo" class="rom-panel">
        <h3 class="rom-panel__title">Detalhes do encontro</h3>
        <p class="rom-panel__hint">Local e horário — aparecem em um cartão na página.</p>
        <EventStep :form="form" embedded />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { showWizardEventInfo } from '@/modules/tribute-wizard/tributeTypeFlow'
import StoryStep from '@/modules/tribute-wizard/steps/StoryStep.vue'
import SpecialDateStep from '@/modules/tribute-wizard/steps/SpecialDateStep.vue'
import EventStep from '@/modules/tribute-wizard/steps/EventStep.vue'
import RichTextEditor from '@/components/wizard/RichTextEditor.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  photos: TributeMedia[]
}>()

const showEventInfo = computed(() => showWizardEventInfo(props.form.wizard_type_id))
</script>

<style scoped>
.rom-story__stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.rom-inline-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  font-size: 0.88rem;
  color: var(--muted);
  cursor: pointer;
}
.rom-inline-toggle input {
  accent-color: var(--rom-accent, var(--primary));
}
</style>
