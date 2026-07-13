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
        Escolha o estilo do livro digital e comece a montar suas memórias.
      </p>
    </header>

    <div class="ml-card step-card">
      <div class="step-card__head">
        <span class="step-num">1</span>
        <div>
          <h2 class="step-title">Escolha o estilo do livro</h2>
          <p class="text-muted step-desc">Você pode trocar o estilo depois, antes de publicar.</p>
        </div>
      </div>

      <div class="pres-grid">
        <button
          v-for="item in presentations"
          :key="item.id"
          type="button"
          class="pres-card"
          :class="{ 'pres-card--active': selected === item.id }"
          @click="selected = item.id"
        >
          <span class="pres-card__emoji" aria-hidden="true">{{ item.emoji }}</span>
          <strong class="pres-card__label">{{ item.name }}</strong>
          <span class="pres-card__desc">{{ item.description }}</span>
          <span class="pres-card__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>

      <button class="ml-btn ml-btn--primary ml-btn--lg" :disabled="creating" @click="create">
        <span v-if="creating" class="ml-spinner ml-spinner--sm" />
        {{ creating ? 'Criando álbum...' : 'Criar álbum' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createAlbum, updateAlbum } from '@/api/albums'
import { resolveApiError } from '@/api/errors'
import { BOOK_PRESENTATIONS, DEFAULT_BOOK_PRESENTATION } from './book/presentations'
import type { BookPresentationId } from './book/types'

const router = useRouter()
const presentations = BOOK_PRESENTATIONS
const selected = ref<BookPresentationId>(DEFAULT_BOOK_PRESENTATION)
const creating = ref(false)
const error = ref('')

async function create() {
  creating.value = true
  error.value = ''
  try {
    const album = await createAlbum()
    if (selected.value !== DEFAULT_BOOK_PRESENTATION) {
      await updateAlbum(album.id, { presentation: selected.value })
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
  margin-bottom: 24px;
}

.step-card {
  padding: clamp(20px, 3vw, 28px);
}
.step-card__head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 22px;
}
.step-num {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--primary-strong);
  background: var(--primary-soft);
  flex-shrink: 0;
}
.step-title {
  font-size: 1.15rem;
  font-weight: 600;
}
.step-desc {
  margin-top: 4px;
  font-size: 0.9rem;
}

.pres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.pres-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 18px 16px;
  text-align: left;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.pres-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.pres-card--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.pres-card__emoji {
  font-size: 1.9rem;
  line-height: 1;
}
.pres-card__label {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink);
}
.pres-card__desc {
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--muted);
}
.pres-card__check {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}
.pres-card--active .pres-card__check {
  opacity: 1;
  transform: scale(1);
}
</style>
