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

    <section v-if="mode === 'full' && shareUrl" class="exp-section exp-share">
      <div class="exp-container exp-share__inner">
        <p class="exp-eyebrow">Compartilhe esta homenagem</p>
        <ShareBar :url="shareUrl" :text="content.title" />
        <QrCode :value="shareUrl" label="Aponte a câmera" :color="theme.primaryColor" />
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
import { buildScrollFlowItems, filterSectionsForSpecialDate } from '@/utils/specialDate'

const props = defineProps<LayoutComponentProps>()

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
</style>
