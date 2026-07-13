<template>
  <div class="album-editor ml-fade-up">
    <header class="editor-head">
      <div>
        <RouterLink to="/dashboard/albums" class="editor-back">← Álbuns</RouterLink>
        <h1 class="section-title">{{ album?.title || 'Editar álbum' }}</h1>
        <p class="text-muted">Monte seu livro digital de memórias com fotos, textos e música de fundo.</p>
      </div>
      <span class="ml-chip" :class="{ 'ml-chip--active': album?.status === 'published' }">
        {{ album?.status === 'published' ? 'Publicado' : 'Rascunho' }}
      </span>
    </header>

    <nav class="editor-steps" aria-label="Etapas do álbum">
      <button
        v-for="step in steps"
        :key="step.id"
        class="editor-step"
        :class="{ 'editor-step--active': activeStep === step.id }"
        @click="activeStep = step.id"
      >
        {{ step.label }}
      </button>
    </nav>

    <section v-if="loading" class="ml-card editor-panel">
      <span class="ml-spinner" />
    </section>

    <section v-else-if="error" class="ml-card editor-panel state--error">
      <p>{{ error }}</p>
      <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="load">Tentar novamente</button>
    </section>

    <section v-else-if="album" class="ml-card editor-panel">
      <AlbumPresentationStep
        v-if="activeStep === 'presentation'"
        :album="album"
        @saved="onSaved"
      />
      <AlbumBasicsStep
        v-else-if="activeStep === 'basics'"
        :album="album"
        @saved="onSaved"
      />
      <AlbumPhotosStep
        v-else-if="activeStep === 'photos'"
        :album-id="album.id"
        :photos="photos"
        @changed="load"
      />
      <AlbumMusicStep
        v-else-if="activeStep === 'music'"
        :album-id="album.id"
        :audio="audio"
        @changed="load"
      />
      <AlbumPreviewStep
        v-else
        :album="album"
        @published="onPublished"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { resolveApiError } from '@/api/errors'
import AlbumPresentationStep from './components/AlbumPresentationStep.vue'
import AlbumBasicsStep from './components/AlbumBasicsStep.vue'
import AlbumPhotosStep from './components/AlbumPhotosStep.vue'
import AlbumMusicStep from './components/AlbumMusicStep.vue'
import AlbumPreviewStep from './components/AlbumPreviewStep.vue'

const route = useRoute()
const album = ref<AlbumDetail | null>(null)
const loading = ref(true)
const error = ref('')
const activeStep = ref<'presentation' | 'basics' | 'photos' | 'music' | 'preview'>('presentation')

const steps = [
  { id: 'presentation' as const, label: 'Estilo do livro' },
  { id: 'basics' as const, label: 'Informações' },
  { id: 'photos' as const, label: 'Fotos' },
  { id: 'music' as const, label: 'Música' },
  { id: 'preview' as const, label: 'Preview' },
]

const photos = computed(() =>
  (album.value?.media ?? []).filter((m) => m.media_type === 'photo'),
)

const audio = computed(() =>
  (album.value?.media ?? []).find((m) => m.media_type === 'audio') ?? null,
)

async function load() {
  const id = route.params.id as string
  loading.value = true
  error.value = ''
  try {
    album.value = await fetchAlbum(id)
  } catch (err) {
    error.value = resolveApiError(err, 'Álbum não encontrado.')
  } finally {
    loading.value = false
  }
}

function onSaved(updated: AlbumDetail) {
  album.value = updated
}

function onPublished(updated: AlbumDetail) {
  album.value = updated
}

onMounted(load)
</script>

<style scoped>
.editor-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.editor-back {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.editor-steps {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.editor-step {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.9rem;
  cursor: pointer;
}

.editor-step--active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.editor-panel {
  padding: 24px;
  min-height: 320px;
}
</style>
