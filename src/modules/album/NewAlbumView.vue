<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard/albums" class="back-link">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Voltar aos álbuns
    </RouterLink>

    <header class="new-head">
      <p class="eyebrow">Começar</p>
      <h1 class="section-title">Novo álbum</h1>
      <p class="text-muted">
        Escolha a ocasião. Cada modelo começa com uma identidade e uma narrativa adequadas, que você pode personalizar.
      </p>
    </header>

    <div class="model-grid">
      <button
        v-for="model in ALBUM_MODELS"
        :key="model.id"
        type="button"
        class="style-card"
        :class="{ 'style-card--active': selectedModelId === model.id }"
        @click="selectedModelId = model.id"
      >
        <span class="style-card__emoji" aria-hidden="true">{{ model.emoji }}</span>
        <div>
          <h2 class="style-card__title">{{ model.name }}</h2>
          <p class="style-card__tagline">{{ model.tagline }}</p>
          <p class="style-card__desc">{{ model.description }}</p>
        </div>
      </button>
    </div>

    <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>

    <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating" @click="create">
      <span v-if="creating" class="ml-spinner ml-spinner--sm" />
      {{ creating ? 'Criando álbum...' : createLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createAlbum, createAlbumChapter, updateAlbum } from '@/api/albums'
import { resolveApiError } from '@/api/errors'
import { ALBUM_MODELS, getAlbumModel } from './albumModels'
import { defaultBookConfigFor } from './book/bookConfig'

const router = useRouter()
const creating = ref(false)
const error = ref('')
const selectedModelId = ref(ALBUM_MODELS[0]?.id ?? 'gallery')

const selectedModel = computed(() => getAlbumModel(selectedModelId.value) ?? ALBUM_MODELS[0]!)

const createLabel = computed(() =>
  selectedModel.value.id === 'memorial' ? 'Criar memorial' : `Criar ${selectedModel.value.name.toLowerCase()}`,
)

async function create() {
  const model = selectedModel.value
  creating.value = true
  error.value = ''
  try {
    const album = await createAlbum()
    await updateAlbum(album.id, {
      category: model.category,
      title: model.defaultTitle,
      presentation: model.presentation,
      book_config: defaultBookConfigFor(model.presentation),
      content_json: { presentation: model.presentation, effects: model.id === 'memorial' ? ['stars'] : [] },
    })

    if (model.seedChapters?.length) {
      await Promise.all(
        model.seedChapters.map((title, index) =>
          createAlbumChapter(album.id, { title, sort_order: index }),
        ),
      )
    }

    await router.replace({
      path: `/dashboard/albums/${album.id}/edit`,
      query: { step: 'basics' },
    })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível criar o álbum.')
    creating.value = false
  }
}
</script>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 16px;
  transition: color var(--dur) var(--ease);
}
.back-link:hover {
  color: var(--primary-strong);
}

.new-head {
  margin-bottom: 22px;
}

.model-grid {
  display: grid;
  gap: 14px;
  max-width: 640px;
  margin-bottom: 20px;
}

.style-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  padding: 18px 20px;
  text-align: left;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.style-card:hover {
  border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
}

.style-card--active {
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 55%, #fff);
  box-shadow: 0 8px 24px -16px color-mix(in srgb, var(--primary) 30%, transparent);
}

.style-card__emoji {
  font-size: 1.6rem;
  line-height: 1;
}

.style-card__title {
  margin: 0 0 2px;
  font-size: 1.1rem;
}

.style-card__tagline {
  margin: 0 0 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary-strong, var(--primary));
}

.style-card__desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}
</style>
