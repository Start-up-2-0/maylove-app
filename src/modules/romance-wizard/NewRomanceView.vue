<template>
  <div class="romance-wizard romance-create">
    <header class="romance-create__top">
      <RouterLink to="/dashboard" class="romance-create__back">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Romances
      </RouterLink>
      <div class="romance-create__brand">
        <span class="romance-create__badge">Montamos para você</span>
        <h1 class="romance-create__title">Criar presente digital</h1>
      </div>
    </header>

    <div class="romance-create__shell">
      <div class="romance-create__main">
        <RomanceFormShell
          icon="💝"
          title="MayLov Romance"
          :prompt="coachPrompt"
        >
          <p class="romance-create__intro">{{ ROMANCE_BUILD_SUBLINE }}</p>

          <div class="romance-launcher__grid romance-launcher__grid--experiences">
            <button
              v-for="experience in ROMANCE_EXPERIENCES"
              :key="experience.id"
              type="button"
              class="rom-experience-card"
              :class="{
                'rom-experience-card--active': hoveredExperience === experience.id,
                'rom-experience-card--soon': experience.product === 'coming_soon',
                'rom-experience-card--map': experience.product === 'map',
              }"
              :disabled="creating || experience.product === 'coming_soon'"
              @click="startExperience(experience.id)"
              @mouseenter="hoveredExperience = experience.id"
              @focus="hoveredExperience = experience.id"
            >
              <span class="rom-experience-card__icon">{{ experience.icon }}</span>
              <strong class="rom-experience-card__label">{{ experience.label }}</strong>
              <span class="rom-experience-card__tagline">{{ experience.tagline }}</span>
              <span v-if="experience.product === 'coming_soon'" class="rom-experience-card__badge">Em breve</span>
              <span
                v-else-if="experience.product === 'map'"
                class="rom-experience-card__badge rom-experience-card__badge--map"
              >
                Módulo Mapas
              </span>
            </button>
          </div>

          <p v-if="creating" class="romance-launcher__status">
            <span class="ml-spinner ml-spinner--sm" />
            Preparando sua experiência...
          </p>
          <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>
        </RomanceFormShell>
      </div>

      <aside class="romance-create__aside">
        <RomancePhonePreview
          :experience-label="previewExperience ? `${previewExperience.icon} ${previewExperience.label}` : ''"
          :hint="previewExperience?.opening"
        >
          <RomancePreviewPlaceholder
            v-if="previewExperience"
            :icon="previewExperience.icon"
            :title="previewTitle"
            :message="previewMessage"
            :show-photo-slot="previewExperience.steps.includes('photos')"
          />
          <RomancePreviewPlaceholder
            v-else
            icon="✨"
            message="Escolha uma experiência à esquerda — montamos layout, animações e efeitos automaticamente."
            :show-photo-slot="false"
          />
        </RomancePhonePreview>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { resolveApiError } from '@/api/errors'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import RomancePhonePreview from '@/modules/romance-wizard/components/RomancePhonePreview.vue'
import RomancePreviewPlaceholder from '@/modules/romance-wizard/components/RomancePreviewPlaceholder.vue'
import {
  ROMANCE_EXPERIENCES,
  type RomanceExperienceId,
  getRomanceExperience,
} from '@/modules/romance-wizard/romanceExperiences'
import { ROMANCE_BUILD_SUBLINE } from '@/modules/romance-wizard/romanceBuildCopy'
import { defaultRomanceTitle } from '@/modules/romance-wizard/romanceCopy'
import { startRomanceExperience } from '@/modules/romance-wizard/romanceExperienceFlow'
import '@/modules/romance-wizard/styles/romance-wizard.css'

const router = useRouter()
const creating = ref(false)
const error = ref('')
const hoveredExperience = ref<RomanceExperienceId | null>(null)

const coachPrompt = 'Que tipo de presente você quer criar? Escolha uma experiência — nós montamos o resto.'

const previewExperience = computed(() => getRomanceExperience(hoveredExperience.value))

const previewTitle = computed(() => {
  const exp = previewExperience.value
  if (!exp) return ''
  return defaultRomanceTitle(exp.wizardTypeId, exp.id)
})

const previewMessage = computed(() => {
  const exp = previewExperience.value
  if (!exp) return ''
  return exp.description
})

async function startExperience(experienceId: RomanceExperienceId) {
  if (creating.value) return
  const experience = getRomanceExperience(experienceId)
  if (!experience) return

  if (experience.product === 'map') {
    await router.push('/dashboard/maps/new')
    return
  }
  if (experience.product === 'coming_soon') return

  creating.value = true
  error.value = ''
  try {
    const result = await startRomanceExperience(experienceId)
    await router.replace({
      path: `/dashboard/romances/${result.tributeId}/edit`,
      query: { step: result.firstStep, experience: experienceId, build: '1' },
    })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível iniciar a experiência.')
    creating.value = false
  }
}
</script>

<style scoped>
.romance-create {
  min-height: calc(100vh - 64px);
  padding: 0 clamp(12px, 2.5vw, 24px) 32px;
}
.romance-create__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-top: 8px;
}
.romance-create__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted);
  text-decoration: none;
}
.romance-create__back:hover {
  color: var(--ink);
}
.romance-create__brand {
  flex: 1;
  min-width: 200px;
}
.romance-create__badge {
  display: inline-block;
  margin-bottom: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rom-accent, #e11d48);
  background: color-mix(in srgb, var(--rom-accent, #e11d48) 10%, var(--surface));
}
.romance-create__title {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.85rem);
  font-weight: 700;
  color: var(--ink);
}
.romance-create__shell {
  display: grid;
  gap: 24px;
  align-items: start;
}
@media (min-width: 1024px) {
  .romance-create__shell {
    grid-template-columns: minmax(0, 520px) minmax(320px, 1fr);
    gap: 32px;
    max-width: 1180px;
  }
}
.romance-create__main {
  min-width: 0;
}
.romance-create__aside {
  min-width: 0;
  position: sticky;
  top: 20px;
}
.romance-create__intro {
  margin: 0 0 18px;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}
.rom-experience-card--active {
  border-color: var(--rom-accent, #e11d48);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--rom-accent, #e11d48) 18%, transparent),
    0 16px 40px -28px color-mix(in srgb, var(--rom-accent, #e11d48) 45%, transparent);
  transform: translateY(-2px);
}
</style>
