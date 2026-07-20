<template>
  <div class="rom-couple">
    <header class="rom-step-intro">
      <p class="rom-step-intro__eyebrow">Passo 2</p>
      <h2 class="rom-step-intro__title">Conte quem ama quem</h2>
      <p class="rom-step-intro__desc">
        Nomes e uma foto linda de vocês — é o coração do presente digital.
      </p>
    </header>

    <div class="rom-couple__grid">
      <section class="rom-panel">
        <h3 class="rom-panel__title">Identidade</h3>
        <div class="rom-fields">
          <label class="ml-field">
            <span class="ml-label">Para quem é *</span>
            <input
              v-model="form.honoree_name"
              class="ml-input"
              maxlength="120"
              placeholder="Ex.: Maria, meu amor"
            />
          </label>
          <label class="ml-field">
            <span class="ml-label">De quem (opcional)</span>
            <input
              v-model="form.sender_name"
              class="ml-input"
              maxlength="80"
              placeholder="Ex.: João"
            />
          </label>
          <label class="ml-field">
            <span class="ml-label">Título da página</span>
            <input
              v-model="form.title"
              class="ml-input"
              maxlength="120"
              placeholder="Ex.: Nosso amor em cada detalhe"
            />
          </label>
        </div>
      </section>

      <section class="rom-panel">
        <h3 class="rom-panel__title">Foto de capa *</h3>
        <p class="rom-panel__hint">A imagem que abre a surpresa — escolha a favorita de vocês.</p>
        <PhotosStep
          :tribute-id="tributeId"
          :photos="photos"
          :max-photos="maxPhotos"
          :form="form"
          :definition="definition"
          compact
          @changed="$emit('media-changed')"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listTemplates } from '@/api/catalog'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import type { TemplateDefinition } from '@/templates/types'
import PhotosStep from '@/modules/tribute-wizard/steps/PhotosStep.vue'

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
  return tpl?.max_photos ?? 50
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
.rom-couple__grid {
  display: grid;
  gap: 18px;
}
@media (min-width: 900px) {
  .rom-couple__grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}
.rom-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
