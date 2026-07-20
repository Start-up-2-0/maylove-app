<template>
  <div class="rom-cards-preview">
    <article class="rom-cards-preview__card rom-cards-preview__card--hero">
      <div class="rom-cards-preview__hero-bg">
        <p class="rom-cards-preview__couple">{{ coupleLine }}</p>
        <p class="rom-cards-preview__theme">{{ themeLine }}</p>
        <div class="rom-cards-preview__mascot" aria-hidden="true">💘</div>

        <div v-if="showCountdown" class="rom-cards-preview__countdown">
          <div v-for="unit in countdownUnits" :key="unit.label" class="rom-cards-preview__countdown-cell">
            <span class="rom-cards-preview__countdown-value">{{ unit.value }}</span>
            <span class="rom-cards-preview__countdown-label">{{ unit.label }}</span>
          </div>
        </div>
      </div>
    </article>

    <article v-if="showMessageCard" class="rom-cards-preview__card">
      <header class="rom-cards-preview__card-head">
        <h3 class="rom-cards-preview__card-title">Nota de amor</h3>
        <span class="rom-cards-preview__pill-btn">Abrir</span>
      </header>
      <p class="rom-cards-preview__note">{{ messagePreview }}</p>
    </article>

    <article class="rom-cards-preview__card">
      <header class="rom-cards-preview__card-head">
        <h3 class="rom-cards-preview__card-title">{{ musicCardTitle }}</h3>
      </header>
      <p class="rom-cards-preview__music-status">{{ musicStatus }}</p>
      <div class="rom-cards-preview__player">
        <span class="rom-cards-preview__play" aria-hidden="true">▶</span>
        <div class="rom-cards-preview__track">
          <div class="rom-cards-preview__track-fill" :style="{ width: musicConfigured ? '38%' : '0%' }" />
        </div>
        <span class="rom-cards-preview__time">0:00</span>
      </div>
    </article>

    <article v-if="photoCount > 0" class="rom-cards-preview__card rom-cards-preview__card--photos">
      <header class="rom-cards-preview__card-head">
        <h3 class="rom-cards-preview__card-title">Fotos</h3>
        <span class="rom-cards-preview__pill-muted">{{ photoCount }} foto{{ photoCount === 1 ? '' : 's' }}</span>
      </header>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { romanceDisplayTitle } from '@/modules/romance-wizard/romanceCopy'
import type { RomanceExperienceId } from '@/modules/romance-wizard/romanceExperiences'
import { getRomanceExperience } from '@/modules/romance-wizard/romanceExperiences'

const props = withDefaults(
  defineProps<{
    form?: ReturnType<typeof useTributeWizard>['form']
    experienceId?: RomanceExperienceId | null
    photoCount?: number
  }>(),
  {
    form: undefined,
    experienceId: null,
    photoCount: 0,
  },
)

const experience = computed(() => getRomanceExperience(props.experienceId))

const coupleLine = computed(() => {
  const sender = props.form?.sender_name?.trim()
  const honoree = props.form?.honoree_name?.trim()
  if (sender && honoree) return `${sender} + ${honoree}`
  if (honoree) return honoree
  return 'Seu amor'
})

const themeLine = computed(() => {
  const title = props.form ? romanceDisplayTitle(props.form) : ''
  if (title && title !== coupleLine.value) return title.toUpperCase()
  return (experience.value?.label ?? 'Presente digital').toUpperCase()
})

const showCountdown = computed(() => {
  if (props.form?.special_date_config.enabled) return true
  const exp = experience.value
  return Boolean(exp?.steps.includes('special-date') || exp?.enableSpecialDateByDefault)
})

const countdownUnits = computed(() => {
  const cfg = props.form?.special_date_config
  if (!cfg?.date?.trim()) {
    return buildEmptyCountdown()
  }

  const target = parseDate(cfg.date, cfg.time)
  if (!target) return buildEmptyCountdown()

  const now = new Date()
  const diffMs =
    cfg.counter_mode === 'countdown'
      ? Math.max(0, target.getTime() - now.getTime())
      : Math.max(0, now.getTime() - target.getTime())

  return diffToUnits(diffMs)
})

const messagePreview = computed(() => {
  const raw = props.form?.message?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (raw) return raw
  return 'Sua mensagem aparecerá aqui enquanto você escreve.'
})

const showMessageCard = computed(() => Boolean(props.form))

const musicConfigured = computed(
  () =>
    props.form?.music_source !== 'none' &&
    (props.form?.music_track_id || (props.form?.music_duration_seconds ?? 0) > 0),
)

const musicStatus = computed(() =>
  musicConfigured.value ? 'Trilha sonora configurada' : 'Nenhuma música selecionada',
)

const musicCardTitle = computed(() =>
  experience.value?.id === 'playlist-casal' ? 'Playlist' : 'Trilha sonora',
)

function buildEmptyCountdown() {
  return [
    { label: 'ANOS', value: '–' },
    { label: 'MESES', value: '–' },
    { label: 'DIAS', value: '–' },
    { label: 'HORAS', value: '–' },
    { label: 'MIN', value: '–' },
    { label: 'SEG', value: '–' },
  ]
}

function parseDate(date: string, time?: string | null): Date | null {
  const iso = time?.trim() ? `${date}T${time}` : `${date}T00:00:00`
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function diffToUnits(diffMs: number) {
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

  return [
    { label: 'ANOS', value: String(years) },
    { label: 'MESES', value: String(months) },
    { label: 'DIAS', value: String(days) },
    { label: 'HORAS', value: String(hours) },
    { label: 'MIN', value: String(minutes) },
    { label: 'SEG', value: String(seconds) },
  ]
}
</script>

<style scoped>
.rom-cards-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 8px 14px;
  background: #f3ece2;
}
.rom-cards-preview__card {
  border: 2px solid #2f2a24;
  border-radius: 18px;
  background: #faf4ea;
  overflow: hidden;
}
.rom-cards-preview__card--hero {
  padding: 0;
}
.rom-cards-preview__hero-bg {
  position: relative;
  min-height: 168px;
  padding: 14px 12px 16px;
  background:
    radial-gradient(circle at 50% 20%, rgb(255 180 120 / 35%), transparent 55%),
    linear-gradient(180deg, #ffd8a8 0%, #f8c38b 45%, #e8a865 100%);
  text-align: center;
}
.rom-cards-preview__couple {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  text-shadow: 0 2px 8px rgb(0 0 0 / 25%);
}
.rom-cards-preview__theme {
  margin: 6px 0 0;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: rgb(255 255 255 / 92%);
}
.rom-cards-preview__mascot {
  margin: 10px auto 0;
  font-size: 2.4rem;
  line-height: 1;
  filter: drop-shadow(0 8px 12px rgb(0 0 0 / 18%));
}
.rom-cards-preview__countdown {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}
.rom-cards-preview__countdown-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  border-radius: 12px;
  background: rgb(20 20 20 / 72%);
  color: #fff;
}
.rom-cards-preview__countdown-value {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1;
}
.rom-cards-preview__countdown-label {
  margin-top: 4px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  opacity: 0.88;
}
.rom-cards-preview__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 14px 0;
}
.rom-cards-preview__card-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2f2a24;
}
.rom-cards-preview__pill-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 2px solid #2f2a24;
  background: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  color: #2f2a24;
}
.rom-cards-preview__pill-muted {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b6258;
}
.rom-cards-preview__note {
  margin: 12px 14px 16px;
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  border: 1.5px solid #ddd3c4;
  font-size: 0.84rem;
  line-height: 1.55;
  color: #3d3830;
}
.rom-cards-preview__music-status {
  margin: 10px 14px 0;
  font-size: 0.78rem;
  color: #6b6258;
}
.rom-cards-preview__player {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 14px;
}
.rom-cards-preview__play {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #f97316;
  color: #fff;
  font-size: 0.72rem;
  box-shadow: 0 8px 16px -8px rgb(249 115 22 / 80%);
}
.rom-cards-preview__track {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: #ddd3c4;
  overflow: hidden;
}
.rom-cards-preview__track-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #0ea5e9);
}
.rom-cards-preview__time {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b6258;
}
.rom-cards-preview__card--photos {
  padding-bottom: 14px;
}
</style>
