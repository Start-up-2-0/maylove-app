<template>
  <div class="places-step">
    <WizardStepHeader
      title="Locais"
      description="Busque um endereço, clique no mapa ou selecione um pin para montar cada mini-homenagem."
    />

    <section class="narrative-suggestions" aria-labelledby="map-suggestions-title">
      <div>
        <h3 id="map-suggestions-title">Por onde começar?</h3>
        <p>Escolha um marco para preparar o texto. Depois, localize o endereço no mapa e revise antes de salvar.</p>
      </div>
      <div class="narrative-suggestions__list">
        <button
          v-for="suggestion in MAP_NARRATIVE_SUGGESTIONS"
          :key="suggestion.id"
          type="button"
          class="narrative-suggestion"
          @click="applyNarrativeSuggestion(suggestion)"
        >
          <span aria-hidden="true">{{ suggestion.emoji }}</span>
          {{ suggestion.label }}
        </button>
      </div>
    </section>

    <div class="places-layout">
      <div class="places-map">
        <div class="address-search">
          <input
            v-model="addressQuery"
            class="ml-input"
            placeholder="Buscar endereço (ex: Paris, Torre Eiffel)"
            @keydown.enter.prevent="runAddressSearch"
          />
          <button class="ml-btn ml-btn--secondary ml-btn--sm" :disabled="searching" @click="runAddressSearch">
            {{ searching ? '...' : 'Buscar' }}
          </button>
        </div>
        <ul v-if="addressResults.length" class="address-results">
          <li v-for="result in addressResults" :key="result.label">
            <button type="button" @click="pickAddress(result)">{{ result.label }}</button>
          </li>
        </ul>
        <CoupleMapCanvas
          :places="map.places"
          :selected-place-id="selectedPlaceId"
          :center-lat="map.center_lat"
          :center-lng="map.center_lng"
          :zoom="map.default_zoom"
          :show-route="map.show_route"
          editable
          @map-click="onMapClick"
          @select-place="selectPlace"
        />
        <p v-if="pendingCoords" class="coords-hint">
          Novo local em {{ pendingCoords.lat.toFixed(4) }}, {{ pendingCoords.lng.toFixed(4) }}
        </p>
      </div>

      <aside class="places-panel ml-card">
        <template v-if="draft">
          <h3>{{ draft.id ? 'Editar local' : 'Novo local' }}</h3>
          <label class="field">
            <span>Tipo</span>
            <select v-model="draft.place_type" class="ml-input">
              <option v-for="opt in MAP_PLACE_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>Título</span>
            <input v-model="draft.title" class="ml-input" maxlength="120" />
          </label>
          <label class="field">
            <span>Data da memória</span>
            <input v-model="draft.memory_date" type="date" class="ml-input" />
          </label>
          <label class="field">
            <span>Emoção</span>
            <select v-model="draft.sentiment" class="ml-input">
              <option value="">Selecione</option>
              <option v-for="opt in SENTIMENT_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.emoji }} {{ opt.label }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>Endereço</span>
            <input v-model="draft.address_label" class="ml-input" maxlength="255" />
          </label>
          <label class="field">
            <span>Cidade</span>
            <input v-model="draft.city" class="ml-input" maxlength="120" />
          </label>
          <label class="field">
            <span>Descrição / história</span>
            <textarea v-model="draft.description" class="ml-input" rows="3" maxlength="2000" />
          </label>
          <label class="field">
            <span>Carta</span>
            <textarea v-model="draft.letter" class="ml-input" rows="4" maxlength="5000" placeholder="Uma carta íntima sobre este momento..." />
          </label>
          <label class="field">
            <span>Pessoas presentes</span>
            <input v-model="draft.people" class="ml-input" placeholder="Ana, João (separados por vírgula)" />
          </label>
          <label class="field">
            <span>Clima / momento</span>
            <input v-model="draft.weather" class="ml-input" placeholder="Ex: Céu estrelado, 22°C" />
          </label>
          <label class="field">
            <span>Objetos marcantes</span>
            <input v-model="draft.objects" class="ml-input" placeholder="Buquê, ingresso, aliança..." />
          </label>
          <label class="field">
            <span>Música (URL)</span>
            <input v-model="draft.music_url" class="ml-input" placeholder="https://..." />
          </label>
          <label class="field field--checkbox">
            <input v-model="draft.is_highlight" type="checkbox" />
            <span>Destaque principal</span>
          </label>

          <div v-if="draft.id && selectedPlace?.media?.length" class="media-list">
            <p class="media-list__title">Fotos</p>
            <div class="media-grid">
              <figure v-for="item in selectedPlace.media" :key="item.id">
                <img :src="item.url_thumbnail || item.url || ''" alt="" />
                <button type="button" class="media-remove" @click="removeMedia(item.id)">×</button>
              </figure>
            </div>
          </div>

          <label v-if="draft.id" class="field">
            <span>Adicionar foto</span>
            <input type="file" accept="image/*" @change="onPhotoSelected" />
          </label>
          <p v-if="uploading" class="text-muted">Enviando foto...</p>

          <div class="panel-actions">
            <button class="ml-btn ml-btn--primary ml-btn--sm" :disabled="saving" @click="savePlace">
              {{ saving ? 'Salvando...' : 'Salvar local' }}
            </button>
            <button v-if="draft.id" class="ml-btn ml-btn--secondary ml-btn--sm" :disabled="deleting" @click="removePlace">
              Excluir
            </button>
            <button class="ml-btn ml-btn--ghost ml-btn--sm" @click="cancelDraft">Cancelar</button>
          </div>
        </template>

        <template v-else>
          <h3>Seus locais ({{ map.places.length }})</h3>
          <ul v-if="map.places.length" class="place-list">
            <li v-for="place in map.places" :key="place.id">
              <button type="button" @click="editPlace(place.id)">
                <strong>{{ getPlaceEmoji(place) }} {{ place.title }}</strong>
                <span>{{ placeTypeLabel(place.place_type) }}</span>
              </button>
            </li>
          </ul>
          <p v-else class="text-muted">Nenhum local ainda. Clique no mapa para começar.</p>
        </template>

        <p v-if="error" class="ml-alert ml-alert--danger mt-3">{{ error }}</p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  confirmMapMedia,
  createMapPlace,
  deleteMapMedia,
  deleteMapPlace,
  fetchMapUploadPolicy,
  presignMapMedia,
  updateMapPlace,
} from '@/api/maps'
import type { CoupleMapDetail, MapPlaceType } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import { uploadFile } from '@/storage/upload'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'
import CoupleMapCanvas from './CoupleMapCanvas.vue'
import { buildPlaceContentPayload, parsePlaceContent } from '../mapPlaceContent'
import { searchAddress, type GeocodeResult } from '../geocoding'
import { MAP_PLACE_TYPE_LABELS, MAP_PLACE_TYPE_OPTIONS, SENTIMENT_OPTIONS, getPlaceEmoji } from '../mapPlaceTypes'
import { MAP_NARRATIVE_SUGGESTIONS, type MapNarrativeSuggestion } from '../mapNarrativeSuggestions'

const props = defineProps<{ map: CoupleMapDetail }>()
const emit = defineEmits<{ changed: [] }>()

const selectedPlaceId = ref<string | null>(null)
const pendingCoords = ref<{ lat: number; lng: number } | null>(null)
const saving = ref(false)
const deleting = ref(false)
const uploading = ref(false)
const searching = ref(false)
const error = ref('')
const addressQuery = ref('')
const addressResults = ref<GeocodeResult[]>([])

const draft = reactive({
  id: '' as string | null,
  place_type: 'other' as MapPlaceType,
  title: '',
  description: '',
  memory_date: '',
  sentiment: '',
  address_label: '',
  city: '',
  is_highlight: false,
  latitude: 0,
  longitude: 0,
  letter: '',
  people: '',
  weather: '',
  objects: '',
  music_url: '',
})

const selectedPlace = computed(() =>
  props.map.places.find((p) => p.id === selectedPlaceId.value) ?? null,
)

function placeTypeLabel(type: MapPlaceType): string {
  return MAP_PLACE_TYPE_LABELS[type]
}

function applyNarrativeSuggestion(suggestion: MapNarrativeSuggestion) {
  if (draft.id) {
    resetDraft()
  }
  draft.place_type = suggestion.placeType
  draft.title = suggestion.title
  draft.description = suggestion.descriptionPrompt
  error.value = ''
}

function resetDraft() {
  draft.id = null
  draft.place_type = 'other'
  draft.title = ''
  draft.description = ''
  draft.memory_date = ''
  draft.sentiment = ''
  draft.address_label = ''
  draft.city = ''
  draft.is_highlight = false
  draft.latitude = 0
  draft.longitude = 0
  draft.letter = ''
  draft.people = ''
  draft.weather = ''
  draft.objects = ''
  draft.music_url = ''
  pendingCoords.value = null
  selectedPlaceId.value = null
  addressResults.value = []
}

async function runAddressSearch() {
  searching.value = true
  error.value = ''
  try {
    addressResults.value = await searchAddress(addressQuery.value)
  } catch {
    error.value = 'Não foi possível buscar o endereço.'
  } finally {
    searching.value = false
  }
}

function pickAddress(result: GeocodeResult) {
  pendingCoords.value = { lat: result.latitude, lng: result.longitude }
  draft.latitude = result.latitude
  draft.longitude = result.longitude
  draft.address_label = result.label
  draft.city = result.city ?? draft.city
  if (!draft.id) {
    draft.title = result.city || 'Novo local'
  }
  addressResults.value = []
}

function loadDraftFromPlace(place: NonNullable<typeof selectedPlace.value>) {
  const content = parsePlaceContent(place)
  draft.id = place.id
  draft.place_type = place.place_type
  draft.title = place.title
  draft.description = place.description ?? ''
  draft.memory_date = place.memory_date ?? ''
  draft.sentiment = place.sentiment ?? ''
  draft.address_label = place.address_label ?? ''
  draft.city = place.city ?? ''
  draft.is_highlight = place.is_highlight
  draft.latitude = place.latitude
  draft.longitude = place.longitude
  draft.letter = content.letter ?? ''
  draft.people = content.people?.join(', ') ?? ''
  draft.weather = content.weather ?? ''
  draft.objects = content.objects?.join(', ') ?? ''
  draft.music_url = content.music_url ?? ''
}

function onMapClick(lat: number, lng: number) {
  pendingCoords.value = { lat, lng }
  draft.id = null
  draft.place_type = 'other'
  draft.title = 'Novo local'
  draft.description = ''
  draft.memory_date = ''
  draft.is_highlight = false
  draft.latitude = lat
  draft.longitude = lng
  selectedPlaceId.value = null
}

function selectPlace(placeId: string) {
  editPlace(placeId)
}

function editPlace(placeId: string) {
  const place = props.map.places.find((p) => p.id === placeId)
  if (!place) return
  selectedPlaceId.value = placeId
  pendingCoords.value = null
  loadDraftFromPlace(place)
}

function cancelDraft() {
  resetDraft()
  error.value = ''
}

async function savePlace() {
  saving.value = true
  error.value = ''
  try {
    const contentJson = buildPlaceContentPayload({
      letter: draft.letter,
      people: draft.people.split(',').map((p) => p.trim()).filter(Boolean),
      weather: draft.weather,
      objects: draft.objects.split(',').map((o) => o.trim()).filter(Boolean),
      music_url: draft.music_url,
      music_title: null,
      moment_timeline: [],
      custom_emoji: null,
    })
    const payload = {
      place_type: draft.place_type,
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      memory_date: draft.memory_date || null,
      sentiment: draft.sentiment || null,
      address_label: draft.address_label.trim() || null,
      city: draft.city.trim() || null,
      is_highlight: draft.is_highlight,
      latitude: draft.latitude,
      longitude: draft.longitude,
      content_json: contentJson,
    }
    if (draft.id) {
      await updateMapPlace(props.map.id, draft.id, payload)
    } else {
      const created = await createMapPlace(props.map.id, payload)
      selectedPlaceId.value = created.id
      draft.id = created.id
    }
    emit('changed')
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível salvar o local.')
  } finally {
    saving.value = false
  }
}

async function removePlace() {
  if (!draft.id) return
  deleting.value = true
  error.value = ''
  try {
    await deleteMapPlace(props.map.id, draft.id)
    resetDraft()
    emit('changed')
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível excluir o local.')
  } finally {
    deleting.value = false
  }
}

async function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !draft.id) return

  uploading.value = true
  error.value = ''
  try {
    const policy = await fetchMapUploadPolicy()
    if (file.size > policy.photo.max_file_bytes) {
      error.value = 'Arquivo muito grande.'
      return
    }
    const presign = await presignMapMedia(props.map.id, {
      media_type: 'photo',
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      place_id: draft.id,
    })
    await uploadFile(file, presign)
    await confirmMapMedia(props.map.id, presign.media_id)
    emit('changed')
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível enviar a foto.')
  } finally {
    uploading.value = false
  }
}

async function removeMedia(mediaId: string) {
  try {
    await deleteMapMedia(props.map.id, mediaId)
    emit('changed')
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível remover a mídia.')
  }
}
</script>

<style scoped>
.narrative-suggestions {
  display: grid;
  grid-template-columns: minmax(180px, 0.45fr) minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 35%, var(--surface));
}
.narrative-suggestions h3,
.narrative-suggestions p {
  margin: 0;
}
.narrative-suggestions p {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.85rem;
}
.narrative-suggestions__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.narrative-suggestion {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 12px;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
}
.narrative-suggestion:hover,
.narrative-suggestion:focus-visible {
  border-color: var(--primary);
  outline: none;
}
.places-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
  gap: 16px;
  min-height: 480px;
}
.places-map {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 420px;
}
.places-map :deep(.couple-map-canvas) {
  flex: 1;
  min-height: 420px;
}
.coords-hint {
  font-size: 0.85rem;
  color: var(--muted);
}
.places-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}
.field--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}
.place-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.place-list button {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
}
.place-list span {
  display: block;
  font-size: 0.8rem;
  color: var(--muted);
}
.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.media-grid figure {
  position: relative;
  margin: 0;
}
.media-grid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}
.media-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
}
@media (max-width: 900px) {
  .narrative-suggestions {
    grid-template-columns: 1fr;
  }
  .places-layout {
    grid-template-columns: 1fr;
  }
}
.address-search {
  display: flex;
  gap: 8px;
}
.address-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}
.address-results button {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 0.82rem;
}
</style>
