<template>
  <div class="rom-finish">
    <RomanceFormShell
      :icon="experience?.icon ?? '💕'"
      title="Publicar"
      prompt="Última conferida — veja a prévia, valide e publique o presente digital."
    />

    <div v-if="summaryItems.length" class="rom-finish__summary">
      <span v-for="item in summaryItems" :key="item" class="rom-finish__chip">{{ item }}</span>
    </div>

    <div class="rom-finish__layout">
      <section class="rom-form-card rom-finish__preview">
        <div class="rom-finish__preview-head">
          <h3 class="rom-finish__section-title">Prévia ao vivo</h3>
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
          compact
        />
      </section>

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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeDetail } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import { getRomanceExperience, type RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'
import { buildRomanceFinishSummary } from '@/modules/romance-wizard/romanceFinishHelpers'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import PublishStep from '@/modules/tribute-wizard/steps/PublishStep.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'

const props = defineProps<{
  tributeId: string
  form: ReturnType<typeof useTributeWizard>['form']
  tribute: TributeDetail | null
  definition?: TemplateDefinition | null
  experienceId?: string | null
  refreshToken: number
  generating?: boolean
  flushAutosave?: () => Promise<boolean>
  photoCount?: number
}>()

defineEmits<{ regenerate: []; published: [] }>()

const experience = computed(() => getRomanceExperience(props.experienceId as RomanceExperienceId | null))
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
.rom-finish__layout {
  display: grid;
  gap: 16px;
  align-items: start;
}
@media (min-width: 960px) {
  .rom-finish__layout {
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
    gap: 20px;
  }
  .rom-finish__publish {
    position: sticky;
    top: 20px;
  }
}
.rom-finish__section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
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
  min-height: 280px;
  color: var(--muted);
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
