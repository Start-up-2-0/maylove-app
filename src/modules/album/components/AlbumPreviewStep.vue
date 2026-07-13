<template>
  <div class="preview-step">
    <WizardStepHeader
      title="Preview e publicação"
      description="Revise como o álbum ficará antes de compartilhar o link público."
    />

    <div class="preview-frame" :style="{ '--album-accent': album.color_primary || '#c45d7a' }">
      <AlbumLayout :content="layoutContent" mode="preview" />
    </div>

    <div v-if="validation && !validation.valid" class="ml-alert ml-alert--warn mt-4">
      <p v-for="issue in validation.errors" :key="issue.code">{{ issue.message }}</p>
    </div>

    <div class="preview-actions">
      <button class="ml-btn ml-btn--secondary" :disabled="validating" @click="runValidate">
        {{ validating ? 'Validando...' : 'Validar álbum' }}
      </button>
      <button
        class="ml-btn ml-btn--primary"
        :disabled="publishing || album.status === 'published'"
        @click="publish"
      >
        {{ album.status === 'published' ? 'Já publicado' : publishing ? 'Publicando...' : 'Publicar álbum' }}
      </button>
      <a
        v-if="album.status === 'published'"
        :href="`/a/${album.slug}`"
        target="_blank"
        rel="noopener"
        class="ml-btn ml-btn--ghost"
      >
        Abrir página pública
      </a>
    </div>

    <p v-if="error" class="ml-alert ml-alert--danger mt-4">{{ error }}</p>
    <p v-if="success" class="ml-alert ml-alert--success mt-4">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { publishAlbum, validateAlbum } from '@/api/albums'
import type { AlbumDetail, AlbumMedia, AlbumValidation } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import AlbumLayout from '@/components/experience/layouts/AlbumLayout.vue'
import { buildAlbumExperienceContent } from '@/modules/album/albumContent'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  album: AlbumDetail
  photos: AlbumMedia[]
}>()

const emit = defineEmits<{ published: [AlbumDetail] }>()

const validation = ref<AlbumValidation | null>(null)
const validating = ref(false)
const publishing = ref(false)
const error = ref('')
const success = ref('')

const layoutContent = computed(() =>
  buildAlbumExperienceContent({
    title: props.album.title,
    subtitle: props.album.subtitle,
    closingMessage: props.album.closing_message,
    signature: props.album.signature,
    photos: props.photos.map((photo) => ({
      id: photo.id,
      url: photo.url ?? photo.url_thumbnail ?? '',
      sort_order: photo.sort_order,
      title: photo.title,
      caption: photo.caption,
    })),
  }),
)

async function runValidate() {
  validating.value = true
  error.value = ''
  try {
    validation.value = await validateAlbum(props.album.id)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível validar.')
  } finally {
    validating.value = false
  }
}

async function publish() {
  publishing.value = true
  error.value = ''
  success.value = ''
  try {
    const result = await validateAlbum(props.album.id)
    validation.value = result
    if (!result.valid) {
      error.value = 'Corrija os itens pendentes antes de publicar.'
      return
    }
    const updated = await publishAlbum(props.album.id)
    success.value = 'Álbum publicado com sucesso!'
    emit('published', updated)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível publicar.')
  } finally {
    publishing.value = false
  }
}

onMounted(runValidate)
</script>

<style scoped>
.preview-frame {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  background: var(--surface-2);
  overflow: hidden;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
