<template>
  <div class="public-page">
    <section v-if="loading" class="public-state">
      <span class="public-spinner" aria-hidden="true" />
      <p>Carregando homenagem...</p>
    </section>

    <section v-else-if="error" class="public-state public-state--error">
      <span class="public-state__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.7 5.8 12 8.6c3.3-2.8 5-3.7 6.8-3.5C22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <h1>Homenagem indisponível</h1>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="tribute && definition && content && theme">
      <ExperienceRenderer
        :definition="definition"
        :content="content"
        :theme="theme"
        :presentation="tribute.content_json?.presentation"
        mode="full"
        :share-url="shareUrl"
      />

      <footer class="public-foot" :class="{ 'public-foot--dark': theme.mode === 'dark' }">
        <RouterLink to="/register" class="public-foot__brand">
          <span class="public-foot__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.7 5.8 12 8.6c3.3-2.8 5-3.7 6.8-3.5C22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21Z" />
            </svg>
          </span>
          Feito com <strong>MayLove</strong>
        </RouterLink>
        <RouterLink to="/register" class="public-foot__cta">Crie a sua homenagem →</RouterLink>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { fetchPublicTribute, recordPublicView } from '@/api/tributes'
import type { PublicTribute } from '@/api/types'
import ExperienceRenderer from '@/components/experience/ExperienceRenderer.vue'
import { getTemplateDefinition } from '@/templates/registry'
import { resolveContent, resolveTheme } from '@/composables/useExperienceContent'

const route = useRoute()
const tribute = ref<PublicTribute | null>(null)
const loading = ref(true)
const error = ref('')

const definition = computed(() =>
  tribute.value ? getTemplateDefinition(tribute.value.template.slug) : null,
)

const theme = computed(() =>
  definition.value
    ? resolveTheme(definition.value, {
        color: tribute.value?.color_primary,
        speed: tribute.value?.content_json?.animation_speed,
        styleId: tribute.value?.content_json?.style_id,
        font: tribute.value?.content_json?.font,
        background: tribute.value?.content_json?.background,
        entrance: tribute.value?.content_json?.entrance,
      })
    : null,
)

const content = computed(() =>
  definition.value ? resolveContent(definition.value, { publicData: tribute.value }) : null,
)

const shareUrl = computed(() =>
  typeof window !== 'undefined' ? window.location.href : '',
)

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    tribute.value = await fetchPublicTribute(slug)
    const sessionId = getSessionId()
    await recordPublicView(slug, sessionId)
  } catch {
    error.value = 'Homenagem não encontrada ou indisponível no momento.'
  } finally {
    loading.value = false
  }
})

function getSessionId(): string {
  const key = 'maylove_view_session'
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
  background: #fbf7f8;
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
  background: rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.public-foot--dark {
  background: rgba(255, 255, 255, 0.04);
  border-top-color: rgba(255, 255, 255, 0.08);
}
.public-foot__brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #7c6a74;
  font-size: 0.9rem;
}
.public-foot--dark .public-foot__brand {
  color: #b9a8bf;
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
  background: linear-gradient(150deg, #e86b92, #d94f7a);
}
.public-foot__cta {
  font-size: 0.9rem;
  font-weight: 600;
  color: #d94f7a;
  transition: opacity 0.2s ease;
}
.public-foot__cta:hover {
  opacity: 0.75;
}
</style>
