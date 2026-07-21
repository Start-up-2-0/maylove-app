<template>
  <RomanceFormShell
    :title="stepTitle"
    :prompt="stepPrompt"
    flat
  >
    <div class="rom-photos__meta">
      <span v-if="photos.length" class="rom-couple__photo-count">
        {{ photos.length }} foto{{ photos.length === 1 ? '' : 's' }}
      </span>
    </div>
    <PhotosStep
      :tribute-id="tributeId"
      :photos="photos"
      :max-photos="maxPhotos"
      :form="form"
      :definition="definition"
      :variant="photosMode === 'cover' ? 'cover' : 'default'"
      compact
      @changed="$emit('media-changed')"
    />
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listTemplates } from '@/api/catalog'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import PhotosStep from '@/modules/tribute-wizard/steps/PhotosStep.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import {
  getRomanceExperience,
  type RomanceExperienceId,
} from '@/modules/romance-wizard/romanceExperiences'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  photos: TributeMedia[]
  definition: TemplateDefinition | null | undefined
  experienceId?: RomanceExperienceId | null
  tributeTypeId?: string
}>()

defineEmits<{ 'media-changed': [] }>()

const catalogTemplates = ref<{ id: string; max_photos?: number }[]>([])

const experience = computed(() => getRomanceExperience(props.experienceId))
const photosMode = computed(() => experience.value?.photosMode ?? 'gallery')

const stepTitle = computed(() =>
  getCoachStepTitle('photos', photosMode.value === 'cover' ? 'Foto de capa' : 'Fotos de vocês'),
)
const stepPrompt = computed(() => getCoachPrompt('photos', props.experienceId))
const maxPhotos = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.max_photos ?? 20
})

onMounted(async () => {
  try {
    catalogTemplates.value = await listTemplates(props.tributeTypeId || undefined)
  } catch {
    catalogTemplates.value = []
  }
})
</script>

<style scoped>
.rom-photos__meta {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.rom-couple__photo-count {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--rom-accent, #e11d48);
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 10%, var(--surface));
}
</style>
