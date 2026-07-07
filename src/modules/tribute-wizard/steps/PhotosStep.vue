<template>
  <div class="photos-step">
    <WizardStepHeader
      title="Fotos da homenagem"
      :description="`Envie pelo menos uma foto. Máximo de ${maxPhotos} neste template.`"
    />

    <div v-if="photos.length" class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
      <FwbCard
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="overflow-hidden"
        img-alt=""
        :img-src="photo.url || photo.url_thumbnail || ''"
      >
        <div class="p-3 flex items-center justify-between gap-2 text-sm">
          <span class="text-gray-500">#{{ index + 1 }}</span>
          <div class="flex gap-1">
            <FwbButton color="alternative" size="xs" :disabled="index === 0" @click="move(index, -1)">
              ↑
            </FwbButton>
            <FwbButton
              color="alternative"
              size="xs"
              :disabled="index === photos.length - 1"
              @click="move(index, 1)"
            >
              ↓
            </FwbButton>
            <FwbButton color="red" size="xs" outline @click="remove(photo.id)">
              Remover
            </FwbButton>
          </div>
        </div>
      </FwbCard>
    </div>

    <label
      class="flex flex-col items-center justify-center min-h-[140px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center cursor-pointer transition-colors hover:border-pink-400"
      :class="{ 'opacity-60 cursor-not-allowed': photos.length >= maxPhotos || uploading }"
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="hidden"
        :disabled="photos.length >= maxPhotos || uploading"
        @change="onFilesSelected"
      />
      <FwbSpinner v-if="uploading" size="6" class="mb-2" />
      <span v-if="uploading" class="text-gray-500">Enviando {{ uploadLabel }}...</span>
      <span v-else class="text-gray-500">Clique para adicionar fotos (JPEG, PNG, WebP)</span>
    </label>

    <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FwbButton, FwbCard, FwbSpinner } from 'flowbite-vue'
import { confirmMedia, deleteMedia, presignMedia, reorderMedia } from '@/api/tributes'
import type { TributeMedia } from '@/api/types'
import { uploadFile } from '@/storage/upload'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  tributeId: string
  photos: TributeMedia[]
  maxPhotos: number
}>()

const emit = defineEmits<{ changed: [] }>()

const uploading = ref(false)
const uploadLabel = ref('')
const error = ref('')

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return

  uploading.value = true
  error.value = ''

  try {
    for (const file of files) {
      if (props.photos.length >= props.maxPhotos) break
      uploadLabel.value = file.name
      const presign = await presignMedia(props.tributeId, {
        media_type: 'photo',
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      })
      await uploadFile(file, presign)
      await confirmMedia(props.tributeId, presign.media_id)
      emit('changed')
    }
  } catch {
    error.value = 'Falha no upload. Verifique tamanho (máx. 10 MB) e formato.'
  } finally {
    uploading.value = false
    uploadLabel.value = ''
  }
}

async function remove(mediaId: string) {
  try {
    await deleteMedia(props.tributeId, mediaId)
    emit('changed')
  } catch {
    error.value = 'Não foi possível remover a foto.'
  }
}

async function move(index: number, direction: -1 | 1) {
  const order = props.photos.map((photo) => photo.id)
  const target = index + direction
  if (target < 0 || target >= order.length) return
  ;[order[index], order[target]] = [order[target], order[index]]
  try {
    await reorderMedia(props.tributeId, order)
    emit('changed')
  } catch {
    error.value = 'Não foi possível reordenar as fotos.'
  }
}
</script>
