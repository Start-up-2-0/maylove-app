<template>
  <div class="public-page" :class="{ 'public-page--memorial': isMemorial }">
    <section v-if="loading" class="public-state">
      <span class="public-spinner" aria-hidden="true" />
      <p>Carregando álbum...</p>
    </section>

    <section v-else-if="error" class="public-state public-state--error">
      <span class="public-state__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M4 8h16M8 3v5M16 3v5" stroke-linecap="round" />
        </svg>
      </span>
      <h1>Álbum indisponível</h1>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="album && bookModel">
      <button v-if="slideshowPhotos.length" class="slideshow-launch" type="button" @click="openSlideshow" aria-label="Iniciar apresentação de fotos">▶ Apresentação</button>
      <BookRenderer
        :book="bookModel"
        mode="full"
        :share-url="shareUrl"
        :album-slug="album.slug"
      />

      <div v-if="slideshowOpen" class="slideshow" role="dialog" aria-modal="true" aria-label="Apresentação de fotos" @keydown.esc="closeSlideshow" @keydown.left="previousSlide" @keydown.right="nextSlide">
        <button class="slideshow__close" type="button" aria-label="Fechar apresentação" @click="closeSlideshow">×</button>
        <button class="slideshow__nav slideshow__nav--prev" type="button" aria-label="Foto anterior" @click="previousSlide">‹</button>
        <figure class="slideshow__figure">
          <img :src="slideshowPhotos[slideIndex]!.url" :alt="slideshowPhotos[slideIndex]!.title || `Foto ${slideIndex + 1}`" />
          <figcaption v-if="slideshowPhotos[slideIndex]!.title || slideshowPhotos[slideIndex]!.caption">
            <strong>{{ slideshowPhotos[slideIndex]!.title }}</strong>
            <span>{{ slideshowPhotos[slideIndex]!.caption }}</span>
          </figcaption>
        </figure>
        <button class="slideshow__nav slideshow__nav--next" type="button" aria-label="Próxima foto" @click="nextSlide">›</button>
        <button class="slideshow__play" type="button" :aria-pressed="playing" @click="togglePlayback">{{ playing ? 'Pausar' : 'Reproduzir' }} · {{ slideIndex + 1 }}/{{ slideshowPhotos.length }}</button>
      </div>

      <MusicPlayerFloat
        v-if="album.music?.url"
        :url="album.music.url"
        :loop="album.music.loop !== false"
        :autoplay="album.music.autoplay !== false"
        :start-at="album.music.start_seconds ?? 0"
        :end-at="album.music.end_seconds ?? null"
      />

      <footer class="public-foot">
        <RouterLink to="/register" class="public-foot__brand">
          <LogoMark :size="15" variant="mono" class="public-foot__mark" />
          Feito com <strong>MayLov</strong>
        </RouterLink>
        <RouterLink to="/dashboard/albums/new" class="public-foot__cta">Crie seu álbum →</RouterLink>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { fetchPublicAlbum, recordPublicAlbumView } from '@/api/albums'
import type { PublicAlbum } from '@/api/types'
import MusicPlayerFloat from '@/components/experience/shared/MusicPlayerFloat.vue'
import LogoMark from '@/components/brand/LogoMark.vue'
import { buildMemoryBookModelFromDetail } from '@/modules/album/book/buildModel'
import BookRenderer from '@/modules/album/book/BookRenderer.vue'
import { isMemorialPresentation } from '@/modules/album/book/presentations'

const route = useRoute()
const album = ref<PublicAlbum | null>(null)
const loading = ref(true)
const error = ref('')
const slideshowOpen = ref(false)
const slideIndex = ref(0)
const playing = ref(false)
let slideTimer: number | null = null

const bookModel = computed(() => {
  if (!album.value) return null
  return buildMemoryBookModelFromDetail(album.value)
})

const shareUrl = computed(() =>
  typeof window !== 'undefined' ? window.location.href : '',
)

const isMemorial = computed(() => {
  if (!album.value) return false
  const presentation =
    (album.value as { presentation?: string }).presentation ??
    (album.value.content_json as { presentation?: string } | undefined)?.presentation
  return isMemorialPresentation(presentation) || album.value.category === 'memorial'
})

const slideshowPhotos = computed(() =>
  (album.value?.photos ?? []).filter((photo): photo is typeof photo & { url: string } => Boolean(photo.url)),
)

function openSlideshow() {
  slideIndex.value = 0
  slideshowOpen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => document.querySelector<HTMLElement>('.slideshow__close')?.focus())
}

function closeSlideshow() {
  slideshowOpen.value = false
  playing.value = false
  stopTimer()
  document.body.style.overflow = ''
}

function nextSlide() { slideIndex.value = (slideIndex.value + 1) % slideshowPhotos.value.length }
function previousSlide() { slideIndex.value = (slideIndex.value - 1 + slideshowPhotos.value.length) % slideshowPhotos.value.length }
function togglePlayback() {
  playing.value = !playing.value
  if (playing.value) startTimer()
  else stopTimer()
}
function startTimer() {
  stopTimer()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  slideTimer = window.setInterval(nextSlide, 4500)
}
function stopTimer() { if (slideTimer !== null) window.clearInterval(slideTimer); slideTimer = null }

onBeforeUnmount(() => { stopTimer(); document.body.style.overflow = '' })

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    album.value = await fetchPublicAlbum(slug)
    await recordPublicAlbumView(slug, getSessionId())
  } catch {
    error.value = 'Álbum não encontrado ou indisponível no momento.'
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

.public-page--memorial {
  background: #14110f;
}

.public-page--memorial .public-foot {
  background: #1c1814;
  border-top-color: rgba(201, 168, 106, 0.14);
  color: #a89f94;
}

.public-page--memorial .public-foot__brand {
  color: #a89f94;
}

.public-page--memorial .public-foot__cta {
  color: #c9a86a;
}

.slideshow-launch {
  position: fixed;
  z-index: 20;
  right: 18px;
  top: 18px;
  border: 1px solid rgba(255,255,255,.35);
  border-radius: 999px;
  padding: 10px 16px;
  color: #fff;
  background: rgba(20,17,15,.78);
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.slideshow { position: fixed; inset: 0; z-index: 1000; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; background: rgba(8,7,7,.96); color: #fff; }
.slideshow__figure { margin: 0; min-width: 0; display: grid; justify-items: center; gap: 14px; }
.slideshow__figure img { max-width: 100%; max-height: 82vh; object-fit: contain; border-radius: 4px; }
.slideshow__figure figcaption { display: grid; gap: 3px; max-width: 720px; text-align: center; }
.slideshow__figure figcaption span { color: #c9c3bd; }
.slideshow__close, .slideshow__nav, .slideshow__play { border: 0; color: #fff; background: rgba(255,255,255,.1); cursor: pointer; }
.slideshow__close { position: absolute; right: 18px; top: 18px; width: 44px; height: 44px; border-radius: 50%; font-size: 1.8rem; }
.slideshow__nav { margin: 12px; width: 48px; height: 64px; border-radius: 12px; font-size: 2.5rem; }
.slideshow__play { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); padding: 10px 16px; border-radius: 999px; }

@media (max-width: 600px) {
  .slideshow { grid-template-columns: 44px minmax(0, 1fr) 44px; }
  .slideshow__nav { width: 40px; margin: 2px; background: transparent; }
  .slideshow__figure img { max-height: 72vh; }
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

.public-share {
  display: flex;
  justify-content: center;
  padding: clamp(28px, 5vw, 40px) clamp(16px, 4vw, 32px);
  background: color-mix(in srgb, var(--bg, #fff8fb) 92%, #fff);
  border-top: 1px solid color-mix(in srgb, var(--border, #eadfe6) 80%, transparent);
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
