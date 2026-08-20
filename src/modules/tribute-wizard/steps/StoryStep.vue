<template>
  <div class="story-step wiz-step-content">
    <WizardStepHeader
      :title="storyTitle"
      :description="storyDescription"
    />

    <section v-if="chapterMode" class="st-guide" aria-label="Progresso da história">
      <div class="st-guide__copy">
        <strong>{{ completeCount }} de {{ form.timeline.length }} capítulos completos</strong>
        <span>Cada capítulo precisa de título e texto ou foto. Data e local são opcionais.</span>
      </div>
      <div class="st-guide__checklist" aria-label="Sugestões de conteúdo">
        <span :class="{ 'st-guide__done': form.timeline.length >= 1 }">✓ Primeiro marco</span>
        <span :class="{ 'st-guide__done': form.timeline.length >= 3 }">✓ Três momentos</span>
        <span :class="{ 'st-guide__done': chaptersWithPhoto > 0 }">✓ Uma foto</span>
      </div>
      <div class="st-suggestions">
        <span>Sugestões rápidas:</span>
        <button
          v-for="suggestion in chapterSuggestions"
          :key="suggestion.title"
          type="button"
          class="st-suggestion"
          @click="addSuggestion(suggestion)"
        >
          + {{ suggestion.title }}
        </button>
      </div>
    </section>

    <div class="wiz-card-stack">
      <section v-if="!form.timeline.length" class="wiz-card">
        <div class="wiz-empty">
          Nenhum momento ainda. Comece adicionando o primeiro capítulo da história.
        </div>
        <button type="button" class="ml-btn ml-btn--secondary st-add" @click="add">
          + Adicionar momento
        </button>
      </section>

      <template v-else>
        <ol class="st-list">
          <li v-for="(moment, index) in form.timeline" :key="index" class="wiz-card st-card ml-fade-up">
            <header class="st-card__head">
              <span class="st-card__index">
                {{ chapterMode ? 'Capítulo' : 'Momento' }} {{ index + 1 }}
                <small :class="{ 'st-card__complete': isComplete(moment) }">
                  {{ isComplete(moment) ? 'Completo' : 'Incompleto' }}
                </small>
              </span>
              <div class="st-card__actions">
                <button class="ml-icon-btn" :disabled="index === 0" title="Mover para cima" @click="move(index, -1)">
                  ↑
                </button>
                <button
                  class="ml-icon-btn"
                  :title="`Duplicar ${chapterMode ? 'capítulo' : 'momento'} ${index + 1}`"
                  :aria-label="`Duplicar ${chapterMode ? 'capítulo' : 'momento'} ${index + 1}`"
                  @click="duplicate(index)"
                >
                  ⧉
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

            <div class="wiz-field-grid">
              <label class="ml-field span-2">
                <span class="ml-label">Título</span>
                <input v-model="moment.title" class="ml-input" maxlength="120" placeholder="Ex.: Nosso primeiro encontro" />
                <span class="st-field-count">{{ moment.title?.length ?? 0 }}/120</span>
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
                  maxlength="1200"
                  placeholder="Conte o que aconteceu..."
                />
                <span class="st-field-count">{{ moment.description?.length ?? 0 }}/1200</span>
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
              <p v-if="chapterMode" class="st-photo-hint">Opcional. Imagens verticais ou horizontais serão cortadas sem deformação.</p>
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
            <p v-else-if="chapterMode" class="st-photo-empty">
              Nenhuma foto enviada. Volte à etapa Fotos para adicionar imagens opcionais aos capítulos.
            </p>
          </li>
        </ol>

        <button type="button" class="ml-btn ml-btn--secondary st-add" @click="add">
          + Adicionar momento
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TributeMedia, TributeTimelineItem } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { STORY_EMOTION_OPTIONS } from '@/modules/tribute-wizard/tributeWizardSteps'
import { getWizardTypeFlowConfig } from '@/modules/tribute-wizard/tributeTypeFlow'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import { timelineItemIsComplete } from '@/utils/timeline'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  photos: TributeMedia[]
  chapterMode?: boolean
}>()

const flow = computed(() => getWizardTypeFlowConfig(props.form.wizard_type_id))
const storyTitle = computed(() => flow.value.storyStepLabel ?? 'Nossa história')
const storyDescription = computed(
  () =>
    flow.value.storyStepDescription ??
    'Adicione momentos importantes da história — cada um com fotos, textos, datas e emoções.',
)

const emotions = STORY_EMOTION_OPTIONS
const chapterSuggestions = [
  { title: 'Como nos conhecemos', description: '' },
  { title: 'Nosso primeiro encontro', description: '' },
  { title: 'Uma viagem inesquecível', description: '' },
  { title: 'Nosso momento favorito', description: '' },
]
const completeCount = computed(() => props.form.timeline.filter(timelineItemIsComplete).length)
const chaptersWithPhoto = computed(() =>
  props.form.timeline.filter((item) => momentHasPhoto(item)).length,
)

function add() {
  props.form.timeline.push({ title: '', description: '', date: '', location: '', emotion: '' })
}

function addSuggestion(suggestion: { title: string; description: string }) {
  props.form.timeline.push({
    title: suggestion.title,
    description: suggestion.description,
    date: '',
    location: '',
    emotion: '',
  })
}

function isComplete(moment: TributeTimelineItem): boolean {
  return timelineItemIsComplete(moment)
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

function duplicate(index: number) {
  const source = props.form.timeline[index]
  props.form.timeline.splice(index + 1, 0, { ...source })
}

function remove(index: number) {
  props.form.timeline.splice(index, 1)
}
</script>

<style scoped>
.st-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.st-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.st-card__index {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.st-card__index small {
  display: inline-flex;
  margin-left: 8px;
  color: var(--warning);
  font-size: 0.65rem;
  letter-spacing: 0;
  text-transform: none;
}
.st-card__index small.st-card__complete { color: var(--success); }
.st-card__actions {
  display: flex;
  gap: 4px;
}
.st-emotions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.st-emotion {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid var(--border-strong);
  background: var(--surface-3);
  font-size: 0.82rem;
  font-weight: 600;
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
}
.st-emotion--active {
  border-color: var(--primary);
  background: var(--primary-softer);
}
.st-photos {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
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
  background: var(--surface-3);
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
.st-add {
  width: 100%;
}
.st-guide {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
}
.st-guide__copy { display: grid; gap: 3px; }
.st-guide__copy span,
.st-photo-hint,
.st-photo-empty { color: var(--muted); font-size: 0.8rem; line-height: 1.45; }
.st-guide__checklist,
.st-suggestions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.st-guide__checklist span { color: var(--muted); font-size: 0.75rem; }
.st-guide__checklist .st-guide__done { color: var(--success); font-weight: 700; }
.st-suggestions > span { width: 100%; font-size: 0.76rem; font-weight: 700; color: var(--ink); }
.st-suggestion {
  padding: 6px 9px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink);
  font-size: 0.72rem;
  cursor: pointer;
}
.st-field-count { align-self: flex-end; color: var(--muted); font-size: 0.68rem; }
.st-photo-hint { margin: 4px 0 0; }
.st-photo-empty { margin: 14px 0 0; padding: 10px 12px; border-radius: 10px; background: var(--surface-2); }
</style>
