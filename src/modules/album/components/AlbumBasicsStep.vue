<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Identidade da galeria"
      description="Título, tipografia e cores — a assinatura visual do seu álbum."
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
        <legend>Cores</legend>
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
        <span>Nomes da homenagem (opcional)</span>
        <input v-model="form.honoree_names" class="ml-input" maxlength="120" />
      </label>
      <label class="ml-field">
        <span>Dedicatória (opcional)</span>
        <textarea
          v-model="form.dedication"
          class="ml-input"
          rows="3"
          placeholder="Aparece na contracapa, como um fechamento íntimo."
        />
      </label>
      <label class="ml-check">
        <input v-model="form.is_public" type="checkbox" />
        <span>Álbum público (visível pelo link após publicar)</span>
      </label>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { AlbumMedia } from '@/api/types'
import type { useAlbumWizard } from '@/composables/useAlbumWizard'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

defineProps<{
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

.basics-hint {
  margin: 0 0 10px;
  font-size: 0.8rem;
  color: var(--muted);
}

.frame-styles {
  display: grid;
  gap: 8px;
}

.frame-style {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.frame-style input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.frame-style--active {
  border-color: color-mix(in srgb, var(--accent, #c45d7a) 55%, var(--border));
  background: color-mix(in srgb, var(--accent, #c45d7a) 8%, transparent);
}

.frame-style__swatch {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 0 0 5px #fbfaf7;
}

.frame-style__swatch[data-style='classic'] {
  background: #ddd;
  box-shadow: inset 0 0 0 5px #fbfaf7;
}
.frame-style__swatch[data-style='cream'] {
  background: #c4a574;
  box-shadow: inset 0 0 0 5px #f3e8d4;
}
.frame-style__swatch[data-style='charcoal'] {
  background: #111;
  box-shadow: inset 0 0 0 5px #2a2e35;
}
.frame-style__swatch[data-style='kraft'] {
  background: #8b6914;
  box-shadow: inset 0 0 0 5px #d2b48c;
}
.frame-style__swatch[data-style='blush'] {
  background: #d48aa0;
  box-shadow: inset 0 0 0 5px #f7e4ea;
}
.frame-style__swatch[data-style='ink'] {
  background: #1d4f73;
  box-shadow: inset 0 0 0 5px #f8fafc;
}

.frame-style__copy {
  display: grid;
  gap: 2px;
}

.frame-style__copy strong {
  font-size: 0.9rem;
}

.frame-style__copy small {
  color: var(--muted);
  font-size: 0.75rem;
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
</style>
