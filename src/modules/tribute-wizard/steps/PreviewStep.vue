<template>
  <div class="preview-step">
    <WizardStepHeader
      title="Revisar antes de publicar"
      description="O preview ao vivo está disponível ao lado (ou no botão Preview no mobile). Confira se está tudo certo."
    />

    <FwbAlert type="info" class="mb-4">
      Revise textos, fotos, música e efeitos. Você pode voltar a qualquer etapa para ajustar.
    </FwbAlert>

    <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
      <li class="flex items-center gap-2">
        <span class="text-pink-500">✓</span>
        Título: {{ form.title || form.honoree_name || '—' }}
      </li>
      <li class="flex items-center gap-2">
        <span class="text-pink-500">✓</span>
        Mensagem: {{ form.message ? 'Preenchida' : 'Pendente' }}
      </li>
      <li class="flex items-center gap-2">
        <span class="text-pink-500">✓</span>
        Música: {{ musicLabel }}
      </li>
      <li class="flex items-center gap-2">
        <span class="text-pink-500">✓</span>
        Efeitos: {{ form.effects.length ? form.effects.join(', ') : 'Nenhum' }}
      </li>
    </ul>

    <div class="lg:hidden mb-6">
      <TributeLivePreview
        :tribute-id="tributeId"
        :form="form"
        :tribute="tribute"
        :refresh-token="refreshToken"
        compact
      />
    </div>

    <FwbButton color="pink" @click="$emit('go-publish')">
      Ir para publicar
    </FwbButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FwbAlert, FwbButton } from 'flowbite-vue'
import type { TributeDetail } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'

const props = defineProps<{
  tributeId: string
  form: ReturnType<typeof useTributeWizard>['form']
  tribute: TributeDetail | null
  refreshToken: number
}>()

defineEmits<{ 'go-publish': [] }>()

const musicLabel = computed(() => {
  if (props.form.music_source === 'none') return 'Sem música'
  if (props.form.music_source === 'library') return 'Biblioteca'
  return 'Upload'
})
</script>
