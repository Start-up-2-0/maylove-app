<template>
  <div class="public-page">
    <section v-if="loading" class="public-state">
      <span class="public-spinner" aria-hidden="true" />
      <p>Carregando livro de memórias...</p>
    </section>

    <section v-else-if="error" class="public-state public-state--error">
      <span class="public-state__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M4 8h16M8 3v5M16 3v5" stroke-linecap="round" />
        </svg>
      </span>
      <h1>Livro indisponível</h1>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="album && bookModel">
      <BookRenderer :book="bookModel" mode="full" :share-url="shareUrl" />

      <audio v-if="album.music?.url" :src="album.music.url" autoplay loop class="public-audio" />

      <footer class="public-foot">
        <RouterLink to="/register" class="public-foot__brand">
          <LogoMark :size="15" variant="mono" class="public-foot__mark" />
          Feito com <strong>MayLov</strong>
        </RouterLink>
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
import LogoMark from '@/components/brand/LogoMark.vue'

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
    photos_per_page: album.value.photos_per_page,
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
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.public-state {
  margin: auto;
  min-height: 100vh;
  text-align: center;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.public-state h1 {
  font-size: 1.6rem;
}
.public-state--error {
  color: var(--text);
}
.public-state__glyph {
  display: grid;
  place-items: center;
  width: 66px;
  height: 66px;
  border-radius: 20px;
  color: var(--primary-strong);
  background: var(--primary-soft);
}
.public-spinner {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 3px solid color-mix(in srgb, var(--primary) 25%, transparent);
  border-top-color: var(--primary);
  animation: public-spin 0.85s linear infinite;
}
@keyframes public-spin {
  to {
    transform: rotate(360deg);
  }
}

.public-audio {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.public-foot {
  width: 100%;
  padding: 26px clamp(20px, 5vw, 48px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--primary-softer);
  border-top: 1px solid color-mix(in srgb, var(--primary) 12%, var(--border));
}
.public-foot__brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 0.9rem;
}
.public-foot__brand strong {
  color: inherit;
  font-weight: 700;
}
.public-foot__mark {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  color: #fff;
  background: var(--primary);
  padding: 5px;
}
.public-foot__cta {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e11d7a;
  transition: opacity 0.2s ease;
}
.public-foot__cta:hover {
  opacity: 0.75;
}

@media (max-width: 640px) {
  .public-foot {
    padding: 18px 16px;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 10px;
  }

  .public-foot__brand {
    justify-content: center;
  }

  .public-foot__cta {
    display: block;
    text-align: center;
    padding: 10px 0;
  }
}
</style>
