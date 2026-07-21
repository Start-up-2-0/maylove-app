<template>
  <RomanceFormShell :title="stepTitle" :prompt="stepPrompt" flat>
    <div class="rom-theme">
      <header class="rom-theme__header">
        <span class="rom-theme__header-icon" aria-hidden="true">🎨</span>
        <div>
          <h3 class="rom-theme__heading">Tema da Página</h3>
          <p class="rom-theme__subheading">Qual estilo combina mais com vocês?</p>
        </div>
      </header>

      <div class="rom-theme__carousel">
        <button
          type="button"
          class="rom-theme__carousel-btn"
          aria-label="Tema anterior"
          :disabled="themes.length <= 1"
          @click="shiftTheme(-1)"
        >
          ‹
        </button>
        <div class="rom-theme__carousel-center">
          <span class="rom-theme__carousel-dot" :style="carouselDotStyle" aria-hidden="true" />
          <strong>{{ activeTheme.label }}</strong>
          <span class="rom-theme__carousel-meta">{{ activeIndex + 1 }} de {{ themes.length }}</span>
        </div>
        <button
          type="button"
          class="rom-theme__carousel-btn"
          aria-label="Próximo tema"
          :disabled="themes.length <= 1"
          @click="shiftTheme(1)"
        >
          ›
        </button>
      </div>

      <div class="rom-theme__grid">
        <button
          v-for="theme in themes"
          :key="theme.id"
          type="button"
          class="rom-theme__card"
          :class="{ 'rom-theme__card--active': theme.id === activeTheme.id }"
          @click="selectTheme(theme.id)"
        >
          <span class="rom-theme__swatch" :style="swatchStyle(theme)" />
          <span class="rom-theme__card-label">{{ theme.label }}</span>
          <span v-if="theme.id === activeTheme.id" class="rom-theme__check" aria-hidden="true">✓</span>
        </button>
      </div>

      <div v-if="activeTheme.id === 'retrospectiva'" class="rom-theme__palette">
        <header class="rom-theme__palette-head">
          <span aria-hidden="true">🎨</span>
          <div>
            <h4 class="rom-theme__palette-title">Paleta de cores</h4>
            <p class="rom-theme__palette-sub">Escolha um estilo ou personalize a cor principal</p>
          </div>
        </header>
        <div class="rom-theme__palette-grid">
          <button
            v-for="palette in retrospectivePalettes"
            :key="palette.id"
            type="button"
            class="rom-theme__palette-btn"
            :class="{ 'rom-theme__palette-btn--active': props.form.retrospective_palette_id === palette.id }"
            @click="selectPalette(palette.id, palette.accent)"
          >
            <span class="rom-theme__palette-swatch" :style="paletteSwatchStyle(palette)" />
            <span>{{ palette.label }}</span>
          </button>
          <label
            class="rom-theme__palette-btn rom-theme__palette-btn--custom"
            :class="{ 'rom-theme__palette-btn--active': props.form.retrospective_palette_id === 'custom' }"
          >
            <span class="rom-theme__palette-swatch rom-theme__palette-swatch--custom">
              <input
                type="color"
                :value="props.form.color_primary"
                aria-label="Cor personalizada"
                @input="onCustomColor"
              />
            </span>
            <span>Personalizar</span>
          </label>
        </div>
      </div>
    </div>
  </RomanceFormShell>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import { getCoachPrompt, getCoachStepTitle } from '@/modules/romance-wizard/romanceBuildCopy'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'
import { getRomanceExperience } from '@/modules/romance-wizard/romanceExperiences'
import {
  DEFAULT_ROMANCE_THEME_ID,
  listRomanceThemes,
  resolveRomanceTheme,
  type RomanceThemeDefinition,
} from '@/modules/romance-wizard/romanceThemes'
import { applyRomanceThemeToForm } from '@/modules/romance-wizard/romanceThemeFlow'
import {
  DEFAULT_RETROSPECTIVE_PALETTE_ID,
  RETROSPECTIVE_PALETTES,
  type RetrospectivePalette,
} from '@/modules/romance-wizard/retrospectivePalettes'
import type { TemplateDefinition } from '@/templates/types'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  experienceId?: RomanceExperienceId | null
  definition?: TemplateDefinition | null
  tributeTypeId?: string | null
}>()

const emit = defineEmits<{ 'theme-changed': [] }>()

const themes = listRomanceThemes()
const retrospectivePalettes = RETROSPECTIVE_PALETTES

const stepTitle = computed(() => getCoachStepTitle('theme', 'Tema da página'))
const stepPrompt = computed(() => getCoachPrompt('theme', props.experienceId))

const experienceDefaultThemeId = computed(
  () => getRomanceExperience(props.experienceId)?.defaultThemeId ?? DEFAULT_ROMANCE_THEME_ID,
)

const activeTheme = computed(() =>
  resolveRomanceTheme({
    themeId: props.form.romance_theme_id,
    presentationId: props.form.presentation,
    defaultThemeId: experienceDefaultThemeId.value,
  }),
)

const activeIndex = computed(() =>
  themes.findIndex((item) => item.id === activeTheme.value.id),
)

const carouselDotStyle = computed(() => ({
  background: activeTheme.value.accent ?? activeTheme.value.gradient[0],
}))

function swatchStyle(theme: RomanceThemeDefinition) {
  return {
    background: `linear-gradient(145deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
  }
}

async function applyTheme(theme: RomanceThemeDefinition) {
  await applyRomanceThemeToForm(props.form, theme.id, {
    definition: props.definition,
    tributeTypeId: props.tributeTypeId,
  })
  emit('theme-changed')
}

function selectTheme(themeId: string) {
  const theme = themes.find((item) => item.id === themeId)
  if (!theme) return
  void applyTheme(theme)
}

function shiftTheme(delta: number) {
  const index = activeIndex.value >= 0 ? activeIndex.value : 0
  const next = (index + delta + themes.length) % themes.length
  void applyTheme(themes[next])
}

function selectPalette(paletteId: string, accent: string) {
  props.form.retrospective_palette_id = paletteId
  props.form.color_primary = accent
  emit('theme-changed')
}

function paletteSwatchStyle(palette: RetrospectivePalette) {
  return { background: palette.buttonGradient }
}

function onCustomColor(event: Event) {
  const value = (event.target as HTMLInputElement).value
  props.form.retrospective_palette_id = 'custom'
  props.form.color_primary = value
  emit('theme-changed')
}

watch(
  () => activeTheme.value.id,
  (themeId) => {
    if (themeId === 'retrospectiva' && !props.form.retrospective_palette_id) {
      props.form.retrospective_palette_id = DEFAULT_RETROSPECTIVE_PALETTE_ID
    }
  },
  { immediate: true },
)

watch(
  () => [props.form.romance_theme_id, props.form.presentation] as const,
  () => {
    if (!props.form.romance_theme_id && props.form.presentation) {
      const resolved = resolveRomanceTheme({
        presentationId: props.form.presentation,
        defaultThemeId: experienceDefaultThemeId.value,
      })
      props.form.romance_theme_id = resolved.id
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.rom-theme {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.rom-theme__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.rom-theme__header-icon {
  font-size: 1.35rem;
  line-height: 1;
}
.rom-theme__heading {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ink);
}
.rom-theme__subheading {
  margin: 4px 0 0;
  font-size: 0.88rem;
  color: var(--muted);
}
.rom-theme__carousel {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 14%, var(--border));
  background: color-mix(in srgb, var(--rom-accent-soft, #fff1f2) 40%, var(--surface));
}
.rom-theme__carousel-btn {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 8px rgb(15 23 42 / 8%);
}
.rom-theme__carousel-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.rom-theme__carousel-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}
.rom-theme__carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-bottom: 4px;
}
.rom-theme__carousel-center strong {
  font-size: 0.95rem;
  font-weight: 800;
}
.rom-theme__carousel-meta {
  font-size: 0.78rem;
  color: var(--muted);
}
.rom-theme__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 640px) {
  .rom-theme__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.rom-theme__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 10px 12px;
  text-align: left;
  border-radius: 14px;
  border: 2px solid transparent;
  background: var(--surface);
  box-shadow: 0 8px 24px -18px rgb(15 23 42 / 35%);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.rom-theme__card:hover {
  transform: translateY(-2px);
}
.rom-theme__card--active {
  border-color: var(--rom-accent, #e11d48);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--rom-accent, #e11d48) 18%, transparent);
}
.rom-theme__swatch {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
}
.rom-theme__card-label {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
}
.rom-theme__check {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--rom-accent, #e11d48);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}
.rom-theme__palette {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--rom-accent, #e11d48) 14%, var(--border));
  background: color-mix(in srgb, var(--rom-accent-soft, #fff1f2) 28%, var(--surface));
}
.rom-theme__palette-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.rom-theme__palette-title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--ink);
}
.rom-theme__palette-sub {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--muted);
}
.rom-theme__palette-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 640px) {
  .rom-theme__palette-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.rom-theme__palette-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: var(--surface);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ink);
  transition: border-color 0.2s ease;
}
.rom-theme__palette-btn--active {
  border-color: var(--rom-accent, #e11d48);
}
.rom-theme__palette-swatch {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
}
.rom-theme__palette-swatch--custom {
  display: grid;
  place-items: center;
  background: var(--surface);
  border: 1px dashed var(--border);
  overflow: hidden;
}
.rom-theme__palette-swatch--custom input {
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>
