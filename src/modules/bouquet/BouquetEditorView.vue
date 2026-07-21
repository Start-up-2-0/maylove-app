<template>
  <div class="bouquet-builder">
    <header class="bouquet-builder__header">
      <RouterLink to="/dashboard/bouquets" class="bouquet-builder__back">← Voltar</RouterLink>
      <h1>Monte seu buquê</h1>
      <span class="bouquet-builder__step">Passo {{ currentStep }} de 2</span>
    </header>

    <div v-if="loading" class="bouquet-builder__loading">Carregando...</div>
    <div v-else-if="error" class="ml-alert ml-alert--danger">{{ error }}</div>

    <div v-else-if="!isEditable && bouquet?.status === 'published'" class="ml-card published-only">
      <h2>Buquê publicado</h2>
      <p>Este buquê já está no ar.</p>
      <a :href="`/bouquet/${bouquet.slug}`" target="_blank" class="ml-btn ml-btn--primary">Abrir página</a>
    </div>

    <div v-else class="bouquet-builder__grid">
      <section class="bouquet-builder__form">
        <BouquetStemsStep
          v-if="currentStep === 1"
          :stems="form.stems"
          :wrap-color="form.wrap_color"
          @add="addStem"
          @remove="removeStem"
          @update:wrap-color="form.wrap_color = $event"
        />

        <BouquetLetterStep
          v-else
          :bouquet-id="bouquetId"
          :bouquet="bouquet"
          v-model:recipient-name="form.recipient_name"
          v-model:sender-name="form.sender_name"
          v-model:letter-body="form.letter_body"
          v-model:letter-design="form.letter_design"
          :flush-autosave="flushAutosave"
          @back="currentStep = 1"
          @published="onPublished"
        />

        <button
          v-if="currentStep === 1"
          class="ml-btn ml-btn--primary ml-btn--lg bouquet-builder__continue"
          @click="currentStep = 2"
        >
          Continuar para a carta →
        </button>
      </section>

      <aside class="bouquet-builder__preview">
        <BouquetLivePreview
          :stems="form.stems"
          :wrap-color="form.wrap_color"
          :recipient-name="form.recipient_name"
          :sender-name="form.sender_name"
          :letter-body="form.letter_body"
          :letter-design="form.letter_design"
          :show-letter="currentStep === 2"
        />
      </aside>
    </div>

    <p v-if="saveError" class="ml-alert ml-alert--danger bouquet-builder__save-error">{{ saveError }}</p>
    <p v-else-if="saving" class="bouquet-builder__save-status">Salvando...</p>
    <p v-else-if="savedAt" class="bouquet-builder__save-status">Salvo</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useBouquetWizard } from '@/composables/useBouquetWizard'
import BouquetStemsStep from './components/BouquetStemsStep.vue'
import BouquetLetterStep from './components/BouquetLetterStep.vue'
import BouquetLivePreview from './components/BouquetLivePreview.vue'

const route = useRoute()
const bouquetId = route.params.id as string
const currentStep = ref(1)

const {
  bouquet,
  form,
  loading,
  error,
  saving,
  savedAt,
  saveError,
  flushAutosave,
  isEditable,
  load,
  addStem,
  removeStem,
} = useBouquetWizard(bouquetId)

onMounted(load)

async function onPublished() {
  await load()
}
</script>

<style scoped>
.bouquet-builder {
  min-height: 100vh;
  background: #faf6f0;
  padding: 24px clamp(16px, 4vw, 40px) 40px;
}

.bouquet-builder__header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.bouquet-builder__header h1 {
  margin: 0;
  text-align: center;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.4rem, 3vw, 1.8rem);
  color: #3d2b2f;
}

.bouquet-builder__back {
  color: #6f6259;
  text-decoration: none;
}

.bouquet-builder__step {
  justify-self: end;
  color: #9a8d84;
  font-size: 14px;
}

.bouquet-builder__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 28px;
  align-items: start;
}

.bouquet-builder__form {
  background: transparent;
}

.bouquet-builder__preview {
  position: sticky;
  top: 24px;
}

.bouquet-builder__continue {
  width: 100%;
  margin-top: 24px;
  background: #c4456a;
  border-color: #c4456a;
}

.bouquet-builder__loading,
.bouquet-builder__save-status {
  color: #8a7d74;
}

.bouquet-builder__save-error {
  margin-top: 16px;
}

.published-only {
  padding: 24px;
  max-width: 520px;
}

@media (max-width: 960px) {
  .bouquet-builder__grid {
    grid-template-columns: 1fr;
  }

  .bouquet-builder__preview {
    position: static;
  }
}
</style>
