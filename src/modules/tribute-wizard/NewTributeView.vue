<template>
  <div class="view ml-fade-up">
    <RouterLink to="/dashboard" class="back-link">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Voltar ao painel
    </RouterLink>

    <header class="new-head">
      <p class="eyebrow">Criar</p>
      <h1 class="section-title">Nova homenagem</h1>
      <p class="text-muted">
        Escolha a ocasião, selecione um modelo feito para ela e comece a personalizar.
      </p>
    </header>

    <!-- Passo 1: categoria -->
    <div class="ml-card step-card">
      <div class="step-card__head">
        <span class="step-num">1</span>
        <div>
          <h2 class="step-title">Escolha a ocasião</h2>
          <p class="text-muted step-desc">Cada categoria tem modelos pensados para o tema.</p>
        </div>
      </div>

      <div class="cat-grid">
        <button
          v-for="cat in categories"
          :key="cat.slug"
          type="button"
          class="cat-option"
          :class="{ 'cat-option--active': selectedCategory === cat.slug }"
          @click="selectCategory(cat.slug)"
        >
          <span class="cat-option__icon">{{ cat.icon }}</span>
          <strong class="cat-option__name">{{ cat.label }}</strong>
          <span class="cat-option__count">{{ countInCategory(cat.slug) }} modelo(s)</span>
          <span v-if="selectedCategory === cat.slug" class="cat-option__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <!-- Passo 2: template + preview -->
    <div v-if="selectedCategory" class="ml-card step-card">
      <div class="step-card__head">
        <span class="step-num">2</span>
        <div>
          <h2 class="step-title">Escolha o modelo</h2>
          <p class="text-muted step-desc">Veja um exemplo ao vivo e selecione o que mais combina.</p>
        </div>
      </div>

      <div class="tpl-layout">
        <div class="tpl-list">
          <button
            v-for="def in templatesInCategory"
            :key="def.slug"
            type="button"
            class="tpl-option"
            :class="{ 'tpl-option--active': selectedTemplateSlug === def.slug }"
            :style="tplVars(def)"
            @click="selectTemplate(def.slug)"
          >
            <span class="tpl-option__swatch" aria-hidden="true" />
            <span class="tpl-option__info">
              <strong class="tpl-option__name">{{ def.name }}</strong>
              <span class="tpl-option__flow">{{ layoutLabel(def) }}</span>
            </span>
            <span v-if="selectedTemplateSlug === def.slug" class="tpl-option__check" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.8">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        </div>

        <div class="tpl-preview">
          <div class="tpl-preview__bar">
            <span class="tpl-preview__dot" />
            Exemplo ao vivo
          </div>
          <div class="tpl-preview__stage">
            <ExperienceRenderer
              v-if="selectedDef && previewContent && previewTheme"
              :key="`${selectedDef.slug}-${selectedPresentation}-${selectedStyle}`"
              :definition="selectedDef"
              :content="previewContent"
              :theme="previewTheme"
              :presentation="selectedPresentation"
              mode="preview"
            />
          </div>
          <p v-if="selectedDef?.description" class="tpl-preview__desc">
            {{ selectedDef.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Passo 3: estilo de apresentação (a experiência) -->
    <div v-if="selectedTemplateSlug" class="ml-card step-card">
      <div class="step-card__head">
        <span class="step-num">3</span>
        <div>
          <h2 class="step-title">Escolha o tipo de apresentação</h2>
          <p class="text-muted step-desc">
            Define como a homenagem é exibida e como o visitante interage com ela.
          </p>
        </div>
      </div>

      <div class="pres-grid">
        <button
          v-for="pres in presentations"
          :key="pres.id"
          type="button"
          class="pres-option"
          :class="{ 'pres-option--active': selectedPresentation === pres.id }"
          @click="selectedPresentation = pres.id"
        >
          <span class="pres-option__emoji">{{ pres.emoji }}</span>
          <strong class="pres-option__name">{{ pres.label }}</strong>
          <span class="pres-option__desc">{{ pres.description }}</span>
          <ul class="pres-option__highlights">
            <li v-for="hl in pres.highlights" :key="hl">{{ hl }}</li>
          </ul>
          <span v-if="selectedPresentation === pres.id" class="pres-option__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.8">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <!-- Passo 4: estilo visual -->
    <div v-if="selectedTemplateSlug" class="ml-card step-card">
      <div class="step-card__head">
        <span class="step-num">4</span>
        <div>
          <h2 class="step-title">Escolha o estilo visual</h2>
          <p class="text-muted step-desc">
            A "roupa" da homenagem: paleta, tipografia e clima. A estrutura não muda.
          </p>
        </div>
      </div>

      <div class="style-grid">
        <button
          v-for="style in styles"
          :key="style.id"
          type="button"
          class="style-option"
          :class="{ 'style-option--active': selectedStyle === style.id }"
          :style="styleVars(style)"
          @click="selectedStyle = style.id"
        >
          <span class="style-option__swatch" aria-hidden="true" />
          <span class="style-option__emoji">{{ style.emoji }}</span>
          <strong class="style-option__name">{{ style.label }}</strong>
          <span class="style-option__desc">{{ style.description }}</span>
          <span v-if="selectedStyle === style.id" class="style-option__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.8">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <p v-if="submitError" class="submit-error">{{ submitError }}</p>

    <footer class="new-actions">
      <span class="new-actions__hint">
        {{ selectedDef?.name ? `Modelo: ${selectedDef.name}` : 'Selecione um modelo' }}
      </span>
      <div class="new-actions__buttons">
        <RouterLink to="/dashboard" class="ml-btn ml-btn--ghost">Cancelar</RouterLink>
        <button
          type="button"
          class="ml-btn ml-btn--primary ml-btn--lg"
          :disabled="!canSubmit || submitting"
          @click="submit"
        >
          {{ submitting ? 'Criando...' : 'Começar a personalizar' }}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { listTemplates, listTributeTypes } from '@/api/catalog'
import { createTribute, updateTribute } from '@/api/tributes'
import { resolveApiError } from '@/api/errors'
import type { Template, TributeType } from '@/api/types'
import { listTemplateDefinitions } from '@/templates/registry'
import { categoriesWithTemplates } from '@/templates/categories'
import { listPresentations, presentationForLayout } from '@/templates/presentations'
import { listStyles, type TemplateStyle } from '@/templates/styles'
import { EXPERIENCE_LAYOUT_LABELS, type TemplateDefinition } from '@/templates/types'
import { resolveContent, resolveTheme } from '@/composables/useExperienceContent'
import ExperienceRenderer from '@/components/experience/ExperienceRenderer.vue'

const router = useRouter()

const definitions = listTemplateDefinitions()
const catalogTemplates = ref<Template[]>([])
const types = ref<TributeType[]>([])
const selectedCategory = ref<string>('')
const selectedTemplateSlug = ref<string>('')
const selectedPresentation = ref<string>('')
const selectedStyle = ref<string>('')
const submitting = ref(false)
const submitError = ref('')

const categories = computed(() => categoriesWithTemplates(definitions))
const presentations = listPresentations()
const styles = listStyles()

const templatesInCategory = computed(() =>
  definitions.filter((def) => def.category === selectedCategory.value),
)

const selectedDef = computed(
  () => definitions.find((def) => def.slug === selectedTemplateSlug.value) ?? null,
)

const previewTheme = computed(() =>
  selectedDef.value
    ? resolveTheme(selectedDef.value, { styleId: selectedStyle.value || null })
    : null,
)
const previewContent = computed(() =>
  selectedDef.value ? resolveContent(selectedDef.value, {}) : null,
)

const canSubmit = computed(
  () => Boolean(selectedTemplateSlug.value && selectedPresentation.value && selectedStyle.value),
)

function countInCategory(slug: string): number {
  return definitions.filter((def) => def.category === slug).length
}

function layoutLabel(def: TemplateDefinition): string {
  return EXPERIENCE_LAYOUT_LABELS[def.layout ?? 'scroll']
}

function tplVars(def: TemplateDefinition) {
  return {
    '--tpl-c1': def.theme.primaryColor,
    '--tpl-c2': def.theme.accentColor || def.theme.primaryColor,
  } as Record<string, string>
}

function styleVars(style: TemplateStyle) {
  return {
    '--tpl-c1': style.overrides.primaryColor,
    '--tpl-c2': style.overrides.accentColor,
  } as Record<string, string>
}

function selectCategory(slug: string) {
  selectedCategory.value = slug
  selectTemplate(templatesInCategory.value[0]?.slug ?? '')
}

// Ao trocar de template, sugerimos a apresentação que casa com o layout default
// e um estilo visual coerente com a paleta do template.
function selectTemplate(slug: string) {
  selectedTemplateSlug.value = slug
  const def = definitions.find((item) => item.slug === slug) ?? null
  if (!def) return
  selectedPresentation.value =
    presentationForLayout(def.layout)?.id ?? presentations[0]?.id ?? ''
  if (!selectedStyle.value) selectedStyle.value = styles[0]?.id ?? ''
}

async function submit() {
  const def = selectedDef.value
  if (!def) return
  const catalog = catalogTemplates.value.find((item) => item.slug === def.slug)
  const type = types.value.find((item) => item.slug === def.tributeTypeSlug) ?? types.value[0]
  if (!catalog || !type) {
    submitError.value = 'Catálogo indisponível. Recarregue a página e tente novamente.'
    return
  }

  submitting.value = true
  submitError.value = ''
  try {
    const tribute = await createTribute(type.id, catalog.id)
    // Persiste a experiência escolhida (apresentação + estilo) já na criação,
    // para o wizard abrir com o fluxo e o visual definidos.
    await updateTribute(tribute.id, {
      content_json: {
        presentation: selectedPresentation.value || null,
        style_id: selectedStyle.value || null,
      },
    })
    await router.push(`/dashboard/tributes/${tribute.id}/edit`)
  } catch (err) {
    submitError.value = resolveApiError(
      err,
      'Não foi possível criar a homenagem. Tente novamente.',
    )
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    ;[catalogTemplates.value, types.value] = await Promise.all([
      listTemplates(),
      listTributeTypes(),
    ])
  } catch {
    submitError.value = 'Não foi possível carregar o catálogo.'
  }
  // Pré-seleciona a primeira categoria para orientar o usuário.
  if (categories.value[0]) selectCategory(categories.value[0].slug)
})
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
.new-head .text-muted {
  margin-top: 8px;
}

.step-card {
  padding: 24px;
  margin-bottom: 20px;
}
.step-card__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.step-num {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 11px;
  font-weight: 700;
  color: var(--primary-strong);
  background: var(--primary-soft);
}
.step-title {
  font-size: 1.2rem;
}
.step-desc {
  font-size: 0.88rem;
  margin-top: 2px;
}

/* Categorias */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.cat-option {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 16px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    background var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.cat-option:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.cat-option--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.cat-option__icon {
  font-size: 1.7rem;
  line-height: 1;
}
.cat-option__name {
  font-size: 0.96rem;
  font-weight: 600;
  color: var(--ink);
}
.cat-option__count {
  font-size: 0.76rem;
  color: var(--muted);
}
.cat-option__check {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
}

/* Templates + preview */
.tpl-layout {
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}
.tpl-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tpl-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.tpl-option:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}
.tpl-option--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.tpl-option__swatch {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--tpl-c1), var(--tpl-c2));
}
.tpl-option__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tpl-option__name {
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--ink);
}
.tpl-option__flow {
  font-size: 0.76rem;
  color: var(--muted);
}
.tpl-option__check {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
}

.tpl-preview {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--surface-2, var(--surface));
  overflow: hidden;
}
.tpl-preview__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
}
.tpl-preview__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--success);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 22%, transparent);
}
.tpl-preview__stage {
  max-height: 520px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.tpl-preview__desc {
  padding: 12px 16px;
  font-size: 0.86rem;
  color: var(--muted);
  border-top: 1px solid var(--border);
}

/* Apresentações */
.pres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.pres-option {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 16px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.pres-option:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.pres-option--active {
  border-color: var(--primary);
  background: var(--primary-softer);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.pres-option__emoji {
  font-size: 1.6rem;
  line-height: 1;
}
.pres-option__name {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--ink);
}
.pres-option__desc {
  font-size: 0.8rem;
  color: var(--muted);
}
.pres-option__highlights {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pres-option__highlights li {
  position: relative;
  padding-left: 14px;
  font-size: 0.76rem;
  color: var(--subtle);
}
.pres-option__highlights li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 6px;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--primary);
}
.pres-option__check {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
}

/* Estilos visuais */
.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.style-option {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.style-option:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}
.style-option--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.style-option__swatch {
  width: 100%;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--tpl-c1), var(--tpl-c2));
  margin-bottom: 4px;
}
.style-option__emoji {
  font-size: 1.2rem;
  line-height: 1;
}
.style-option__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
}
.style-option__desc {
  font-size: 0.76rem;
  color: var(--muted);
}
.style-option__check {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  color: #fff;
  background: var(--primary);
}

.submit-error {
  color: var(--error);
  font-size: 0.9rem;
  margin: 4px 0 16px;
}

.new-actions {
  position: sticky;
  bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 24px;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}
.new-actions__hint {
  font-size: 0.88rem;
  color: var(--muted);
  font-weight: 500;
}
.new-actions__buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

@media (max-width: 720px) {
  .tpl-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .new-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .new-actions__buttons {
    margin-left: 0;
  }
  .new-actions__buttons .ml-btn {
    flex: 1;
  }
}
</style>
