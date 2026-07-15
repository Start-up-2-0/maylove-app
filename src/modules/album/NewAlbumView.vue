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
        Photobook editorial página a página — diagramação profissional com fotos, legendas e texto narrativo.
      </p>
    </header>

    <article class="style-card style-card--active">
      <span class="style-card__emoji" aria-hidden="true">📖</span>
      <div>
        <h2 class="style-card__title">Memory Book</h2>
        <p class="style-card__desc">
          Como um álbum de estúdio: capa, páginas com layouts editoriais e contracapa.
        </p>
      </div>
    </article>

    <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>

    <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating" @click="create">
      <span v-if="creating" class="ml-spinner ml-spinner--sm" />
      {{ creating ? 'Criando álbum...' : 'Criar álbum' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createAlbum, updateAlbum } from '@/api/albums'
import { resolveApiError } from '@/api/errors'
import { defaultBookConfigFor } from './book/bookConfig'
import { DEFAULT_BOOK_PRESENTATION } from './book/presentations'

const router = useRouter()
const creating = ref(false)
const error = ref('')

async function create() {
  creating.value = true
  error.value = ''
  try {
    const album = await createAlbum()
    await updateAlbum(album.id, {
      presentation: DEFAULT_BOOK_PRESENTATION,
      book_config: defaultBookConfigFor(DEFAULT_BOOK_PRESENTATION),
    })
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

.style-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
  max-width: 520px;
  margin-bottom: 20px;
  padding: 18px 20px;
  text-align: left;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--primary) 40%, var(--border));
  background: color-mix(in srgb, var(--primary-soft, #fce7f0) 55%, #fff);
}

.style-card__emoji {
  font-size: 1.6rem;
  line-height: 1;
}

.style-card__title {
  margin: 0 0 4px;
  font-size: 1.1rem;
}

.style-card__desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}
</style>
