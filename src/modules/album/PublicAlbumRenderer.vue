<template>
  <div class="public-page">
    <section v-if="loading" class="public-state">
      <span class="public-spinner" aria-hidden="true" />
      <p>Carregando livro de memórias...</p>
    </section>

    <section v-else-if="error" class="public-state public-state--error">
      <h1>Livro indisponível</h1>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="album && bookModel">
      <BookRenderer :book="bookModel" mode="full" :share-url="shareUrl" />

      <audio v-if="album.music?.url" :src="album.music.url" autoplay loop class="public-audio" />

      <footer class="public-foot">
        <RouterLink to="/register" class="public-foot__brand">Feito com <strong>MayLov</strong></RouterLink>
        <RouterLink to="/dashboard/albums/new" class="public-foot__cta">Crie seu livro →</RouterLink>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { fetchPublicAlbum, recordPublicAlbumView } from '@/api/albums'
import type { PublicAlbum } from '@/api/types'
import { buildMemoryBookModel } from '@/modules/album/book/buildModel'
import BookRenderer from '@/modules/album/book/BookRenderer.vue'

const route = useRoute()
const album = ref<PublicAlbum | null>(null)
const loading = ref(true)
const error = ref('')

const bookModel = computed(() => {
  if (!album.value) return null
  return buildMemoryBookModel({
    title: album.value.title,
    subtitle: album.value.subtitle,
    closing_message: album.value.closing_message,
    signature: album.value.signature,
    color_primary: album.value.color_primary,
    presentation: album.value.presentation,
    photos: album.value.photos.map((photo) => ({
      id: photo.id,
      url: photo.url ?? '',
      sort_order: photo.sort_order,
      title: photo.title,
      caption: photo.caption,
      memory_date: photo.memory_date,
    })),
  })
})

const shareUrl = computed(() =>
  typeof window !== 'undefined' ? window.location.href : '',
)

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    album.value = await fetchPublicAlbum(slug)
    await recordPublicAlbumView(slug, getSessionId())
  } catch {
    error.value = 'Livro não encontrado ou indisponível no momento.'
  } finally {
    loading.value = false
  }
})

function getSessionId(): string {
  const key = 'maylove_album_view_session'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const created = crypto.randomUUID()
  localStorage.setItem(key, created)
  return created
}
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  background: var(--bg);
}

.public-state {
  min-height: 60vh;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 12px;
}

.public-audio {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.public-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 40px;
  border-top: 1px solid var(--border);
}

.public-foot__cta {
  color: var(--accent);
}
</style>
