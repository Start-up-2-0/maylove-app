<template>
  <div class="exp-sections">
    <template v-for="item in flowItems" :key="item.key">
      <SpecialDateBlock
        v-if="item.kind === 'special-date'"
        :content="content"
        :theme="theme"
        placement="after-cover"
      />
      <component
        :is="getSectionComponent(item.section.type)"
        v-else
        :section="item.section"
        :content="content"
        :theme="theme"
      />
    </template>

    <ExperienceTimelineList
      v-if="showInjectedTimeline"
      :items="content.timeline"
      root-class="scroll-timeline"
    />

    <EventInfoBlock :event-info="content.eventInfo" />

    <section v-if="showShare" class="exp-section exp-share">
      <div class="exp-container exp-share__inner">
        <p class="exp-eyebrow">Compartilhe esta homenagem</p>
        <ShareBar :url="shareUrl!" :text="content.title" />
        <QrCode v-if="showQr" :value="shareUrl!" label="Aponte a câmera" :color="theme.primaryColor" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutComponentProps, SectionInstance } from '@/templates/types'
import { getSectionComponent } from '@/templates/sections'
import ShareBar from '../shared/ShareBar.vue'
import QrCode from '../shared/QrCode.vue'
import SpecialDateBlock from '../shared/SpecialDateBlock.vue'
import ExperienceTimelineList from '../shared/ExperienceTimelineList.vue'
import EventInfoBlock from '../shared/EventInfoBlock.vue'
import { buildScrollFlowItems, filterSectionsForSpecialDate } from '@/utils/specialDate'
import { shouldShowTimelineModule } from '@/utils/tributeModules'
import { shouldShowShareQr, shouldShowShareSection } from '@/utils/shareSection'

const props = defineProps<LayoutComponentProps>()

const showShare = computed(() => shouldShowShareSection(props.mode, props.shareUrl))
const showQr = computed(() => shouldShowShareQr(props.content.modules, props.mode, props.shareUrl))

const orderedSections = computed<SectionInstance[]>(() => {
  const base = filterSectionsForSpecialDate(props.definition.sections, props.content)
  const order = props.content.sectionOrder
  if (!order || !order.length) return base
  const byId = new Map(base.map((section) => [section.id, section]))
  const picked = order
    .map((id) => byId.get(id))
    .filter((section): section is SectionInstance => Boolean(section))
  return picked.length ? picked : base
})

const flowItems = computed(() => buildScrollFlowItems(orderedSections.value, props.content))

const hasTimelineSection = computed(() =>
  orderedSections.value.some((section) => section.type === 'timeline'),
)

const showInjectedTimeline = computed(
  () =>
    !hasTimelineSection.value &&
    shouldShowTimelineModule(props.content.modules, props.content.timeline, 'scroll'),
)
</script>

<style scoped>
.exp-sections {
  position: relative;
}
.exp-share {
  text-align: center;
  border-top: 1px solid var(--exp-border);
}
.exp-share__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}
.scroll-timeline {
  padding-top: 0;
}
</style>
