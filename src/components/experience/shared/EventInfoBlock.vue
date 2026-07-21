<template>
  <section v-if="visible" class="exp-section event-info" v-reveal>
    <div class="event-info__card">
      <p class="exp-eyebrow event-info__eyebrow">Detalhes do evento</p>

      <p v-if="dateLabel" class="event-info__date">
        <span class="event-info__icon" aria-hidden="true">📅</span>
        {{ dateLabel }}
      </p>

      <p v-if="locationLabel" class="event-info__location">
        <span class="event-info__icon" aria-hidden="true">📍</span>
        {{ locationLabel }}
      </p>

      <a
        v-if="mapUrl"
        :href="mapUrl"
        class="event-info__map"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver no mapa
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExperienceEventInfo } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'

const props = defineProps<{
  eventInfo: ExperienceEventInfo | null
}>()

const dateLabel = computed(() => props.eventInfo?.date?.trim() || '')
const locationLabel = computed(() => props.eventInfo?.location?.trim() || '')
const mapUrl = computed(() => props.eventInfo?.mapUrl?.trim() || '')

const visible = computed(() => Boolean(dateLabel.value || locationLabel.value || mapUrl.value))
</script>

<style scoped>
.event-info {
  display: flex;
  justify-content: center;
  padding-inline: clamp(20px, 5vw, 40px);
}
.event-info__card {
  width: min(100%, 560px);
  padding: clamp(22px, 4vw, 32px);
  border-radius: 18px;
  background: var(--exp-surface);
  border: 1px solid var(--exp-border);
  box-shadow: 0 18px 38px -28px rgba(0, 0, 0, 0.35);
  text-align: center;
}
.event-info__eyebrow {
  margin-bottom: 14px;
}
.event-info__date,
.event-info__location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--exp-text);
}
.event-info__location {
  margin-top: 10px;
  color: var(--exp-muted);
}
.event-info__icon {
  flex-shrink: 0;
}
.event-info__map {
  display: inline-flex;
  margin-top: 18px;
  padding: 10px 18px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--exp-primary) 14%, transparent);
  color: var(--exp-primary);
  font-weight: 700;
  font-size: 0.92rem;
  text-decoration: none;
  transition: background 0.2s ease;
}
.event-info__map:hover {
  background: color-mix(in srgb, var(--exp-primary) 22%, transparent);
}
</style>
