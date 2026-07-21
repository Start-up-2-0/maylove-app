<template>
  <div class="public-page">
    <section v-if="loading" class="public-state">
      <span class="public-spinner" aria-hidden="true" />
      <p>Carregando buquê...</p>
    </section>

    <section v-else-if="error" class="public-state public-state--error">
      <span class="public-state__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3c4 0 7 2.5 7 6s-3 6-7 9c-4-3-7-6-7-9 0-3.5 3-6 7-6z" />
        </svg>
      </span>
      <h1>Buquê indisponível</h1>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="bouquet">
      <div class="public-bouquet__layout">
        <BouquetLivePreview
          :stems="bouquet.stems"
          :wrap-color="bouquet.wrap_color"
          :recipient-name="bouquet.recipient_name"
          :sender-name="bouquet.sender_name"
          :letter-body="bouquet.letter_body"
          :letter-design="bouquet.letter_design"
          show-letter
        />
        <div class="public-share">
          <ShareBar :url="shareUrl" label="Compartilhar buquê" />
        </div>
      </div>

      <footer class="public-foot">
        <RouterLink to="/register" class="public-foot__brand">
          <LogoMark :size="15" variant="mono" class="public-foot__mark" />
          Feito com <strong>MayLov</strong>
        </RouterLink>
        <RouterLink to="/dashboard/bouquets/new" class="public-foot__cta">Crie seu buquê →</RouterLink>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchPublicBouquet, recordBouquetView } from '@/api/bouquets'
import type { PublicDigitalBouquet } from '@/api/types'
import LogoMark from '@/components/brand/LogoMark.vue'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import BouquetLivePreview from './components/BouquetLivePreview.vue'

const route = useRoute()
const slug = route.params.slug as string

const bouquet = ref<PublicDigitalBouquet | null>(null)
const loading = ref(true)
const error = ref('')

const shareUrl = computed(() => `${window.location.origin}/bouquet/${slug}`)

onMounted(async () => {
  try {
    bouquet.value = await fetchPublicBouquet(slug)
    const sessionId = sessionStorage.getItem('maylove_bouquet_session') ?? crypto.randomUUID()
    sessionStorage.setItem('maylove_bouquet_session', sessionId)
    await recordBouquetView(slug, sessionId).catch(() => undefined)
  } catch {
    error.value = 'Este buquê não foi encontrado ou está indisponível.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.public-bouquet__layout {
  flex: 1;
  width: min(720px, 100%);
  margin: 0 auto;
  padding: clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px);
}

.public-share {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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
  text-decoration: none;
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
  color: var(--primary-strong);
  text-decoration: none;
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
