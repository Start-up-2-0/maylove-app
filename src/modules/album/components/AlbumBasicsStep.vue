<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Identidade do livro"
      description="Capa, tipografia e cores — a base editorial do seu photobook."
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
          placeholder="Uma frase discreta sob o título na capa."
        />
      </label>
      <label class="ml-field">
        <span>Eyebrow (rótulo da capa)</span>
        <input
          v-model="form.book_config.cover.eyebrow"
          class="ml-input"
          maxlength="40"
          placeholder="ÁLBUM · CASAMENTO · FAMÍLIA"
        />
      </label>

      <fieldset class="basics-fieldset">
        <legend>Tipografia</legend>
        <div class="font-presets">
          <label
            v-for="preset in fontPresets"
            :key="preset.id"
            class="font-preset"
            :class="{ 'font-preset--active': form.book_config.fonts.preset === preset.id }"
          >
            <input v-model="form.book_config.fonts.preset" type="radio" :value="preset.id" />
            <strong :style="{ fontFamily: preset.sample }">{{ preset.label }}</strong>
            <small>{{ preset.hint }}</small>
          </label>
        </div>
      </fieldset>

      <fieldset class="basics-fieldset">
        <legend>Cores do papel</legend>
        <div class="color-row">
          <label class="ml-field">
            <span>Papel</span>
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
          placeholder="Aparece na contracapa, como um fechamento íntimo."
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
      <h3 class="basics-preview__title">Prévia da capa</h3>
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

const props = defineProps<{
  form: ReturnType<typeof useAlbumWizard>['form']
  album: ReturnType<typeof useAlbumWizard>['album']['value']
  photos: AlbumMedia[]
}>()

const fontPresets = [
  {
    id: 'editorial' as const,
    label: 'Editorial',
    hint: 'Serif elegante, tom de revista',
    sample: "'Cormorant Garamond', Georgia, serif",
  },
  {
    id: 'classic' as const,
    label: 'Clássica',
    hint: 'Display forte + Baskerville',
    sample: "'Playfair Display', Georgia, serif",
  },
  {
    id: 'modern' as const,
    label: 'Moderna',
    hint: 'Sans limpa, contemporânea',
    sample: "'Space Grotesk', system-ui, sans-serif",
  },
]

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

.font-presets {
  display: grid;
  gap: 8px;
}

.font-preset {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.font-preset input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.font-preset strong {
  font-size: 1.05rem;
  font-weight: 600;
}

.font-preset small {
  color: var(--muted);
  font-size: 0.78rem;
}

.font-preset--active {
  border-color: color-mix(in srgb, var(--accent, #c45d7a) 55%, var(--border));
  background: color-mix(in srgb, var(--accent, #c45d7a) 8%, transparent);
}

.color-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.basics-color {
  width: 48px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
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
