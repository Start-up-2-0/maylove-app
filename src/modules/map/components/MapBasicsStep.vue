<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Informações do mapa"
      description="Defina título, nomes do casal e estilo visual."
    />
    <div class="form-grid">
      <label class="field">
        <span>Título</span>
        <input v-model="local.title" class="ml-input" maxlength="120" />
      </label>
      <label class="field">
        <span>Nomes do casal</span>
        <input v-model="local.couple_names" class="ml-input" maxlength="120" placeholder="Ana & João" />
      </label>
      <label class="field field--full">
        <span>Subtítulo</span>
        <input v-model="local.subtitle" class="ml-input" maxlength="200" />
      </label>
      <label class="field">
        <span>Estilo</span>
        <select v-model="local.map_style" class="ml-input">
          <option value="default">Padrão</option>
          <option value="romantic">Romântico</option>
          <option value="minimal">Minimal</option>
          <option value="vintage">Vintage</option>
        </select>
      </label>
      <label class="field field--checkbox">
        <input v-model="local.show_route" type="checkbox" />
        <span>Mostrar rota entre os locais</span>
      </label>
    </div>
    <button class="ml-btn ml-btn--primary" :disabled="saving" @click="save">
      <span v-if="saving" class="ml-spinner ml-spinner--sm" />
      Salvar
    </button>
    <p v-if="message" class="ml-alert ml-alert--success mt-3">{{ message }}</p>
    <p v-if="error" class="ml-alert ml-alert--danger mt-3">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { updateMap } from '@/api/maps'
import type { CoupleMapDetail, MapStyle } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{ map: CoupleMapDetail }>()
const emit = defineEmits<{ saved: [map: CoupleMapDetail] }>()

const local = reactive({
  title: '',
  couple_names: '',
  subtitle: '',
  map_style: 'default' as MapStyle,
  show_route: false,
})

const saving = ref(false)
const error = ref('')
const message = ref('')

watch(
  () => props.map,
  (map) => {
    local.title = map.title
    local.couple_names = map.couple_names
    local.subtitle = map.subtitle ?? ''
    local.map_style = map.map_style
    local.show_route = map.show_route
  },
  { immediate: true },
)

async function save() {
  saving.value = true
  error.value = ''
  message.value = ''
  try {
    const updated = await updateMap(props.map.id, {
      title: local.title.trim(),
      couple_names: local.couple_names.trim(),
      subtitle: local.subtitle.trim() || null,
      map_style: local.map_style,
      show_route: local.show_route,
    })
    emit('saved', updated)
    message.value = 'Informações salvas.'
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível salvar.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
}
.field--full {
  grid-column: 1 / -1;
}
.field--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
