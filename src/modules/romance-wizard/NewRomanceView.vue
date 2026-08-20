<template>
  <RomanceBuildShell
    :title="ROMANCE_BUILD_HEADLINE"
    :subtitle="ROMANCE_BUILD_SUBLINE"
    back-href="/dashboard"
    back-label="Romances"
  >
    <RomanceFormShell
      :title="ROMANCE_LOVE_CARDS_TAGLINE"
      :prompt="ROMANCE_PICKER_PROMPT"
      coach-large
    >
      <section
        v-for="group in experienceGroups"
        :key="group.id"
        class="romance-picker-group"
        :aria-labelledby="`romance-group-${group.id}`"
      >
        <header class="romance-picker-group__head">
          <div>
            <h3 :id="`romance-group-${group.id}`">{{ group.label }}</h3>
            <p>{{ group.description }}</p>
          </div>
        </header>

        <div class="romance-picker">
        <button
          v-for="experience in group.items"
          :key="experience.id"
          type="button"
          class="rom-experience-card rom-experience-card--picker"
          :class="{
            'rom-experience-card--active': hoveredExperience === experience.id,
            'rom-experience-card--soon': experience.product === 'coming_soon',
            'rom-experience-card--map': experience.product === 'map',
            'rom-experience-card--bouquet': experience.product === 'bouquet',
          }"
          :disabled="creating || experience.product === 'coming_soon'"
          @click="startExperience(experience.id)"
          @mouseenter="hoveredExperience = experience.id"
          @focus="hoveredExperience = experience.id"
        >
          <span class="rom-experience-card__icon">{{ experience.icon }}</span>
          <div class="rom-experience-card__copy">
            <strong class="rom-experience-card__label">{{ experience.label }}</strong>
            <span class="rom-experience-card__tagline">{{ experience.tagline }}</span>
            <span class="rom-experience-card__description">{{ experience.description }}</span>
            <span v-if="experience.requirements?.length" class="rom-experience-card__requirements">
              Você vai precisar de: {{ experience.requirements.join(' · ') }}
            </span>
          </div>
          <span v-if="experience.product === 'coming_soon'" class="rom-experience-card__badge">Em breve</span>
          <span
            v-else-if="experience.product === 'map'"
            class="rom-experience-card__badge rom-experience-card__badge--map"
          >
            Abre Mapas
          </span>
          <span
            v-else-if="experience.product === 'bouquet'"
            class="rom-experience-card__badge rom-experience-card__badge--bouquet"
          >
            Abre Buquês
          </span>
          <span v-else class="rom-experience-card__chevron" aria-hidden="true">→</span>
        </button>
        </div>
      </section>

      <p v-if="creating" class="romance-launcher__status">
        <span class="ml-spinner ml-spinner--sm" />
        <span>
          <strong>Criando {{ creatingExperienceLabel }}...</strong>
          {{ creationSlow ? 'Está demorando mais que o esperado, mas continuamos tentando. Não clique novamente.' : 'Isso pode levar alguns segundos.' }}
        </span>
      </p>
      <div v-if="error" class="ml-alert ml-alert--danger romance-launcher__error">
        <p>{{ error }}</p>
        <button
          v-if="lastExperienceId"
          type="button"
          class="ml-btn ml-btn--secondary ml-btn--sm"
          @click="startExperience(lastExperienceId)"
        >
          Tentar novamente
        </button>
      </div>
    </RomanceFormShell>

    <template #preview>
      <RomancePhonePreview>
        <RomanceCardsLivePreview :experience-id="hoveredExperience" />
      </RomancePhonePreview>
    </template>  </RomanceBuildShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { resolveApiError } from '@/api/errors'
import RomanceBuildShell from '@/modules/romance-wizard/components/RomanceBuildShell.vue'
import RomanceFormShell from '@/modules/romance-wizard/components/RomanceFormShell.vue'
import RomancePhonePreview from '@/modules/romance-wizard/components/RomancePhonePreview.vue'
import RomanceCardsLivePreview from '@/modules/romance-wizard/components/RomanceCardsLivePreview.vue'
import {
  ROMANCE_EXPERIENCES,
  type RomanceExperienceId,
  getRomanceExperience,
} from '@/modules/romance-wizard/romanceExperiences'
import {
  ROMANCE_BUILD_HEADLINE,
  ROMANCE_BUILD_SUBLINE,
  ROMANCE_LOVE_CARDS_TAGLINE,
  ROMANCE_PICKER_PROMPT,
} from '@/modules/romance-wizard/romanceBuildCopy'
import { startRomanceExperience } from '@/modules/romance-wizard/romanceExperienceFlow'
import '@/modules/romance-wizard/styles/romance-wizard.css'

const router = useRouter()
const creating = ref(false)
const creationSlow = ref(false)
const error = ref('')
const hoveredExperience = ref<RomanceExperienceId | null>(null)
const creatingExperienceId = ref<RomanceExperienceId | null>(null)
const lastExperienceId = ref<RomanceExperienceId | null>(null)
let slowTimer: number | null = null

const experienceGroups = computed(() => [
  {
    id: 'tributes',
    label: 'Homenagens personalizadas',
    description: 'Experiências criadas e publicadas dentro do editor de Romances.',
    items: ROMANCE_EXPERIENCES.filter((item) => item.product === 'tribute'),
  },
  {
    id: 'special',
    label: 'Formatos especiais',
    description: 'Abrem criadores próprios, com etapas e personalização diferentes.',
    items: ROMANCE_EXPERIENCES.filter((item) => item.product === 'map' || item.product === 'bouquet'),
  },
  {
    id: 'soon',
    label: 'Em breve',
    description: 'Ideias planejadas que ainda não podem ser criadas.',
    items: ROMANCE_EXPERIENCES.filter((item) => item.product === 'coming_soon'),
  },
].filter((group) => group.items.length))

const creatingExperienceLabel = computed(
  () => getRomanceExperience(creatingExperienceId.value)?.label ?? 'sua experiência',
)

function clearSlowTimer() {
  if (slowTimer !== null) window.clearTimeout(slowTimer)
  slowTimer = null
}

async function startExperience(experienceId: RomanceExperienceId) {
  if (creating.value) return
  const experience = getRomanceExperience(experienceId)
  if (!experience) return

  if (experience.product === 'map') {
    await router.push('/dashboard/maps/new')
    return
  }
  if (experience.product === 'bouquet') {
    await router.push('/dashboard/bouquets/new')
    return
  }
  if (experience.product === 'coming_soon') return

  creating.value = true
  creationSlow.value = false
  creatingExperienceId.value = experienceId
  lastExperienceId.value = experienceId
  error.value = ''
  clearSlowTimer()
  slowTimer = window.setTimeout(() => {
    creationSlow.value = true
  }, 4000)
  try {
    const result = await startRomanceExperience(experienceId)
    await router.replace({
      path: `/dashboard/romances/${result.tributeId}/edit`,
      query: { step: result.firstStep, experience: experienceId, build: '1' },
    })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível iniciar a experiência.')
    creating.value = false
    creatingExperienceId.value = null
  } finally {
    clearSlowTimer()
  }
}

onBeforeUnmount(clearSlowTimer)
</script>

<style scoped>
.romance-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.romance-picker-group + .romance-picker-group { margin-top: 28px; }
.romance-picker-group__head { margin-bottom: 12px; }
.romance-picker-group__head h3 { margin: 0; font-size: 1rem; color: var(--ink); }
.romance-picker-group__head p { margin: 4px 0 0; color: var(--muted); font-size: 0.84rem; }
.rom-experience-card__description,
.rom-experience-card__requirements { display: block; margin-top: 5px; font-size: 0.76rem; line-height: 1.35; }
.rom-experience-card__description { color: var(--muted); }
.rom-experience-card__requirements { color: var(--ink); font-weight: 600; }
.romance-launcher__status { align-items: flex-start; }
.romance-launcher__status > span:last-child { display: grid; gap: 3px; }
.romance-launcher__error { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.romance-launcher__error p { margin: 0; }
</style>
