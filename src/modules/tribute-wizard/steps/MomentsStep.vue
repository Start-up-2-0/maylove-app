<template>
  <div class="moments-step">
    <WizardStepHeader
      :title="copy.title"
      :description="copy.description"
    />

    <div class="mo-context">
      <span class="mo-context__emoji" aria-hidden="true">{{ schema.presentationEmoji }}</span>
      <span class="mo-context__text">{{ copy.hint }}</span>
    </div>

    <div v-if="photos.length < maxPhotos" class="mo-upload">
      <p class="mo-upload__hint">
        {{
          photos.length
            ? `Você tem ${photos.length} foto(s). Envie mais para montar as cenas.`
            : 'Envie as fotos da apresentação. Depois associe cada uma às cenas abaixo.'
        }}
      </p>
      <label class="ml-dropzone" :class="{ 'ml-dropzone--disabled': uploading }">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="hidden"
          :disabled="uploading"
          @change="onFilesSelected"
        />
        <span v-if="uploading" class="ml-spinner" />
        <span v-else class="ml-dropzone__glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 16V4M8 8l4-4 4 4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke-linecap="round" />
          </svg>
        </span>
        <span v-if="uploading">Enviando {{ uploadLabel }}...</span>
        <template v-else>
          <span class="ml-dropzone__title">Clique para adicionar fotos</span>
          <span class="ml-dropzone__hint">JPEG, PNG ou WebP · até {{ maxPhotos }} fotos</span>
        </template>
      </label>
      <p v-if="uploadError" class="ml-alert ml-alert--danger mt-3">{{ uploadError }}</p>
    </div>

    <ol v-if="form.timeline.length" class="mo-list">
      <li v-for="(moment, index) in form.timeline" :key="index" class="mo-card">
        <header class="mo-card__head">
          <span class="mo-card__index">{{ copy.itemNoun }} {{ index + 1 }}</span>
          <div class="mo-card__actions">
            <button class="ml-icon-btn" :disabled="index === 0" title="Mover para cima" @click="move(index, -1)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M6 11l6-6 6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              class="ml-icon-btn"
              :disabled="index === form.timeline.length - 1"
              title="Mover para baixo"
              @click="move(index, 1)"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button class="ml-icon-btn ml-icon-btn--danger" title="Remover" @click="remove(index)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </header>

        <div class="mo-card__grid">
          <label class="ml-field">
            <span class="ml-field__label">{{ copy.titleFieldLabel }}</span>
            <input v-model="moment.title" type="text" class="ml-input" :placeholder="copy.titlePlaceholder" />
          </label>
          <label v-if="copy.showDate" class="ml-field">
            <span class="ml-field__label">Data (opcional)</span>
            <input v-model="moment.date" type="text" class="ml-input" placeholder="Ex.: Jun 2021" />
          </label>
        </div>

        <label class="ml-field">
          <span class="ml-field__label">{{ copy.textFieldLabel }}</span>
          <textarea
            v-model="moment.description"
            class="ml-input ml-textarea"
            rows="3"
            :placeholder="copy.textPlaceholder"
          />
        </label>

        <div class="mo-photo">
          <span class="ml-field__label">Foto {{ copy.photoRequired ? '' : '(opcional)' }}</span>
          <div v-if="photos.length" class="mo-photo__picker">
            <button
              type="button"
              class="mo-photo__thumb mo-photo__thumb--none"
              :class="{ 'mo-photo__thumb--active': !momentHasPhoto(moment) }"
              title="Sem foto"
              @click="setPhoto(moment, null)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
            <button
              v-for="photo in photos"
              :key="photo.id"
              type="button"
              class="mo-photo__thumb"
              :class="{ 'mo-photo__thumb--active': isPhotoSelected(moment, photo) }"
              @click="setPhoto(moment, photo)"
            >
              <img :src="photoUrl(photo)" alt="" loading="lazy" />
            </button>
          </div>
          <p v-else class="mo-photo__empty">
            Nenhuma foto enviada ainda. Use o envio acima ou volte à etapa <strong>Fotos</strong>.
          </p>
        </div>
      </li>
    </ol>

    <p v-else class="mo-empty">
      Nenhum {{ copy.itemNounLower }} ainda. Adicione o primeiro para montar sua {{ copy.experienceNoun }}.
    </p>

    <button class="ml-btn ml-btn--secondary mo-add" @click="add">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14" stroke-linecap="round" />
      </svg>
      Adicionar {{ copy.itemNounLower }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { confirmMedia, presignMedia } from '@/api/tributes'
import type { TributeMedia, TributeTimelineItem } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { uploadFile } from '@/storage/upload'
import { inferImageMimeType } from '@/storage/mime'
import { resolvePresentationSchema } from '@/templates/presentationSchema'
import type { ExperienceLayout, TemplateDefinition } from '@/templates/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  tributeId: string
  photos: TributeMedia[]
  maxPhotos: number
  form: ReturnType<typeof useTributeWizard>['form']
  definition: TemplateDefinition
}>()

const emit = defineEmits<{ changed: [] }>()

const uploading = ref(false)
const uploadLabel = ref('')
const uploadError = ref('')

const schema = computed(() => resolvePresentationSchema(props.form.presentation, props.definition))

interface MomentCopy {
  title: string
  description: string
  hint: string
  itemNoun: string
  itemNounLower: string
  itemNounPlural: string
  experienceNoun: string
  titleFieldLabel: string
  titlePlaceholder: string
  textFieldLabel: string
  textPlaceholder: string
  showDate: boolean
  photoRequired: boolean
}

const COPY_BY_LAYOUT: Partial<Record<ExperienceLayout, MomentCopy>> = {
  envelope: {
    title: 'Trechos da carta',
    description: 'Cada trecho é digitado na carta, com uma foto aparecendo em seguida.',
    hint: 'Monte a sequência da carta: texto e foto para cada trecho, na ordem em que devem aparecer.',
    itemNoun: 'Trecho',
    itemNounLower: 'trecho',
    itemNounPlural: 'trechos',
    experienceNoun: 'carta',
    titleFieldLabel: 'Título (opcional)',
    titlePlaceholder: 'Ex.: Lembro bem desse dia',
    textFieldLabel: 'Texto do trecho',
    textPlaceholder: 'O que será digitado antes da foto...',
    showDate: false,
    photoRequired: false,
  },
  timeline: {
    title: 'Marcos da linha do tempo',
    description: 'Cada marco vira um ponto na linha do tempo, na ordem definida aqui.',
    hint: 'Adicione datas importantes com uma foto e uma mensagem para cada momento.',
    itemNoun: 'Marco',
    itemNounLower: 'marco',
    itemNounPlural: 'marcos',
    experienceNoun: 'linha do tempo',
    titleFieldLabel: 'Título do marco',
    titlePlaceholder: 'Ex.: Primeiro encontro',
    textFieldLabel: 'Descrição',
    textPlaceholder: 'O que aconteceu neste momento...',
    showDate: true,
    photoRequired: false,
  },
  album: {
    title: 'Páginas do álbum',
    description: 'Cada página combina uma foto e uma mensagem, folheadas em sequência.',
    hint: 'Monte as páginas: escolha a foto e escreva a mensagem de cada uma.',
    itemNoun: 'Página',
    itemNounLower: 'página',
    itemNounPlural: 'páginas',
    experienceNoun: 'álbum',
    titleFieldLabel: 'Título da página',
    titlePlaceholder: 'Ex.: Nossa viagem',
    textFieldLabel: 'Mensagem da página',
    textPlaceholder: 'Uma memória para esta página...',
    showDate: false,
    photoRequired: true,
  },
  storytelling: {
    title: 'Capítulos da história',
    description: 'Cada capítulo é uma seção em tela cheia, revelada conforme a navegação.',
    hint: 'Conte a história em capítulos: uma foto e um trecho de texto por vez.',
    itemNoun: 'Capítulo',
    itemNounLower: 'capítulo',
    itemNounPlural: 'capítulos',
    experienceNoun: 'narrativa',
    titleFieldLabel: 'Título do capítulo',
    titlePlaceholder: 'Ex.: Como tudo começou',
    textFieldLabel: 'Texto do capítulo',
    textPlaceholder: 'Continue a narrativa...',
    showDate: false,
    photoRequired: false,
  },
  cinematic: {
    title: 'Cenas da apresentação',
    description: 'Cada cena aparece em tela cheia, como os quadros de um trailer.',
    hint: 'Defina as cenas: foto em destaque e a legenda que aparece sobre ela.',
    itemNoun: 'Cena',
    itemNounLower: 'cena',
    itemNounPlural: 'cenas',
    experienceNoun: 'apresentação',
    titleFieldLabel: 'Legenda principal',
    titlePlaceholder: 'Ex.: Para sempre',
    textFieldLabel: 'Legenda secundária',
    textPlaceholder: 'Um complemento para a cena...',
    showDate: false,
    photoRequired: true,
  },
  proposal: {
    title: 'Passos até a pergunta',
    description: 'Cada passo aproxima o visitante do grande momento da pergunta.',
    hint: 'Monte a sequência que leva ao pedido: uma foto e um texto por passo.',
    itemNoun: 'Passo',
    itemNounLower: 'passo',
    itemNounPlural: 'passos',
    experienceNoun: 'história',
    titleFieldLabel: 'Título do passo',
    titlePlaceholder: 'Ex.: Você lembra?',
    textFieldLabel: 'Texto do passo',
    textPlaceholder: 'O que dizer neste passo...',
    showDate: false,
    photoRequired: false,
  },
}

const copy = computed<MomentCopy>(() => COPY_BY_LAYOUT[schema.value.layout] ?? COPY_BY_LAYOUT.timeline!)

function photoUrl(photo: TributeMedia): string {
  return photo.url || photo.url_thumbnail || ''
}

function momentHasPhoto(moment: TributeTimelineItem): boolean {
  return Boolean(moment.photo_media_id || moment.photo_url)
}

function isPhotoSelected(moment: TributeTimelineItem, photo: TributeMedia): boolean {
  if (moment.photo_media_id) return moment.photo_media_id === photo.id
  const url = photoUrl(photo)
  return Boolean(url && moment.photo_url === url)
}

function setPhoto(moment: TributeTimelineItem, photo: TributeMedia | null) {
  if (!photo) {
    moment.photo_media_id = undefined
    moment.photo_url = undefined
    return
  }
  moment.photo_media_id = photo.id
  moment.photo_url = photoUrl(photo) || undefined
}

function add() {
  props.form.timeline.push({ title: '', date: '', description: '' })
}

function remove(index: number) {
  props.form.timeline.splice(index, 1)
}

function move(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= props.form.timeline.length) return
  const list = props.form.timeline
  ;[list[index], list[target]] = [list[target], list[index]]
}

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return

  uploading.value = true
  uploadError.value = ''

  try {
    for (const file of files) {
      if (props.photos.length >= props.maxPhotos) break
      const mimeType = inferImageMimeType(file)
      if (!mimeType) {
        throw new Error('Formato não suportado. Use JPEG, PNG ou WebP.')
      }

      uploadLabel.value = file.name
      const presign = await presignMedia(props.tributeId, {
        media_type: 'photo',
        filename: file.name,
        mime_type: mimeType,
        size_bytes: file.size,
      })
      await uploadFile(file, presign)
      await confirmMedia(props.tributeId, presign.media_id)
      emit('changed')
    }
  } catch (err) {
    uploadError.value = resolveApiError(
      err,
      'Falha no upload. Verifique tamanho (máx. 50 MB) e formato (JPEG, PNG ou WebP).',
    )
  } finally {
    uploading.value = false
    uploadLabel.value = ''
  }
}
</script>

<style scoped>
.mo-upload {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-strong);
  background: var(--surface-3);
}
.mo-upload__hint {
  margin: 0 0 12px;
  font-size: 0.88rem;
  color: var(--muted);
}
.mo-upload .ml-dropzone__title {
  font-weight: 600;
}
.mo-upload .ml-dropzone__hint {
  font-size: 0.82rem;
  color: var(--subtle);
}
.hidden {
  display: none;
}
.mt-3 {
  margin-top: 12px;
}

.mo-context {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 20px;
  border-radius: var(--radius-md);
  background: var(--surface-3);
  border: 1px solid var(--border);
}
.mo-context__emoji {
  font-size: 1.2rem;
  line-height: 1;
}
.mo-context__text {
  font-size: 0.9rem;
  color: var(--text);
}

.mo-list {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mo-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mo-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mo-card__index {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.mo-card__actions {
  display: flex;
  gap: 5px;
}
.mo-card__grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}
@media (max-width: 560px) {
  .mo-card__grid {
    grid-template-columns: 1fr;
  }
}

.mo-photo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mo-photo__picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mo-photo__thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 2px solid var(--border);
  background: var(--surface-3);
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: border-color var(--dur) var(--ease);
}
.mo-photo__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mo-photo__thumb--active {
  border-color: var(--primary);
}
.mo-photo__empty,
.mo-empty {
  font-size: 0.88rem;
  color: var(--muted);
  margin: 0;
}
.mo-empty {
  padding: 18px 0;
}
.mo-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ml-textarea {
  resize: vertical;
}
</style>
