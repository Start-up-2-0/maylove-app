<template>
  <div class="basics-step">
    <WizardStepHeader
      title="Informações do álbum"
      description="Título, subtítulo e mensagem de encerramento aparecem na capa e contracapa."
    />

    <form class="basics-form" @submit.prevent="save">
      <label class="ml-field">
        <span>Título</span>
        <input v-model="form.title" class="ml-input" maxlength="200" required />
      </label>
      <label class="ml-field">
        <span>Subtítulo (opcional)</span>
        <input v-model="form.subtitle" class="ml-input" maxlength="200" />
      </label>
      <label class="ml-field">
        <span>Mensagem de encerramento (opcional)</span>
        <textarea v-model="form.closing_message" class="ml-input" rows="4" />
      </label>
      <label class="ml-field">
        <span>Assinatura (opcional)</span>
        <input v-model="form.signature" class="ml-input" maxlength="120" />
      </label>
      <label class="ml-field">
        <span>Cor principal</span>
        <input v-model="form.color_primary" type="color" class="basics-color" />
      </label>
      <label class="ml-check">
        <input v-model="form.is_public" type="checkbox" />
        <span>Álbum público (visível pelo link após publicar)</span>
      </label>

      <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>
      <button class="ml-btn ml-btn--primary" :disabled="saving">
        {{ saving ? 'Salvando...' : 'Salvar informações' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { updateAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{ album: AlbumDetail }>()
const emit = defineEmits<{ saved: [AlbumDetail] }>()

const form = reactive({
  title: '',
  subtitle: '',
  closing_message: '',
  signature: '',
  color_primary: '#c45d7a',
  is_public: true,
})

const saving = ref(false)
const error = ref('')

watch(
  () => props.album,
  (album) => {
    form.title = album.title ?? ''
    form.subtitle = album.subtitle ?? ''
    form.closing_message = album.closing_message ?? ''
    form.signature = album.signature ?? ''
    form.color_primary = album.color_primary ?? '#c45d7a'
    form.is_public = album.is_public
  },
  { immediate: true },
)

async function save() {
  saving.value = true
  error.value = ''
  try {
    const updated = await updateAlbum(props.album.id, { ...form })
    emit('saved', updated)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível salvar.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.basics-form {
  display: grid;
  gap: 16px;
  max-width: 560px;
}

.basics-color {
  width: 56px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.ml-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
}
</style>
