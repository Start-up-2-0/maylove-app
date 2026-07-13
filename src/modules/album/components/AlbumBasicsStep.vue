<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Informações do álbum"
      description="Título e subtítulo na capa; mensagem e assinatura só na contracapa se você preencher. Salvo automaticamente."
    />

    <form class="basics-form" @submit.prevent>
      <label class="ml-field">
        <span>Título</span>
        <input v-model="form.title" class="ml-input" maxlength="200" required />
      </label>
      <label class="ml-field">
        <span>Subtítulo (opcional)</span>
        <input v-model="form.subtitle" class="ml-input" maxlength="200" />
      </label>
      <label class="ml-field">
        <span>Mensagem de encerramento (opcional)</span>
        <textarea
          v-model="form.closing_message"
          class="ml-input"
          rows="4"
          placeholder="Se deixar em branco, a contracapa fica sem mensagem."
        />
      </label>
      <label class="ml-field">
        <span>Assinatura (opcional)</span>
        <input v-model="form.signature" class="ml-input" maxlength="120" />
      </label>
      <label class="ml-field">
        <span>Cor principal</span>
        <input v-model="form.color_primary" type="color" class="basics-color" />
      </label>
      <label class="ml-check">
        <input v-model="form.is_public" type="checkbox" />
        <span>Álbum público (visível pelo link após publicar)</span>
      </label>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

defineProps<{
  form: ReturnType<typeof useAlbumWizard>['form']
}>()
</script>

<style scoped>
.basics-form {
  display: grid;
  gap: 16px;
  max-width: 560px;
}

.basics-color {
  width: 56px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.ml-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
}
</style>
