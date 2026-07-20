<template>
  <div class="romance-wizard romance-launcher">
    <div class="romance-launcher__hero">
      <p class="romance-launcher__eyebrow">MayLov Romance</p>
      <h1 class="romance-launcher__title">Experiências românticas prontas para emocionar</h1>
      <p class="romance-launcher__sub">
        Escolha uma experiência, preencha só o essencial e publique — layout, animações e efeitos ficam por nossa conta.
      </p>
    </div>

    <section class="romance-launcher__cards">
      <div class="romance-launcher__grid romance-launcher__grid--experiences">
        <button
          v-for="experience in ROMANCE_EXPERIENCES"
          :key="experience.id"
          type="button"
          class="rom-experience-card"
          :class="{
            'rom-experience-card--soon': experience.product === 'coming_soon',
            'rom-experience-card--map': experience.product === 'map',
          }"
          :disabled="creating || experience.product === 'coming_soon'"
          @click="startExperience(experience.id)"
        >
          <span class="rom-experience-card__icon">{{ experience.icon }}</span>
          <strong class="rom-experience-card__label">{{ experience.label }}</strong>
          <span class="rom-experience-card__tagline">{{ experience.tagline }}</span>
          <span v-if="experience.product === 'coming_soon'" class="rom-experience-card__badge">Em breve</span>
          <span v-else-if="experience.product === 'map'" class="rom-experience-card__badge rom-experience-card__badge--map">
            Módulo Mapas
          </span>
        </button>
      </div>

      <p v-if="creating" class="romance-launcher__status">
        <span class="ml-spinner ml-spinner--sm" />
        Preparando sua experiência...
      </p>
      <p v-if="error" class="ml-alert ml-alert--danger">{{ error }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resolveApiError } from '@/api/errors'
import {
  ROMANCE_EXPERIENCES,
  type RomanceExperienceId,
  getRomanceExperience,
} from '@/modules/romance-wizard/romanceExperiences'
import { startRomanceExperience } from '@/modules/romance-wizard/romanceExperienceFlow'
import '@/modules/romance-wizard/styles/romance-wizard.css'

const router = useRouter()
const creating = ref(false)
const error = ref('')

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
      query: { step: result.firstStep, experience: experienceId },
    })
  } catch (err) {
    error.value = resolveApiError(err, 'Não foi possível iniciar a experiência.')
    creating.value = false
  }
}
</script>
