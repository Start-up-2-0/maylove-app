<template>
  <div class="view ml-fade-up">
    <header class="tg-head">
      <p class="eyebrow">Biblioteca</p>
      <h1 class="section-title">Modelos de homenagem</h1>
      <p class="text-muted">
        Escolha um modelo pronto, veja um exemplo ao vivo e comece a personalizar em segundos.
      </p>
    </header>

    <p v-if="createError" class="tg-error">{{ createError }}</p>

    <div class="tg-filters">
      <button
        v-for="cat in categories"
        :key="cat.slug"
        type="button"
        class="ml-chip"
        :class="{ 'ml-chip--active': activeCategory === cat.slug }"
        @click="activeCategory = cat.slug"
      >
        <span v-if="cat.icon">{{ cat.icon }}</span> {{ cat.label }}
      </button>
    </div>

    <div class="tg-grid">
      <article v-for="def in filtered" :key="def.slug" class="tg-card">
        <button class="tg-card__banner" :style="bannerStyle(def)" @click="openPreview(def)">
          <span class="tg-card__cat">{{ categoryIcon(def.category) }} {{ categoryLabel(def.category) }}</span>
          <span class="tg-card__name" :style="{ fontFamily: def.theme.fontDisplay }">{{ def.name }}</span>
          <span class="tg-card__flow">{{ layoutLabel(def) }}</span>
          <span class="tg-card__view">Ver exemplo</span>
        </button>
        <div class="tg-card__body">
          <p class="tg-card__desc">{{ def.description }}</p>
          <div class="tg-card__chips">
            <span v-for="fx in def.effects" :key="fx" class="tg-tag">{{ effectLabel(fx) }}</span>
            <span class="tg-tag tg-tag--muted">{{ def.sections.length }} seções</span>
          </div>
        </div>
        <div class="tg-card__actions">
          <button class="ml-btn ml-btn--secondary ml-btn--sm" @click="openPreview(def)">Ver exemplo</button>
          <button
            class="ml-btn ml-btn--primary ml-btn--sm"
            :disabled="creatingSlug === def.slug"
            @click="use(def)"
          >
            {{ creatingSlug === def.slug ? 'Criando...' : 'Usar modelo' }}
          </button>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <transition name="tg-fade">
        <div v-if="previewDef" class="tg-modal" @click.self="closePreview">
          <div class="tg-modal__panel">
            <header class="tg-modal__bar">
              <div>
                <p class="eyebrow">{{ categoryLabel(previewDef.category) }}</p>
                <h2 class="tg-modal__title">{{ previewDef.name }}</h2>
              </div>
              <div class="tg-modal__bar-actions">
                <button class="ml-btn ml-btn--primary ml-btn--sm" @click="use(previewDef)">
                  Usar este modelo
                </button>
                <button class="ml-icon-btn" aria-label="Fechar" @click="closePreview">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 6l12 12M18 6 6 18" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            </header>
            <div class="tg-modal__scroll">
              <ExperienceRenderer
                v-if="previewContent && previewTheme"
                :definition="previewDef"
                :content="previewContent"
                :theme="previewTheme"
                mode="preview"
              />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listTemplates, listTributeTypes } from '@/api/catalog'
import { createTribute } from '@/api/tributes'
import { resolveApiError } from '@/api/errors'
import type { Template, TributeEffect, TributeType } from '@/api/types'
import { listTemplateDefinitions } from '@/templates/registry'
import { EXPERIENCE_LAYOUT_LABELS, type TemplateDefinition } from '@/templates/types'
import {
  categoriesWithTemplates,
  categoryIcon,
  categoryLabel,
} from '@/templates/categories'
import { resolveContent, resolveTheme } from '@/composables/useExperienceContent'
import ExperienceRenderer from '@/components/experience/ExperienceRenderer.vue'

const router = useRouter()

const definitions = listTemplateDefinitions()
const catalogTemplates = ref<Template[]>([])
const types = ref<TributeType[]>([])
const activeCategory = ref('todos')
const creatingSlug = ref<string | null>(null)
const createError = ref('')
const previewDef = ref<TemplateDefinition | null>(null)

const categories = computed(() => [
  { slug: 'todos', label: 'Todos', icon: '' },
  ...categoriesWithTemplates(definitions),
])

const filtered = computed(() =>
  activeCategory.value === 'todos'
    ? definitions
    : definitions.filter((def) => def.category === activeCategory.value),
)

const previewTheme = computed(() =>
  previewDef.value ? resolveTheme(previewDef.value) : null,
)
const previewContent = computed(() =>
  previewDef.value ? resolveContent(previewDef.value, {}) : null,
)

const effectLabels: Record<TributeEffect, string> = {
  confetti: 'Confete',
  hearts: 'Corações',
  petals: 'Pétalas',
  fireworks: 'Fogos',
  stars: 'Estrelas',
  snow: 'Neve',
}

function effectLabel(fx: TributeEffect): string {
  return effectLabels[fx] ?? fx
}

function layoutLabel(def: TemplateDefinition): string {
  return EXPERIENCE_LAYOUT_LABELS[def.layout ?? 'scroll']
}

function bannerStyle(def: TemplateDefinition) {
  return {
    background: `${def.theme.background}, ${def.theme.primaryColor}`,
    '--tg-primary': def.theme.primaryColor,
    '--tg-accent': def.theme.accentColor || def.theme.primaryColor,
    color: def.theme.mode === 'dark' ? '#fff' : '#20141a',
  }
}

function openPreview(def: TemplateDefinition) {
  previewDef.value = def
  document.body.style.overflow = 'hidden'
}

function closePreview() {
  previewDef.value = null
  document.body.style.overflow = ''
}

async function use(def: TemplateDefinition) {
  const catalog = catalogTemplates.value.find((item) => item.slug === def.slug)
  if (!catalog) return
  const type =
    types.value.find((item) => item.slug === def.tributeTypeSlug) ?? types.value[0]
  if (!type) return

  creatingSlug.value = def.slug
  createError.value = ''
  try {
    const tribute = await createTribute(type.id, catalog.id)
    closePreview()
    await router.push(`/dashboard/tributes/${tribute.id}/edit`)
  } catch (err) {
    createError.value = resolveApiError(err, 'Não foi possível criar a homenagem.')
    creatingSlug.value = null
  }
}

onMounted(async () => {
  try {
    ;[catalogTemplates.value, types.value] = await Promise.all([
      listTemplates(),
      listTributeTypes(),
    ])
  } catch {
    /* catálogo indisponível — botões de uso ficam inativos */
  }
})
</script>

<style scoped>
.tg-head {
  margin-bottom: 22px;
}
.tg-head .text-muted {
  margin-top: 8px;
  max-width: 60ch;
}
.tg-error {
  margin-bottom: 16px;
  padding: 11px 14px;
  border-radius: var(--radius-md);
  background: var(--error-soft);
  color: var(--error);
  font-size: 0.88rem;
  font-weight: 500;
}

.tg-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.tg-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition:
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.tg-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-strong);
}

.tg-card__banner {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
  height: 168px;
  padding: 18px;
  text-align: left;
  border: none;
  cursor: pointer;
  overflow: hidden;
}
.tg-card__banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 20% 10%, rgba(255, 255, 255, 0.25) 0%, transparent 55%);
  pointer-events: none;
}
.tg-card__cat {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.85;
}
.tg-card__name {
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.1;
}
.tg-card__flow {
  position: absolute;
  top: 14px;
  left: 14px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  backdrop-filter: blur(6px);
}
.tg-card__view {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6px);
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}
.tg-card__banner:hover .tg-card__view {
  opacity: 1;
  transform: translateY(0);
}

.tg-card__body {
  flex: 1;
  padding: 16px 18px 8px;
}
.tg-card__desc {
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--muted);
}
.tg-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}
.tg-tag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  color: var(--primary-strong);
  background: var(--primary-softer);
}
.tg-tag--muted {
  color: var(--muted);
  background: var(--surface-3);
}

.tg-card__actions {
  display: flex;
  gap: 8px;
  padding: 14px 18px 18px;
}
.tg-card__actions .ml-btn {
  flex: 1;
}

/* Modal de preview */
.tg-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 3vw, 32px);
  background: var(--overlay);
  backdrop-filter: blur(4px);
}
.tg-modal__panel {
  display: flex;
  flex-direction: column;
  width: min(1040px, 100%);
  max-height: 92vh;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}
.tg-modal__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.tg-modal__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--ink);
}
.tg-modal__bar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tg-modal__scroll {
  overflow-y: auto;
  overscroll-behavior: contain;
}

.tg-fade-enter-active,
.tg-fade-leave-active {
  transition: opacity var(--dur) var(--ease);
}
.tg-fade-enter-from,
.tg-fade-leave-to {
  opacity: 0;
}

@media (max-width: 560px) {
  .tg-modal__bar-actions .ml-btn {
    display: none;
  }
}
</style>
