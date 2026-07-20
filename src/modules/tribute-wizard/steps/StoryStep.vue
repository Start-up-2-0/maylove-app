<template>
  <div class="story-step">
    <WizardStepHeader
      title="Nossa história"
      description="Adicione momentos importantes da história — cada um com fotos, textos, datas e emoções."
    />

    <ol v-if="form.timeline.length" class="st-list">
      <li v-for="(moment, index) in form.timeline" :key="index" class="st-card ml-fade-up">
        <header class="st-card__head">
          <span class="st-card__index">Momento {{ index + 1 }}</span>
          <div class="st-card__actions">
            <button class="ml-icon-btn" :disabled="index === 0" title="Mover para cima" @click="move(index, -1)">
              ↑
            </button>
            <button
              class="ml-icon-btn"
              :disabled="index === form.timeline.length - 1"
              title="Mover para baixo"
              @click="move(index, 1)"
            >
              ↓
            </button>
            <button class="ml-icon-btn ml-icon-btn--danger" title="Remover" @click="remove(index)">×</button>
          </div>
        </header>

        <div class="st-grid">
          <label class="ml-field span-2">
            <span class="ml-label">Título</span>
            <input v-model="moment.title" class="ml-input" placeholder="Ex.: Nosso primeiro encontro" />
          </label>
          <label class="ml-field">
            <span class="ml-label">Data</span>
            <input v-model="moment.date" class="ml-input" placeholder="Ex.: Mar 2020" />
          </label>
          <label class="ml-field">
            <span class="ml-label">Local</span>
            <input v-model="moment.location" class="ml-input" placeholder="Ex.: São Paulo" />
          </label>
          <label class="ml-field span-2">
            <span class="ml-label">Texto</span>
            <textarea
              v-model="moment.description"
              class="ml-input ml-textarea"
              rows="3"
              placeholder="Conte o que aconteceu..."
            />
          </label>
          <div class="ml-field span-2">
            <span class="ml-label">Emoção</span>
            <div class="st-emotions">
              <button
                v-for="emotion in emotions"
                :key="emotion.id"
                type="button"
                class="st-emotion"
                :class="{ 'st-emotion--active': moment.emotion === emotion.id }"
                @click="moment.emotion = emotion.id"
              >
                {{ emotion.icon }} {{ emotion.label }}
              </button>
            </div>
          </div>
          <label class="ml-field span-2">
            <span class="ml-label">Link de vídeo (opcional)</span>
            <input v-model="moment.video_url" type="url" class="ml-input" placeholder="https://..." />
          </label>
        </div>

        <div v-if="photos.length" class="st-photos">
          <span class="ml-label">Foto</span>
          <div class="st-photos__picker">
            <button
              type="button"
              class="st-photo"
              :class="{ 'st-photo--active': !momentHasPhoto(moment) }"
              @click="setPhoto(moment, null)"
            >
              Sem foto
            </button>
            <button
              v-for="photo in photos"
              :key="photo.id"
              type="button"
              class="st-photo st-photo--img"
              :class="{ 'st-photo--active': isPhotoSelected(moment, photo) }"
              @click="setPhoto(moment, photo)"
            >
              <img :src="photo.url || photo.url_thumbnail || ''" alt="" loading="lazy" />
            </button>
          </div>
        </div>
      </li>
    </ol>

    <p v-else class="st-empty">Nenhum momento ainda. Comece adicionando o primeiro capítulo da história.</p>

    <button type="button" class="ml-btn ml-btn--secondary st-add" @click="add">
      + Adicionar momento
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TributeMedia, TributeTimelineItem } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { STORY_EMOTION_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  photos: TributeMedia[]
}>()

const emotions = STORY_EMOTION_OPTIONS

function add() {
  props.form.timeline.push({ title: '', description: '', date: '', location: '', emotion: '' })
}

function momentHasPhoto(moment: TributeTimelineItem): boolean {
  return Boolean(moment.photo_media_id || moment.photo_url)
}

function isPhotoSelected(moment: TributeTimelineItem, photo: TributeMedia): boolean {
  return moment.photo_media_id === photo.id
}

function setPhoto(moment: TributeTimelineItem, photo: TributeMedia | null) {
  if (!photo) {
    moment.photo_media_id = undefined
    moment.photo_url = undefined
    return
  }
  moment.photo_media_id = photo.id
  moment.photo_url = photo.url || photo.url_thumbnail || undefined
}

function move(index: number, direction: -1 | 1) {
  const list = props.form.timeline
  const target = index + direction
  if (target < 0 || target >= list.length) return
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item)
}

function remove(index: number) {
  props.form.timeline.splice(index, 1)
}
</script>

<style scoped>
.st-list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.st-card {
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
}
.st-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.st-card__index {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.st-card__actions {
  display: flex;
  gap: 4px;
}
.st-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.span-2 {
  grid-column: span 2;
}
.st-emotions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.st-emotion {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  font-size: 0.82rem;
  font-weight: 600;
}
.st-emotion--active {
  border-color: var(--primary);
  background: var(--primary-softer);
}
.st-photos {
  margin-top: 12px;
}
.st-photos__picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.st-photo {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  font-size: 0.8rem;
}
.st-photo--img {
  padding: 0;
  width: 56px;
  height: 56px;
  overflow: hidden;
}
.st-photo--img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.st-photo--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-ring);
}
.st-empty {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 16px;
}
.st-add {
  width: 100%;
}
@media (max-width: 640px) {
  .st-grid {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: span 1;
  }
}
</style>
