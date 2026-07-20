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
      <div class="romance-picker">
        <button
          v-for="experience in ROMANCE_EXPERIENCES"
          :key="experience.id"
          type="button"
          class="rom-experience-card rom-experience-card--picker"
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
          <div class="rom-experience-card__copy">
            <strong class="rom-experience-card__label">{{ experience.label }}</strong>
            <span class="rom-experience-card__tagline">{{ experience.tagline }}</span>
          </div>
          <span v-if="experience.product === 'coming_soon'" class="rom-experience-card__badge">Em breve</span>
          <span
            v-else-if="experience.product === 'map'"
            class="rom-experience-card__badge rom-experience-card__badge--map"
          >
            Mapas
          </span>
          <span v-else class="rom-experience-card__chevron" aria-hidden="true">→</span>
        </button>
      </div>

      <p v-if="creating" class="romance-launcher__status">
        <span class="ml-spinner ml-spinner--sm" />
        Preparando sua experiência...
      </p>
      <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>
    </RomanceFormShell>

    <template #preview>
      <RomancePhonePreview
        compact
        :experience-label="previewExperience ? `${previewExperience.icon} ${previewExperience.label}` : ''"
        :hint="previewExperience?.opening"
        :experience-name="previewExperience?.label"
        :experience-icon="previewExperience?.icon ?? '✨'"
        :step-current="1"
        :step-total="previewExperience?.steps.length ?? 0"
      >
        <RomanceCardsLivePreview
          :experience-id="hoveredExperience"
        />
      </RomancePhonePreview>
    </template>
  </RomanceBuildShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
const error = ref('')
const hoveredExperience = ref<RomanceExperienceId | null>(null)

const previewExperience = computed(() => getRomanceExperience(hoveredExperience.value))

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
.romance-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
