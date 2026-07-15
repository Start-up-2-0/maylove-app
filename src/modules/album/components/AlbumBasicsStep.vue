<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Identidade do álbum"
      description="Título, texto de abertura, cores e estilo da moldura Polaroid das fotos."
    />

    <form class="basics-form" @submit.prevent>
      <label class="ml-field">
        <span>Título</span>
        <input v-model="form.title" class="ml-input" maxlength="200" required />
      </label>
      <label class="ml-field">
        <span>Texto de abertura (opcional)</span>
        <textarea
          v-model="form.subtitle"
          class="ml-input"
          rows="2"
          maxlength="280"
          placeholder="Uma frase que aparece acima da galeria de fotos."
        />
      </label>
      <label class="ml-field">
        <span>Eyebrow (rótulo pequeno)</span>
        <input v-model="form.book_config.cover.eyebrow" class="ml-input" maxlength="40" />
      </label>

      <fieldset class="basics-fieldset">
        <legend>Moldura Polaroid</legend>
        <p class="text-muted basics-hint">
          Cada foto da fototeca aparece nesta moldura, com título e descrição.
        </p>
        <div class="frame-styles">
          <label
            v-for="style in frameStyles"
            :key="style.id"
            class="frame-style"
            :class="{ 'frame-style--active': form.book_config.frame_style === style.id }"
          >
            <input v-model="form.book_config.frame_style" type="radio" :value="style.id" />
            <span class="frame-style__swatch" :data-style="style.id" aria-hidden="true" />
            <span class="frame-style__copy">
              <strong>{{ style.label }}</strong>
              <small>{{ style.hint }}</small>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset class="basics-fieldset">
        <legend>Cores</legend>
        <div class="color-row">
          <label class="ml-field">
            <span>Fundo</span>
            <input v-model="form.book_config.colors.paper" type="color" class="basics-color" />
          </label>
          <label class="ml-field">
            <span>Texto</span>
            <input v-model="form.book_config.colors.ink" type="color" class="basics-color" />
          </label>
          <label class="ml-field">
            <span>Destaque</span>
            <input v-model="form.book_config.colors.accent" type="color" class="basics-color" />
          </label>
        </div>
      </fieldset>

      <label class="ml-field">
        <span>Mensagem de encerramento (opcional)</span>
        <textarea
          v-model="form.closing_message"
          class="ml-input"
          rows="3"
          placeholder="Aparece abaixo da galeria."
        />
      </label>
      <label class="ml-field">
        <span>Assinatura (opcional)</span>
        <input v-model="form.signature" class="ml-input" maxlength="120" />
      </label>
      <label class="ml-check">
        <input v-model="form.is_public" type="checkbox" />
        <span>Álbum público (visível pelo link após publicar)</span>
      </label>
    </form>

    <section v-if="previewBook" class="basics-preview">
      <h3 class="basics-preview__title">Prévia da galeria</h3>
      <BookRenderer :book="previewBook" mode="preview" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AlbumMedia } from '@/api/types'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import { buildMemoryBookModelFromDetail } from '../book/buildModel'
import BookRenderer from '../book/BookRenderer.vue'
import { BOOK_FRAME_STYLES } from '../book/frameStyles'

const props = defineProps<{
  form: ReturnType<typeof useAlbumWizard>['form']
  album: ReturnType<typeof useAlbumWizard>['album']['value']
  photos: AlbumMedia[]
}>()

const frameStyles = BOOK_FRAME_STYLES

const previewBook = computed(() => {
  if (!props.album) return null
  return buildMemoryBookModelFromDetail({
    ...props.album,
    title: props.form.title,
    subtitle: props.form.subtitle,
    closing_message: props.form.closing_message,
    signature: props.form.signature,
    color_primary: props.form.book_config.colors.accent,
    presentation: props.form.presentation,
    photos_per_page: props.form.photos_per_page,
    book_config: props.form.book_config,
    book_pages: props.form.book_pages,
  })
})
</script>

<style scoped>
.basics-form {
  display: grid;
  gap: 16px;
  max-width: 640px;
}

.basics-fieldset {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px 14px;
}

.basics-fieldset legend {
  padding: 0 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
}

.color-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.basics-color {
  width: 56px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.basics-hint {
  font-size: 0.86rem;
  margin: 0 0 8px;
}

.frame-styles {
  display: grid;
  gap: 8px;
}

.frame-style {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  cursor: pointer;
  position: relative;
}

.frame-style input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.frame-style--active {
  border-color: color-mix(in srgb, var(--primary) 55%, var(--border));
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 70%, #fff);
}

.frame-style__swatch {
  width: 42px;
  height: 52px;
  border-radius: 3px;
  box-shadow: 0 8px 16px -10px rgba(0, 0, 0, 0.35);
  position: relative;
}

.frame-style__swatch::after {
  content: '';
  position: absolute;
  inset: 6px 6px 14px;
  background: #bbb;
}

.frame-style__swatch[data-style='classic'] {
  background: #fbfaf7;
}
.frame-style__swatch[data-style='cream'] {
  background: #f3e8d4;
}
.frame-style__swatch[data-style='charcoal'] {
  background: #2a2e35;
}
.frame-style__swatch[data-style='kraft'] {
  background: #d2b48c;
}
.frame-style__swatch[data-style='blush'] {
  background: #f7e4ea;
}
.frame-style__swatch[data-style='ink'] {
  background: #f8fafc;
  outline: 2px solid #1d4f73;
  outline-offset: -4px;
}

.frame-style__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;
}

.frame-style__copy small {
  color: var(--muted);
}

.ml-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
}

.basics-preview {
  margin-top: 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-3);
}

.basics-preview__title {
  margin: 0;
  padding: 12px 16px;
  font-size: 0.95rem;
  border-bottom: 1px solid var(--border);
}
</style>
