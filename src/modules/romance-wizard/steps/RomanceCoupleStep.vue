<template>
  <div class="rom-couple">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">Passo 2</p>
      <h2 class="rom-step-intro__title">Quem são os protagonistas?</h2>
      <p class="rom-step-intro__desc">
        Comece pela foto que abre a surpresa e diga quem presenteia quem — simples assim.
      </p>
    </header>

    <div class="rom-couple__stack">
      <section class="rom-panel rom-couple__photo">
        <div class="rom-couple__photo-head">
          <div>
            <h3 class="rom-panel__title">Foto de capa *</h3>
            <p class="rom-panel__hint rom-panel__hint--tight">
              A primeira imagem que {{ form.honoree_name?.trim() || 'quem você ama' }} verá ao abrir o link.
            </p>
          </div>
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
          variant="cover"
          compact
          @changed="$emit('media-changed')"
        />
      </section>

      <section class="rom-panel rom-couple__identity">
        <h3 class="rom-panel__title">Nomes e título</h3>
        <p class="rom-panel__hint">Aparecem no topo da página e na prévia ao compartilhar.</p>

        <div class="rom-couple__fields">
          <label class="rom-field">
            <span class="rom-field__label">Quem recebe o presente *</span>
            <input
              v-model="form.honoree_name"
              class="rom-field__input"
              maxlength="120"
              placeholder="Ex.: Maria"
              autocomplete="off"
            />
            <span class="rom-field__hint">Use o nome ou apelido carinhoso.</span>
          </label>

          <label class="rom-field">
            <span class="rom-field__label">Quem envia</span>
            <input
              v-model="form.sender_name"
              class="rom-field__input"
              maxlength="80"
              placeholder="Ex.: João"
              autocomplete="off"
            />
          </label>

          <label class="rom-field rom-field--wide">
            <span class="rom-field__label">Título da página</span>
            <input
              v-model="form.title"
              class="rom-field__input"
              maxlength="120"
              :placeholder="titlePlaceholder"
              autocomplete="off"
            />
            <span class="rom-field__hint">Frase curta que resume o presente — pode editar depois.</span>
          </label>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { listTemplates } from '@/api/catalog'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import PhotosStep from '@/modules/tribute-wizard/steps/PhotosStep.vue'
import {
  applyRomanceTitleDefaults,
  defaultRomanceTitle,
} from '@/modules/romance-wizard/romanceCopy'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  tributeId: string
  photos: TributeMedia[]
  definition: TemplateDefinition | null | undefined
  tributeTypeId?: string
}>()

defineEmits<{ 'media-changed': [] }>()

const catalogTemplates = ref<{ id: string; max_photos?: number }[]>([])

const maxPhotos = computed(() => {
  const tpl = catalogTemplates.value.find((item) => item.id === props.form.template_id)
  return tpl?.max_photos ?? 20
})

const titlePlaceholder = computed(() => defaultRomanceTitle(props.form.wizard_type_id))

onMounted(async () => {
  applyRomanceTitleDefaults(props.form)
  try {
    catalogTemplates.value = await listTemplates(props.tributeTypeId || undefined)
  } catch {
    catalogTemplates.value = []
  }
})

watch(
  () => props.form.wizard_type_id,
  () => applyRomanceTitleDefaults(props.form),
)
</script>

<style scoped>
.rom-couple__stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 720px;
}
.rom-couple__photo-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.rom-panel__hint--tight {
  margin-bottom: 0;
}
.rom-couple__photo-count {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--rom-accent, #e11d48);
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 10%, var(--surface));
}
.rom-couple__fields {
  display: grid;
  gap: 16px;
}
@media (min-width: 640px) {
  .rom-couple__fields {
    grid-template-columns: 1fr 1fr;
  }
  .rom-field--wide {
    grid-column: 1 / -1;
  }
}
</style>
