<template>
  <div class="rom-finish">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">Passo 5</p>
      <h2 class="rom-step-intro__title">Pronto para emocionar?</h2>
      <p class="rom-step-intro__desc">
        Confira a prévia ao vivo e publique — link e QR Code na hora, como no Love Cards.
      </p>
    </header>

    <div v-if="previewHints.length" class="rom-hints">
      <ul>
        <li v-for="(hint, index) in previewHints" :key="index">{{ hint }}</li>
      </ul>
    </div>

    <div class="rom-finish__layout">
      <section class="rom-panel rom-finish__preview">
        <div class="rom-finish__preview-head">
          <h3 class="rom-panel__title">Prévia ao vivo</h3>
          <button
            type="button"
            class="ml-btn ml-btn--secondary ml-btn--sm"
            :disabled="generating"
            @click="$emit('regenerate')"
          >
            {{ generating ? 'Atualizando…' : 'Atualizar' }}
          </button>
        </div>

        <div v-if="generating" class="rom-finish__loading">
          <span class="ml-spinner" />
          Gerando prévia...
        </div>
        <TributeLivePreview
          v-else
          :tribute-id="tributeId"
          :form="form"
          :tribute="tribute"
          :refresh-token="refreshToken"
          faithful
        />
      </section>

      <section class="rom-panel rom-finish__publish">
        <PublishStep
          :tribute-id="tributeId"
          :tribute="tribute"
          :flush-autosave="flushAutosave"
          @published="$emit('published')"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeDetail } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import { buildReviewPreviewHints } from '@/modules/tribute-wizard/previewHints'
import PublishStep from '@/modules/tribute-wizard/steps/PublishStep.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'

const props = defineProps<{
  tributeId: string
  form: ReturnType<typeof useTributeWizard>['form']
  tribute: TributeDetail | null
  definition?: TemplateDefinition | null
  refreshToken: number
  generating?: boolean
  flushAutosave?: () => Promise<boolean>
}>()

defineEmits<{ regenerate: []; published: [] }>()

const previewHints = computed(() =>
  buildReviewPreviewHints(props.form, props.definition?.layout),
)
</script>

<style scoped>
.rom-hints {
  margin-bottom: 18px;
  padding: 14px 18px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--rom-accent, var(--primary)) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--rom-accent, var(--primary)) 18%, var(--border));
}
.rom-hints ul {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.55;
}
.rom-finish__layout {
  display: grid;
  gap: 20px;
}
@media (min-width: 1100px) {
  .rom-finish__layout {
    grid-template-columns: 1.15fr 0.85fr;
    align-items: start;
  }
}
.rom-finish__preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.rom-finish__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 320px;
  color: var(--muted);
}
.rom-finish__publish :deep(.publish-step) {
  padding: 0;
}
</style>
