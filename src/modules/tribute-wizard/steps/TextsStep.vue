<template>
  <div class="texts-step">
    <WizardStepHeader
      title="Textos e identidade"
      description="Alterações são salvas automaticamente após 2 segundos."
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FwbInput v-model="form.title" label="Título" maxlength="120" />
      <FwbInput v-model="form.subtitle" label="Subtítulo" maxlength="160" />
      <FwbInput
        v-model="form.honoree_name"
        label="Nome do homenageado *"
        required
        maxlength="120"
        class="md:col-span-2"
      />
      <FwbTextarea
        v-model="form.message"
        label="Mensagem principal *"
        :rows="6"
        maxlength="5000"
        class="md:col-span-2"
      />
      <FwbTextarea
        v-model="form.closing_message"
        label="Mensagem de encerramento"
        :rows="3"
        maxlength="500"
        class="md:col-span-2"
      />
      <FwbInput v-model="form.special_date" label="Data especial" type="date" />
      <FwbInput v-model="form.slug" label="Slug público" placeholder="para-maria" />
      <label class="md:col-span-2 flex flex-col gap-2 text-sm text-gray-500">
        <span>Cor primária</span>
        <input
          v-model="form.color_primary"
          type="color"
          class="h-11 w-full rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FwbInput, FwbTextarea } from 'flowbite-vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
}>()
</script>
