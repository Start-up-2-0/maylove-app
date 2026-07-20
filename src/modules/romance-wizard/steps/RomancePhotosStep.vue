<template>
  <div class="rom-photos">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">{{ experience?.label ?? 'Romance' }}</p>
      <h2 class="rom-step-intro__title">{{ photosMode === 'cover' ? 'Foto de capa' : 'Fotos de vocês' }}</h2>
      <p class="rom-step-intro__desc">{{ introDesc }}</p>
    </header>

    <section class="rom-panel">
      <div class="rom-couple__photo-head">
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listTemplates } from '@/api/catalog'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import PhotosStep from '@/modules/tribute-wizard/steps/PhotosStep.vue'
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

const maxPhotos = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.max_photos ?? 20
})

const introDesc = computed(() =>
  photosMode.value === 'cover'
    ? 'A primeira imagem que abre a surpresa — escolha a favorita de vocês.'
    : 'Envie as fotos que contam a história. A plataforma organiza tudo na experiência.',
)

onMounted(async () => {
  try {
    catalogTemplates.value = await listTemplates(props.tributeTypeId || undefined)
  } catch {
    catalogTemplates.value = []
  }
})
</script>

<style scoped>
.rom-couple__photo-head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}
.rom-couple__photo-count {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--rom-accent, #e11d48);
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 10%, var(--surface));
}
</style>
