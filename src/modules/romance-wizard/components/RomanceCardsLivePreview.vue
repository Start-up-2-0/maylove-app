<template>
  <div
    class="rom-live-preview"
    :class="`rom-live-preview--${theme.previewVariant}`"
    :style="themeStyleVars"
  >
    <header class="rom-live-preview__topbar">
      <span class="rom-live-preview__topbar-back" aria-hidden="true">‹</span>
      <span class="rom-live-preview__topbar-brand">{{ topbarBrand }}</span>
      <span class="rom-live-preview__topbar-search" aria-hidden="true">⌕</span>
    </header>

    <section class="rom-live-preview__hero">
      <div
        class="rom-live-preview__hero-bg"
        :style="heroBackgroundStyle"
      />
      <div class="rom-live-preview__hero-shade" />

      <div class="rom-live-preview__hero-body">
        <p class="rom-live-preview__kicker">{{ seriesKicker }}</p>
        <h2 class="rom-live-preview__couple">{{ coupleHeadline }}</h2>

        <div class="rom-live-preview__meta">
          <span>Capítulo 1</span>
          <span aria-hidden="true">•</span>
          <span>❤️ 10</span>
          <span v-if="relationshipLabel" aria-hidden="true">•</span>
          <span v-if="relationshipLabel">{{ relationshipLabel }}</span>
          <span aria-hidden="true">•</span>
          <span class="rom-live-preview__hd">HD</span>
        </div>

        <p v-if="subtitleLine" class="rom-live-preview__subtitle">{{ subtitleLine }}</p>
        <p v-if="messageLine && currentStep === 'message'" class="rom-live-preview__message">
          {{ messageLine }}
        </p>

        <div v-if="showCountdownPill" class="rom-live-preview__countdown-pill">
          {{ countdownPillText }}
        </div>

        <div class="rom-live-preview__actions">
          <span class="rom-live-preview__btn rom-live-preview__btn--primary">
            ▶ {{ musicConfigured ? 'Ouvir' : 'Play' }}
          </span>
          <span class="rom-live-preview__btn">ⓘ Mais info</span>
        </div>

        <p v-if="stepHint" class="rom-live-preview__step-hint">{{ stepHint }}</p>
      </div>
    </section>

    <nav class="rom-live-preview__tabs" aria-hidden="true">
      <span class="rom-live-preview__tab rom-live-preview__tab--active">Início</span>
      <span class="rom-live-preview__tab">Fotos</span>
      <span class="rom-live-preview__tab">Carta</span>
      <span class="rom-live-preview__tab">Episódios</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { romanceDisplayTitle } from '@/modules/romance-wizard/romanceCopy'
import type { RomanceExperienceId, RomanceExperienceStepId } from '@/modules/romance-wizard/romanceExperiences'
import { getRomanceExperience } from '@/modules/romance-wizard/romanceExperiences'
import { resolveRomanceTheme } from '@/modules/romance-wizard/romanceThemes'

const props = withDefaults(
  defineProps<{
    form?: ReturnType<typeof useTributeWizard>['form']
    experienceId?: RomanceExperienceId | null
    photos?: TributeMedia[]
    currentStep?: RomanceExperienceStepId | null
  }>(),
  {
    form: undefined,
    experienceId: null,
    photos: () => [],
    currentStep: null,
  },
)

const experience = computed(() => getRomanceExperience(props.experienceId))

const theme = computed(() =>
  resolveRomanceTheme({
    themeId: props.form?.romance_theme_id,
    presentationId: props.form?.presentation,
    defaultThemeId: experience.value?.defaultThemeId,
  }),
)

const themeStyleVars = computed(() => ({
  '--rom-theme-accent': theme.value.accent ?? theme.value.gradient[0],
  '--rom-theme-from': theme.value.gradient[0],
  '--rom-theme-to': theme.value.gradient[1],
}))

const topbarBrand = computed(() => {
  if (theme.value.previewVariant === 'spotify') return 'MayLov Music'
  if (theme.value.previewVariant === 'netflix') return 'MayLov'
  return 'MayLov'
})

const senderName = computed(() => props.form?.sender_name?.trim() ?? '')
const honoreeName = computed(() => props.form?.honoree_name?.trim() ?? '')

const coupleHeadline = computed(() => {
  if (senderName.value && honoreeName.value) {
    return `${senderName.value.toUpperCase()} & ${honoreeName.value.toUpperCase()}`
  }
  if (honoreeName.value) return honoreeName.value.toUpperCase()
  if (senderName.value) return senderName.value.toUpperCase()
  return 'SEU AMOR'
})

const seriesKicker = computed(() => {
  if (props.currentStep === 'theme') return `Tema · ${theme.value.label}`
  const label = experience.value?.label ?? 'Presente digital'
  if (theme.value.previewVariant === 'netflix') return `Nossa série original · ${label}`
  if (theme.value.previewVariant === 'spotify') return 'Playlist do casal'
  if (theme.value.previewVariant === 'envelope') return 'Carta especial'
  return theme.value.label
})

const subtitleLine = computed(() => {
  const title = props.form ? romanceDisplayTitle(props.form) : ''
  if (title) return title
  if (props.currentStep === 'message') return 'Sua mensagem especial aparece aqui'
  return experience.value?.tagline ?? 'O início do nosso para sempre'
})

const messageLine = computed(() => {
  const raw = props.form?.message?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!raw) return ''
  return raw.length > 120 ? `${raw.slice(0, 117)}...` : raw
})

const heroPhotoUrl = computed(() => {
  const first = props.photos[0]
  if (!first) return null
  return first.url ?? first.url_thumbnail ?? null
})

const heroBackgroundStyle = computed(() => {
  const style: Record<string, string> = {}
  if (heroPhotoUrl.value) {
    style.backgroundImage = `url(${heroPhotoUrl.value})`
  }
  return style
})

const now = ref(Date.now())
let countdownTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  countdownTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

const showCountdownPill = computed(() => {
  const cfg = props.form?.special_date_config
  if (cfg?.enabled && cfg.date?.trim()) return true
  return props.currentStep === 'recipient'
})

const countdownPillText = computed(() => {
  const cfg = props.form?.special_date_config
  if (!cfg?.date?.trim()) {
    return '❤️ Defina a data do relacionamento'
  }

  const target = parseDate(cfg.date, cfg.time)
  if (!target) return '❤️ Data especial'

  const diffMs =
    cfg.counter_mode === 'countdown'
      ? Math.max(0, target.getTime() - now.value)
      : Math.max(0, now.value - target.getTime())

  const parts = diffToRelationshipParts(diffMs)
  return `❤️ ${parts.years} anos • ${parts.months} mês${parts.months === 1 ? '' : 'es'} • ${parts.days} dia${parts.days === 1 ? '' : 's'} • ${parts.hours}h • ${parts.minutes}m • ${parts.seconds}s de puro amor`
})

const relationshipLabel = computed(() => {
  const cfg = props.form?.special_date_config
  if (!cfg?.enabled || !cfg.date?.trim()) return ''
  const target = parseDate(cfg.date, cfg.time)
  if (!target) return ''

  const diffMs = Math.max(0, now.value - target.getTime())
  const parts = diffToRelationshipParts(diffMs)
  if (parts.years > 0) return `${parts.years} ano${parts.years === 1 ? '' : 's'}, ${parts.months} mês${parts.months === 1 ? '' : 'es'}`
  if (parts.months > 0) return `${parts.months} mês${parts.months === 1 ? '' : 'es'}, ${parts.days} dia${parts.days === 1 ? '' : 's'}`
  return `${parts.days} dia${parts.days === 1 ? '' : 's'}`
})

const musicConfigured = computed(
  () =>
    props.form?.music_source !== 'none' &&
    (Boolean(props.form?.music_track_id) || (props.form?.music_duration_seconds ?? 0) > 0),
)

const stepHint = computed(() => {
  switch (props.currentStep) {
    case 'photos':
      return props.photos.length > 0
        ? `${props.photos.length} foto${props.photos.length === 1 ? '' : 's'} no álbum`
        : 'Adicione fotos para aparecerem no fundo'
    case 'music':
      return musicConfigured.value ? 'Trilha sonora configurada' : 'Escolha a música de fundo'
    case 'video':
      return props.form?.video_url?.trim() ? 'Vídeo adicionado' : 'Cole o link do vídeo'
    case 'chapters':
      return 'Capítulos da história de vocês'
    case 'theme':
      return `Visual ${theme.value.label}`
    case 'effects':
      return 'Efeitos visuais na experiência'
    default:
      return ''
  }
})

function parseDate(date: string, time?: string | null): Date | null {
  const iso = time?.trim() ? `${date}T${time}` : `${date}T00:00:00`
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function diffToRelationshipParts(diffMs: number) {
  const totalSeconds = Math.floor(diffMs / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)
  const days = totalDays % 30
  const months = Math.floor(totalDays / 30) % 12
  const years = Math.floor(totalDays / 365)

  return { years, months, days, hours, minutes, seconds }
}
</script>

<style scoped>
.rom-live-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  background: #0b0b0f;
  color: #fff;
  --rom-theme-accent: #e50914;
  --rom-theme-from: #450a0a;
  --rom-theme-to: #0b0b0f;
}
.rom-live-preview__hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--rom-theme-accent) 28%, transparent), transparent 55%),
    linear-gradient(180deg, var(--rom-theme-from) 0%, var(--rom-theme-to) 100%);
  background-size: cover;
  background-position: center;
}
.rom-live-preview--spotify {
  background: #121212;
}
.rom-live-preview--spotify .rom-live-preview__hero-bg {
  background:
    radial-gradient(circle at 20% 10%, rgb(29 185 84 / 35%), transparent 45%),
    linear-gradient(180deg, #1a1a1a 0%, #121212 100%);
}
.rom-live-preview--spotify .rom-live-preview__btn--primary {
  background: #1db954;
  color: #111;
}
.rom-live-preview--spotify .rom-live-preview__countdown-pill {
  background: rgb(29 185 84 / 16%);
  border-color: rgb(29 185 84 / 35%);
  color: #bbf7d0;
}
.rom-live-preview--cinema {
  background: #0a0806;
}
.rom-live-preview--cinema .rom-live-preview__hero-bg {
  background:
    radial-gradient(circle at 50% 0%, rgb(201 162 39 / 28%), transparent 50%),
    linear-gradient(180deg, #1a1208 0%, #090706 100%);
}
.rom-live-preview--cinema .rom-live-preview__btn--primary {
  background: #c9a227;
  color: #111;
}
.rom-live-preview--floral,
.rom-live-preview--bouquet,
.rom-live-preview--gift {
  background: #fff7fb;
  color: #4a1025;
}
.rom-live-preview--floral .rom-live-preview__topbar,
.rom-live-preview--bouquet .rom-live-preview__topbar,
.rom-live-preview--gift .rom-live-preview__topbar {
  color: #831843;
}
.rom-live-preview--floral .rom-live-preview__hero-shade,
.rom-live-preview--bouquet .rom-live-preview__hero-shade,
.rom-live-preview--gift .rom-live-preview__hero-shade {
  background: linear-gradient(180deg, rgb(255 255 255 / 10%) 0%, rgb(255 241 246 / 92%) 100%);
}
.rom-live-preview--floral .rom-live-preview__meta,
.rom-live-preview--floral .rom-live-preview__subtitle,
.rom-live-preview--floral .rom-live-preview__kicker,
.rom-live-preview--bouquet .rom-live-preview__meta,
.rom-live-preview--bouquet .rom-live-preview__subtitle,
.rom-live-preview--bouquet .rom-live-preview__kicker,
.rom-live-preview--gift .rom-live-preview__meta,
.rom-live-preview--gift .rom-live-preview__subtitle,
.rom-live-preview--gift .rom-live-preview__kicker {
  color: #831843;
}
.rom-live-preview--floral .rom-live-preview__couple,
.rom-live-preview--bouquet .rom-live-preview__couple,
.rom-live-preview--gift .rom-live-preview__couple {
  color: #881337;
  text-shadow: none;
}
.rom-live-preview--floral .rom-live-preview__btn,
.rom-live-preview--bouquet .rom-live-preview__btn,
.rom-live-preview--gift .rom-live-preview__btn {
  background: rgb(225 29 72 / 12%);
  color: #881337;
}
.rom-live-preview--floral .rom-live-preview__btn--primary,
.rom-live-preview--bouquet .rom-live-preview__btn--primary,
.rom-live-preview--gift .rom-live-preview__btn--primary {
  background: #e11d48;
  color: #fff;
}
.rom-live-preview--floral .rom-live-preview__tabs,
.rom-live-preview--bouquet .rom-live-preview__tabs,
.rom-live-preview--gift .rom-live-preview__tabs {
  background: rgb(255 255 255 / 72%);
  border-top-color: rgb(225 29 72 / 12%);
}
.rom-live-preview--floral .rom-live-preview__tab,
.rom-live-preview--bouquet .rom-live-preview__tab,
.rom-live-preview--gift .rom-live-preview__tab {
  color: rgb(136 19 55 / 45%);
}
.rom-live-preview--floral .rom-live-preview__tab--active,
.rom-live-preview--bouquet .rom-live-preview__tab--active,
.rom-live-preview--gift .rom-live-preview__tab--active {
  color: #881337;
}
.rom-live-preview--envelope {
  background: #fff8ef;
  color: #5c3d2e;
}
.rom-live-preview--envelope .rom-live-preview__hero-shade {
  background: linear-gradient(180deg, rgb(255 255 255 / 8%) 0%, rgb(255 248 239 / 92%) 100%);
}
.rom-live-preview--envelope .rom-live-preview__couple {
  color: #7c2d12;
  text-shadow: none;
}
.rom-live-preview--polaroid {
  background: #f8fafc;
  color: #334155;
}
.rom-live-preview--polaroid .rom-live-preview__hero-body {
  margin: 12px;
  padding: 10px 10px 14px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 24px -16px rgb(15 23 42 / 35%);
}
.rom-live-preview--polaroid .rom-live-preview__couple {
  color: #0f172a;
  text-shadow: none;
}
.rom-live-preview--book {
  background: #0f2918;
}
.rom-live-preview--book .rom-live-preview__hero-bg {
  background:
    radial-gradient(circle at 50% 0%, rgb(34 197 94 / 22%), transparent 50%),
    linear-gradient(180deg, #14532d 0%, #052e16 100%);
}
.rom-live-preview--disney {
  background: #1e1b4b;
}
.rom-live-preview--disney .rom-live-preview__hero-bg {
  background:
    radial-gradient(circle at 50% 0%, rgb(129 140 248 / 30%), transparent 52%),
    linear-gradient(180deg, #312e81 0%, #1e1b4b 100%);
}
.rom-live-preview--treasure {
  background: #1c1404;
}
.rom-live-preview--treasure .rom-live-preview__hero-bg {
  background:
    radial-gradient(circle at 50% 0%, rgb(234 179 8 / 24%), transparent 50%),
    linear-gradient(180deg, #422006 0%, #1c1404 100%);
}
.rom-live-preview--diary {
  background: #f5f3ff;
  color: #4c1d95;
}
.rom-live-preview--diary .rom-live-preview__hero-shade {
  background: linear-gradient(180deg, rgb(255 255 255 / 10%) 0%, rgb(245 243 255 / 92%) 100%);
}
.rom-live-preview--diary .rom-live-preview__couple {
  color: #5b21b6;
  text-shadow: none;
}
.rom-live-preview--retrospective,
.rom-live-preview--curtain,
.rom-live-preview--cassette {
  background: #0b0b0f;
}
.rom-live-preview__topbar {
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 8px;
  background: linear-gradient(180deg, rgb(0 0 0 / 72%), transparent);
  z-index: 2;
}
.rom-live-preview__topbar-back,
.rom-live-preview__topbar-search {
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.9;
}
.rom-live-preview__topbar-brand {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.rom-live-preview__hero {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.rom-live-preview__hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(0 0 0 / 15%) 0%,
    rgb(0 0 0 / 35%) 42%,
    rgb(0 0 0 / 88%) 100%
  );
}
.rom-live-preview__hero-body {
  position: relative;
  z-index: 1;
  padding: 0 14px 12px;
}
.rom-live-preview__kicker {
  margin: 0 0 8px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 72%);
}
.rom-live-preview__couple {
  margin: 0;
  font-size: clamp(1.15rem, 4.8vw, 1.45rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: 0.02em;
  text-shadow: 0 4px 18px rgb(0 0 0 / 45%);
}
.rom-live-preview__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.62rem;
  font-weight: 700;
  color: rgb(255 255 255 / 82%);
}
.rom-live-preview__hd {
  padding: 1px 5px;
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 3px;
  font-size: 0.56rem;
  letter-spacing: 0.06em;
}
.rom-live-preview__subtitle {
  margin: 10px 0 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgb(255 255 255 / 92%);
}
.rom-live-preview__message {
  margin: 8px 0 0;
  font-size: 0.68rem;
  line-height: 1.45;
  color: rgb(255 255 255 / 78%);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rom-live-preview__countdown-pill {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--rom-theme-accent) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--rom-theme-accent) 35%, transparent);
  font-size: 0.58rem;
  font-weight: 700;
  line-height: 1.35;
  color: color-mix(in srgb, var(--rom-theme-accent) 65%, #fff);
}
.rom-live-preview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.rom-live-preview__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  background: rgb(255 255 255 / 16%);
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
}
.rom-live-preview__btn--primary {
  background: #fff;
  color: #111;
}
.rom-live-preview__step-hint {
  margin: 10px 0 0;
  font-size: 0.62rem;
  font-weight: 600;
  color: rgb(255 255 255 / 58%);
}
.rom-live-preview__tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 8px 10px 10px;
  border-top: 1px solid rgb(255 255 255 / 8%);
  background: rgb(0 0 0 / 55%);
}
.rom-live-preview__tab {
  text-align: center;
  font-size: 0.56rem;
  font-weight: 700;
  color: rgb(255 255 255 / 45%);
}
.rom-live-preview__tab--active {
  color: #fff;
}
</style>
