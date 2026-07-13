<template>
  <div class="view ml-fade-up new-album">
    <div class="ml-card new-album__card">
      <span v-if="creating" class="ml-spinner" />
      <template v-else-if="error">
        <p class="ml-alert ml-alert--danger">{{ error }}</p>
        <RouterLink to="/dashboard/albums" class="ml-btn ml-btn--secondary">Voltar</RouterLink>
      </template>
      <template v-else>
        <p class="text-muted">Preparando seu álbum...</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createAlbum } from '@/api/albums'
import { resolveApiError } from '@/api/errors'

const router = useRouter()
const creating = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const album = await createAlbum()
    await router.replace(`/dashboard/albums/${album.id}/edit`)
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível criar o álbum.')
    creating.value = false
  }
})
</script>

<style scoped>
.new-album {
  display: grid;
  place-items: center;
  min-height: 50vh;
}

.new-album__card {
  padding: 40px;
  text-align: center;
  min-width: 280px;
}
</style>
