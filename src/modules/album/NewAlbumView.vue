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
      <p class="text-muted">Escolha o formato do seu livro digital de memórias.</p>
    </header>

    <div class="style-grid">
      <button
        v-for="item in BOOK_PRESENTATIONS"
        :key="item.id"
        type="button"
        class="style-card"
        :class="{ 'style-card--active': selected === item.id }"
        @click="selected = item.id"
      >
        <span class="style-card__emoji" aria-hidden="true">{{ item.emoji }}</span>
        <div>
          <h2 class="style-card__title">{{ item.name }}</h2>
          <p class="style-card__desc">{{ item.description }}</p>
        </div>
      </button>
    </div>

    <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>

    <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating || !selected" @click="create">
      <span v-if="creating" class="ml-spinner ml-spinner--sm" />
      {{ creating ? 'Criando álbum...' : `Criar ${selectedLabel}` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createAlbum, updateAlbum } from '@/api/albums'
import { resolveApiError } from '@/api/errors'
import { defaultBookConfigFor } from './book/bookConfig'
import { BOOK_PRESENTATIONS, DEFAULT_BOOK_PRESENTATION } from './book/presentations'
import type { BookPresentationId } from './book/types'

const router = useRouter()
const selected = ref<BookPresentationId>(DEFAULT_BOOK_PRESENTATION)
const creating = ref(false)
const error = ref('')

const selectedLabel = computed(
  () => BOOK_PRESENTATIONS.find((item) => item.id === selected.value)?.name ?? 'álbum',
)

async function create() {
  creating.value = true
  error.value = ''
  try {
    const album = await createAlbum()
    await updateAlbum(album.id, {
      presentation: selected.value,
      book_config: defaultBookConfigFor(selected.value),
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

.style-grid {
  display: grid;
  gap: 14px;
  margin-bottom: 20px;
  max-width: 640px;
}

.style-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  text-align: left;
  padding: 18px 16px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  transition:
    border-color var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}

.style-card:hover {
  border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
  transform: translateY(-1px);
}

.style-card--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
}

.style-card__emoji {
  font-size: 1.8rem;
  line-height: 1;
}

.style-card__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 650;
}

.style-card__desc {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.ml-btn {
  margin-top: 4px;
}
</style>
