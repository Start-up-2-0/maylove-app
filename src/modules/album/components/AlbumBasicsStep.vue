<template>
  <div class="basics-step">
    <WizardStepHeader
      :title="headerTitle"
      :description="headerDescription"
    />

    <form class="basics-form" @submit.prevent>
      <label class="ml-field">
        <span>Título</span>
        <input v-model="form.title" class="ml-input" maxlength="200" required />
      </label>
      <label class="ml-field">
        <span>Tagline / subtítulo (opcional)</span>
        <input
          v-model="form.subtitle"
          class="ml-input"
          maxlength="200"
          :placeholder="
            isPortrait
              ? 'Memórias no papel'
              : isBoard
                ? 'Memórias coladas com carinho'
                : '— from dreams to memories —'
          "
        />
      </label>
      <label class="ml-field">
        <span>{{ isPortrait ? 'Eyebrow da página' : isBoard ? 'Eyebrow do quadro' : 'Eyebrow da capa' }}</span>
        <input v-model="form.book_config.cover.eyebrow" class="ml-input" maxlength="40" />
      </label>

      <fieldset v-if="!isBoard" class="basics-fieldset">
        <legend>Modo da capa</legend>
        <div class="cover-modes">
          <label v-for="mode in coverModes" :key="mode.id" class="cover-mode">
            <input v-model="form.book_config.cover.mode" type="radio" :value="mode.id" />
            <span>
              <strong>{{ mode.label }}</strong>
              <small>{{ mode.hint }}</small>
            </span>
          </label>
        </div>
      </fieldset>

      <label
        v-if="!isBoard && form.book_config.cover.mode !== 'text' && photos.length"
        class="ml-field"
      >
        <span>Foto da capa</span>
        <select v-model="form.book_config.cover.media_id" class="ml-input">
          <option :value="null">Sem foto selecionada</option>
          <option v-for="photo in photos" :key="photo.id" :value="photo.id">
            {{ photo.title || photo.original_filename || photo.id.slice(0, 8) }}
          </option>
        </select>
      </label>
      <p v-else-if="!isBoard && form.book_config.cover.mode !== 'text'" class="text-muted basics-hint">
        Envie fotos na fototeca para escolher a imagem da capa.
      </p>

      <fieldset class="basics-fieldset">
        <legend>Cores</legend>
        <div class="color-row">
          <label class="ml-field">
            <span>{{ isPortrait ? 'Papel do álbum' : isBoard ? 'Fundo do quadro' : 'Papel' }}</span>
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
          <label v-if="!isBoard" class="ml-field">
            <span>Fundo das páginas</span>
            <input
              v-model="form.book_config.colors.page"
              type="color"
              class="basics-color"
            />
          </label>
        </div>
      </fieldset>

      <label v-if="!isBoard" class="ml-field">
        <span>Tipografia</span>
        <select v-model="form.book_config.fonts.preset" class="ml-input">
          <option value="editorial">Editorial (Memory Book)</option>
          <option value="classic">Clássica (serifada)</option>
          <option value="modern">Moderna (sans)</option>
        </select>
      </label>

      <label class="ml-field">
        <span>Mensagem de encerramento (opcional)</span>
        <textarea
          v-model="form.closing_message"
          class="ml-input"
          rows="3"
          placeholder="Se deixar em branco, a contracapa fica sem mensagem."
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
      <h3 class="basics-preview__title">
        {{ isPortrait ? 'Prévia do álbum' : isPolaroid ? 'Prévia do quadro' : 'Prévia da capa' }}
      </h3>
      <p v-if="isPolaroid" class="basics-preview__hint text-muted">
        Arraste as polaroids no quadro para personalizar o layout. As posições são salvas automaticamente.
      </p>
      <BookRenderer
        :book="previewBook"
        mode="preview"
        :editable="isPolaroid"
        @update:board="onBoardLayout"
      />
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
import type { BookBoardItem, CoverMode } from '../book/bookConfig'
import {
  isMuralPresentation,
  isPolaroidBoardPresentation,
  isPortraitAlbumPresentation,
} from '../book/presentations'

const props = defineProps<{
  form: ReturnType<typeof useAlbumWizard>['form']
  album: ReturnType<typeof useAlbumWizard>['album']['value']
  photos: AlbumMedia[]
}>()

const isBoard = computed(() => isMuralPresentation(props.form.presentation))
const isPolaroid = computed(() => isPolaroidBoardPresentation(props.form.presentation))
const isPortrait = computed(() => isPortraitAlbumPresentation(props.form.presentation))

const headerTitle = computed(() => {
  if (isPortrait.value) return 'Identidade do Álbum Retrato'
  if (isPolaroid.value) return 'Identidade do Quadro Polaroid'
  return 'Identidade do Memory Book'
})

const headerDescription = computed(() => {
  if (isPortrait.value) {
    return 'Título e cores do papel. As fotos entram com cantos e borda recortada na fototeca.'
  }
  if (isPolaroid.value) {
    return 'Título e cores do mural. Arraste as fotos na prévia para posicioná-las no quadro.'
  }
  return 'Título, capa, cores e tipografia. Mensagem e assinatura só aparecem na contracapa se você preencher.'
})

const coverModes: Array<{ id: CoverMode; label: string; hint: string }> = [
  { id: 'text', label: 'Só tipografia', hint: 'Capa editorial sem foto' },
  { id: 'photo', label: 'Tipografia + foto', hint: 'Foto ao lado do título' },
  { id: 'full-bleed', label: 'Foto full-bleed', hint: 'Imagem de fundo na capa' },
]

function onBoardLayout(items: BookBoardItem[]) {
  props.form.book_config = {
    ...props.form.book_config,
    board: { items },
  }
}

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

.cover-modes {
  display: grid;
  gap: 10px;
}

.cover-mode {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.92rem;
}

.cover-mode strong {
  display: block;
}

.cover-mode small {
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
  margin: -4px 0 0;
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

.basics-preview__hint {
  margin: 0;
  padding: 10px 16px 0;
  font-size: 0.86rem;
}
</style>
