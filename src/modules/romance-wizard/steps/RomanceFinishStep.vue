<template>
  <div class="rom-finish">
    <RomanceFormShell
      :title="stepTitle"
      :prompt="stepPrompt"
    />

    <div v-if="summaryItems.length" class="rom-finish__summary">
      <span v-for="item in summaryItems" :key="item" class="rom-finish__chip">{{ item }}</span>
    </div>
    <p class="rom-finish__edit-hint">Quer ajustar algo? Use <strong>Voltar</strong> ou toque em uma etapa acima.</p>

    <section class="rom-form-card rom-finish__publish">
      <PublishStep
        :tribute-id="tributeId"
        :tribute="tribute"
        :experience-id="experienceId"
        :flush-autosave="flushAutosave"
        embedded
        romance
        @published="$emit('published')"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeDetail } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { type RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import { buildRomanceFinishSummary } from '@/modules/romance-wizard/romanceFinishHelpers'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import PublishStep from '@/modules/tribute-wizard/steps/PublishStep.vue'

const props = defineProps<{
  tributeId: string
  form: ReturnType<typeof useTributeWizard>['form']
  tribute: TributeDetail | null
  experienceId?: string | null
  flushAutosave?: () => Promise<boolean>
  photoCount?: number
}>()

defineEmits<{ published: [] }>()

const stepTitle = computed(() => getCoachStepTitle('preview', 'Publicar presente'))
const stepPrompt = computed(() => getCoachPrompt('preview', props.experienceId as RomanceExperienceId | null))
const summaryItems = computed(() =>
  buildRomanceFinishSummary(props.form, props.experienceId as RomanceExperienceId | null, props.photoCount ?? 0),
)
</script>

<style scoped>
.rom-finish {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.rom-finish__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.rom-finish__chip {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--rom-muted, #9f1239);
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 14%, var(--border));
}
.rom-finish__edit-hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.45;
}
.rom-finish__edit-hint strong {
  color: var(--ink);
  font-weight: 700;
}
.rom-finish__publish :deep(.publish-step) {
  padding: 0;
}
.rom-finish__publish :deep(.wiz-step-header) {
  display: none;
}
.rom-finish__publish :deep(.wiz-card-stack) {
  gap: 14px;
}
.rom-finish__publish :deep(.wiz-card) {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}
.rom-finish__publish :deep(.wiz-card__title) {
  font-size: 1rem;
  margin-bottom: 10px;
}
</style>
