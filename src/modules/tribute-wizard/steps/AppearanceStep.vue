<template>
  <div class="appearance-step">
    <WizardStepHeader
      title="Estilo e aparência"
      description="Escolha um estilo visual e ajuste as cores. A estrutura do template não muda — só a “roupa”."
    />

    <div class="ap-context">
      <span class="ap-context__emoji" aria-hidden="true">{{ presentationEmoji }}</span>
      <span class="ap-context__text">
        Experiência: <strong>{{ layoutName }}</strong>
        <span class="ap-context__hint">— as opções abaixo se ajustam a ela.</span>
      </span>
    </div>

    <section class="ap-section">
      <h3 class="ap-title">Estilo visual</h3>
      <p class="ap-hint">Cada estilo troca paleta, tipografia, fundo e o ritmo das animações.</p>

      <div class="ap-styles">
        <button
          type="button"
          class="ap-style ap-style--default"
          :class="{ 'ap-style--active': !form.style_id }"
          @click="clearStyle"
        >
          <span class="ap-style__emoji">🎨</span>
          <span class="ap-style__label">Padrão do template</span>
          <span class="ap-style__desc">Mantém as cores originais do modelo.</span>
        </button>

        <button
          v-for="style in styles"
          :key="style.id"
          type="button"
          class="ap-style"
          :class="{ 'ap-style--active': form.style_id === style.id }"
          :style="styleCardVars(style)"
          @click="applyStyle(style)"
        >
          <span class="ap-style__swatches" aria-hidden="true">
            <span class="ap-style__swatch ap-style__swatch--1" />
            <span class="ap-style__swatch ap-style__swatch--2" />
          </span>
          <span class="ap-style__label" :style="{ fontFamily: style.overrides.fontDisplay }">
            {{ style.emoji }} {{ style.label }}
          </span>
          <span class="ap-style__desc">{{ style.description }}</span>
          <span class="ap-style__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </section>

    <section class="ap-section">
      <h3 class="ap-title">Cor principal</h3>
      <p class="ap-hint">Ajuste fino da cor de destaque da homenagem.</p>
      <div class="ap-colors">
        <button
          v-for="color in palette"
          :key="color"
          type="button"
          class="ap-color"
          :class="{ 'ap-color--active': isSameColor(color, form.color_primary) }"
          :style="{ background: color }"
          :aria-label="`Usar cor ${color}`"
          @click="form.color_primary = color"
        />
        <label class="ap-color ap-color--custom" :style="{ background: form.color_primary }">
          <input v-model="form.color_primary" type="color" class="ap-color__input" />
          <span class="ap-color__plus">+</span>
        </label>
      </div>
    </section>

    <section class="ap-section">
      <h3 class="ap-title">Tipografia</h3>
      <p class="ap-hint">Fonte dos títulos da homenagem.</p>
      <div class="ap-fonts">
        <button
          type="button"
          class="ap-font"
          :class="{ 'ap-font--active': !form.font }"
          @click="form.font = ''"
        >
          <span class="ap-font__name">Padrão</span>
          <span class="ap-font__sample">Aa</span>
        </button>
        <button
          v-for="font in fonts"
          :key="font.id"
          type="button"
          class="ap-font"
          :class="{ 'ap-font--active': form.font === font.value }"
          @click="form.font = font.value"
        >
          <span class="ap-font__name">{{ font.label }}</span>
          <span class="ap-font__sample" :style="{ fontFamily: font.value }">Aa</span>
        </button>
      </div>
    </section>

    <section class="ap-section">
      <h3 class="ap-title">Plano de fundo</h3>
      <p class="ap-hint">Cada opção já ajusta o contraste do texto automaticamente.</p>
      <div class="ap-bgs">
        <button
          type="button"
          class="ap-bg ap-bg--default"
          :class="{ 'ap-bg--active': !form.background }"
          @click="form.background = ''"
        >
          <span class="ap-bg__label">Padrão</span>
        </button>
        <button
          v-for="bg in backgrounds"
          :key="bg.id"
          type="button"
          class="ap-bg"
          :class="{ 'ap-bg--active': form.background === bg.id }"
          :style="{ background: bg.value }"
          @click="form.background = bg.id"
        >
          <span class="ap-bg__label" :class="{ 'ap-bg__label--dark': bg.mode === 'dark' }">
            {{ bg.label }}
          </span>
        </button>
      </div>
    </section>

    <section v-if="showPhotoStyle" class="ap-section">
      <h3 class="ap-title">Exibição das fotos</h3>
      <p class="ap-hint">Como as fotos aparecem nos blocos de fotos (slider ou grade).</p>
      <div class="ap-speed">
        <button
          v-for="option in photoStyleOptions"
          :key="option.value"
          type="button"
          class="ap-speed__btn"
          :class="{ 'ap-speed__btn--active': form.photo_style === option.value }"
          @click="form.photo_style = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section v-if="showTextStyle" class="ap-section">
      <h3 class="ap-title">Aparição dos textos</h3>
      <p class="ap-hint">Como as mensagens surgem — de uma vez ou com efeito de digitação.</p>
      <div class="ap-speed">
        <button
          v-for="option in textStyleOptions"
          :key="option.value"
          type="button"
          class="ap-speed__btn"
          :class="{ 'ap-speed__btn--active': form.text_style === option.value }"
          @click="form.text_style = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="ap-section">
      <h3 class="ap-title">Velocidade das animações</h3>
      <div class="ap-speed">
        <button
          v-for="option in speedOptions"
          :key="option.value"
          type="button"
          class="ap-speed__btn"
          :class="{ 'ap-speed__btn--active': form.animation_speed === option.value }"
          @click="form.animation_speed = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section v-if="isScroll" class="ap-section">
      <h3 class="ap-title">Transição de entrada</h3>
      <p class="ap-hint">Como os blocos e textos surgem ao aparecer na tela.</p>
      <div class="ap-speed">
        <button
          v-for="option in entranceOptions"
          :key="option.value"
          type="button"
          class="ap-speed__btn"
          :class="{ 'ap-speed__btn--active': form.entrance === option.value }"
          @click="form.entrance = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="ap-section">
      <h3 class="ap-title">Seções</h3>
      <template v-if="isScroll">
        <p class="ap-hint">Ative, desative e reordene os blocos da homenagem.</p>
        <ul class="ap-sections">
          <li
            v-for="(item, index) in arrangement"
            :key="item.id"
            class="ap-sec"
            :class="{ 'ap-sec--off': !item.enabled }"
          >
            <span class="ap-sec__emoji">{{ sectionMeta(item.type).emoji }}</span>
            <span class="ap-sec__label">{{ sectionMeta(item.type).label }}</span>
            <div class="ap-sec__actions">
              <button
                type="button"
                class="ap-sec__move"
                :disabled="index === 0"
                aria-label="Mover para cima"
                @click="move(index, -1)"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M18 15l-6-6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                class="ap-sec__move"
                :disabled="index === arrangement.length - 1"
                aria-label="Mover para baixo"
                @click="move(index, 1)"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                class="ap-sec__toggle"
                :class="{ 'ap-sec__toggle--on': item.enabled }"
                role="switch"
                :aria-checked="item.enabled"
                @click="toggle(item.id)"
              >
                <span class="ap-sec__knob" />
              </button>
            </div>
          </li>
        </ul>
      </template>
      <p v-else class="ap-note">
        Este modelo usa a experiência <strong>{{ layoutName }}</strong>, cujas seções seguem um
        fluxo narrativo próprio e não podem ser reordenadas.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { listStyles, type TemplateStyle } from '@/templates/styles'
import { getPresentation } from '@/templates/presentations'
import { DISPLAY_FONTS } from '@/templates/fonts'
import { BACKGROUND_PRESETS } from '@/templates/backgrounds'
import {
  EXPERIENCE_LAYOUT_LABELS,
  SECTION_META,
  type ExperienceLayout,
  type SectionType,
  type TemplateDefinition,
} from '@/templates/types'
import WizardStepHeader from '@/components/wizard/WizardStepHeader.vue'

const props = defineProps<{
  form: ReturnType<typeof useTributeWizard>['form']
  definition: TemplateDefinition
}>()

const styles = listStyles()
const fonts = DISPLAY_FONTS
const backgrounds = BACKGROUND_PRESETS

// Layout efetivo: a apresentação escolhida sobrepõe o padrão do template.
const layout = computed<ExperienceLayout>(
  () => getPresentation(props.form.presentation)?.layout ?? props.definition.layout ?? 'scroll',
)
const presentationEmoji = computed(() => getPresentation(props.form.presentation)?.emoji ?? '✨')

const isScroll = computed(() => layout.value === 'scroll')
const layoutName = computed(() => EXPERIENCE_LAYOUT_LABELS[layout.value])

interface SectionRow {
  id: string
  type: SectionType
  enabled: boolean
}

const arrangement = ref<SectionRow[]>(buildArrangement())

function buildArrangement(): SectionRow[] {
  const all = props.definition.sections
  const order = props.form.section_order
  if (!order || !order.length) {
    return all.map((section) => ({ id: section.id, type: section.type, enabled: true }))
  }
  const byId = new Map(all.map((section) => [section.id, section]))
  const enabled: SectionRow[] = order
    .filter((id) => byId.has(id))
    .map((id) => ({ id, type: byId.get(id)!.type, enabled: true }))
  const enabledSet = new Set(order)
  const disabled: SectionRow[] = all
    .filter((section) => !enabledSet.has(section.id))
    .map((section) => ({ id: section.id, type: section.type, enabled: false }))
  return [...enabled, ...disabled]
}

function writeForm() {
  props.form.section_order = arrangement.value.filter((row) => row.enabled).map((row) => row.id)
}

function toggle(id: string) {
  const row = arrangement.value.find((item) => item.id === id)
  if (row) row.enabled = !row.enabled
  writeForm()
}

function move(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= arrangement.value.length) return
  const list = arrangement.value
  ;[list[index], list[target]] = [list[target], list[index]]
  writeForm()
}

function sectionMeta(type: SectionType) {
  return SECTION_META[type]
}

// Reconstroi quando o template muda ou quando o form é ressincronizado externamente.
watch(
  [() => props.definition.slug, () => props.form.section_order],
  () => {
    const currentEnabled = arrangement.value
      .filter((row) => row.enabled)
      .map((row) => row.id)
      .join(',')
    const formOrder = (props.form.section_order ?? []).join(',')
    if (currentEnabled !== formOrder) arrangement.value = buildArrangement()
  },
)

const palette = [
  '#d94f7a',
  '#e0245e',
  '#f59e0b',
  '#6d28d9',
  '#2563eb',
  '#3f7d5b',
  '#c9a227',
  '#26303b',
]

const speedOptions = [
  { value: '' as const, label: 'Padrão' },
  { value: 'slow' as const, label: 'Lenta' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'fast' as const, label: 'Rápida' },
]

const entranceOptions = [
  { value: '' as const, label: 'Padrão' },
  { value: 'fade' as const, label: 'Fade' },
  { value: 'slide-up' as const, label: 'Deslizar' },
  { value: 'zoom' as const, label: 'Zoom' },
]

const photoStyleOptions = [
  { value: '' as const, label: 'Padrão' },
  { value: 'slider' as const, label: 'Slider' },
  { value: 'gallery' as const, label: 'Galeria' },
  { value: 'mosaic' as const, label: 'Mosaico' },
  { value: 'polaroid' as const, label: 'Polaroid' },
]

const textStyleOptions = [
  { value: '' as const, label: 'Padrão' },
  { value: 'typewriter' as const, label: 'Digitação' },
]

const PHOTO_SECTIONS: SectionType[] = ['gallery', 'photoSlider']
const TEXT_SECTIONS: SectionType[] = ['hero', 'finalMessage', 'typewriter', 'messageSlider']

// photo_style/text_style só afetam os blocos da rolagem; nas experiências
// narrativas o próprio shell controla como fotos e textos aparecem.
const showPhotoStyle = computed(
  () => isScroll.value && props.definition.sections.some((s) => PHOTO_SECTIONS.includes(s.type)),
)

const showTextStyle = computed(
  () => isScroll.value && props.definition.sections.some((s) => TEXT_SECTIONS.includes(s.type)),
)

function applyStyle(style: TemplateStyle) {
  props.form.style_id = style.id
  props.form.color_primary = style.overrides.primaryColor
  props.form.animation_speed = style.overrides.speed
}

function clearStyle() {
  props.form.style_id = ''
}

function styleCardVars(style: TemplateStyle) {
  return {
    '--ap-c1': style.overrides.primaryColor,
    '--ap-c2': style.overrides.accentColor,
  } as Record<string, string>
}

function isSameColor(a: string, b: string): boolean {
  return a.toLowerCase() === (b || '').toLowerCase()
}
</script>

<style scoped>
.ap-context {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 22px;
  border-radius: var(--radius-md);
  background: var(--surface-3);
  border: 1px solid var(--border);
}
.ap-context__emoji {
  font-size: 1.2rem;
  line-height: 1;
}
.ap-context__text {
  font-size: 0.9rem;
  color: var(--text);
}
.ap-context__text strong {
  color: var(--ink);
}
.ap-context__hint {
  color: var(--muted);
}

.ap-section {
  margin-top: 26px;
}
.ap-section:first-of-type {
  margin-top: 4px;
}
.ap-title {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink);
}
.ap-hint {
  font-size: 0.86rem;
  color: var(--muted);
  margin: 2px 0 14px;
}

.ap-styles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.ap-style {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  overflow: hidden;
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.ap-style:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}
.ap-style--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.ap-style__swatches {
  display: flex;
  height: 34px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.ap-style__swatch {
  flex: 1;
}
.ap-style__swatch--1 {
  background: var(--ap-c1);
}
.ap-style__swatch--2 {
  background: var(--ap-c2);
}
.ap-style__label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
}
.ap-style--default {
  justify-content: center;
  align-items: flex-start;
}
.ap-style__emoji {
  font-size: 1.6rem;
}
.ap-style__desc {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--muted);
}
.ap-style__check {
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
  opacity: 0;
  transform: scale(0.6);
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.ap-style--active .ap-style__check {
  opacity: 1;
  transform: scale(1);
}

.ap-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.ap-color {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition:
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.ap-color:hover {
  transform: translateY(-2px);
}
.ap-color--active {
  box-shadow: 0 0 0 3px var(--primary-ring);
  border-color: #fff;
}
.ap-color--custom {
  display: grid;
  place-items: center;
  color: #fff;
  overflow: hidden;
}
.ap-color__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.ap-color__plus {
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.ap-speed {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  border-radius: var(--radius-pill);
  background: var(--surface-3);
  border: 1px solid var(--border);
}
.ap-speed__btn {
  border: none;
  background: transparent;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--muted);
  transition:
    background var(--dur) var(--ease),
    color var(--dur) var(--ease);
}
.ap-speed__btn:hover {
  color: var(--text);
}
.ap-speed__btn--active {
  background: var(--surface);
  color: var(--primary-strong);
  box-shadow: var(--shadow-xs);
}

/* Tipografia */
.ap-fonts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.ap-font {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  transition:
    border-color var(--dur) var(--ease),
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.ap-font:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}
.ap-font--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.ap-font__name {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--ink);
}
.ap-font__sample {
  font-size: 1.3rem;
  line-height: 1;
  color: var(--primary-strong);
}

/* Plano de fundo */
.ap-bgs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.ap-bg {
  position: relative;
  display: grid;
  place-items: center;
  height: 62px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  overflow: hidden;
  transition:
    transform var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.ap-bg:hover {
  transform: translateY(-2px);
}
.ap-bg--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.ap-bg__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #241820;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
}
.ap-bg__label--dark {
  color: #f6f1f4;
  background: rgba(0, 0, 0, 0.4);
}
.ap-bg--default .ap-bg__label {
  background: transparent;
  color: var(--ink);
}

/* Seções */
.ap-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ap-sec {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface);
  transition: opacity var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.ap-sec--off {
  opacity: 0.55;
}
.ap-sec__emoji {
  font-size: 1.2rem;
  line-height: 1;
}
.ap-sec__label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
}
.ap-sec__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ap-sec__move {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--muted);
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.ap-sec__move:hover:not(:disabled) {
  color: var(--primary-strong);
  border-color: var(--primary);
}
.ap-sec__move:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ap-sec__toggle {
  position: relative;
  width: 42px;
  height: 24px;
  margin-left: 4px;
  border: none;
  border-radius: 999px;
  background: var(--surface-3);
  cursor: pointer;
  transition: background var(--dur) var(--ease);
}
.ap-sec__toggle--on {
  background: var(--primary);
}
.ap-sec__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: transform var(--dur) var(--ease);
}
.ap-sec__toggle--on .ap-sec__knob {
  transform: translateX(18px);
}
.ap-note {
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--muted);
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--surface-3);
  border: 1px dashed var(--border-strong);
}
</style>
