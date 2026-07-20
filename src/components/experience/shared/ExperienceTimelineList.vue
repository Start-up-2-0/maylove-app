<template>
  <section v-if="items.length" class="exp-section timeline-section" :class="rootClass">
    <div class="timeline-wrap">
      <p v-if="title" v-reveal class="exp-eyebrow timeline__eyebrow">{{ title }}</p>

      <ol class="timeline">
        <li v-for="(item, index) in items" :key="index" v-reveal="index * 80" class="timeline__item">
          <span class="timeline__marker" />
          <div class="timeline__card">
            <img v-if="item.photoUrl" :src="item.photoUrl" alt="" class="timeline__photo" loading="lazy" />
            <div class="timeline__body">
              <div v-if="item.date || item.location || emotionFor(item)" class="timeline__meta">
                <span v-if="item.date" class="timeline__date">{{ item.date }}</span>
                <span v-if="item.location" class="timeline__location">{{ item.location }}</span>
                <span v-if="emotionFor(item)" class="timeline__emotion">
                  <span aria-hidden="true">{{ emotionFor(item)!.icon }}</span>
                  {{ emotionFor(item)!.label }}
                </span>
              </div>
              <h3 class="timeline__title">{{ item.title }}</h3>
              <p v-if="item.description" class="timeline__desc">{{ item.description }}</p>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ExperienceTimelineItem } from '@/templates/types'
import { vReveal } from '@/composables/useReveal'
import { getEmotionDisplay } from '@/utils/timelineEmotions'

withDefaults(
  defineProps<{
    items: ExperienceTimelineItem[]
    title?: string
    rootClass?: string
  }>(),
  {
    title: 'Nossa história',
    rootClass: '',
  },
)

function emotionFor(item: ExperienceTimelineItem) {
  return getEmotionDisplay(item.emotion)
}
</script>

<style scoped>
.timeline-wrap {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}
.timeline__eyebrow {
  text-align: center;
  display: block;
  margin-bottom: 40px;
}
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: color-mix(in srgb, var(--exp-primary) 35%, transparent);
}
.timeline__item {
  position: relative;
  padding-left: 42px;
  margin-bottom: 26px;
}
.timeline__marker {
  position: absolute;
  left: 4px;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--exp-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--exp-primary) 22%, transparent);
}
.timeline__card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  background: var(--exp-surface);
  border: 1px solid var(--exp-border);
  box-shadow: 0 18px 38px -28px rgba(0, 0, 0, 0.4);
}
.timeline__photo {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 12px;
}
.timeline__date {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--exp-primary);
}
.timeline__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 4px;
}
.timeline__location {
  font-size: 0.82rem;
  color: var(--exp-muted);
}
.timeline__emotion {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--exp-primary) 12%, transparent);
  color: var(--exp-primary);
}
.timeline__title {
  font-size: 1.15rem;
  margin-top: 3px;
}
.timeline__desc {
  margin-top: 6px;
  color: var(--exp-muted);
  font-size: 0.95rem;
  line-height: 1.55;
}
@media (max-width: 480px) {
  .timeline__card {
    flex-direction: column;
    align-items: flex-start;
  }
  .timeline__photo {
    width: 100%;
    height: 150px;
  }
}
</style>
