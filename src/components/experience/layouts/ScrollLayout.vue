<template>
  <div class="exp-sections">
    <component
      :is="getSectionComponent(section.type)"
      v-for="section in orderedSections"
      :key="section.id"
      :section="section"
      :content="content"
      :theme="theme"
    />

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

const props = defineProps<LayoutComponentProps>()

// Respeita a ordem/ativação de seções definida pelo usuário (content.sectionOrder).
// Sem customização, usa a ordem padrão do template.
const orderedSections = computed<SectionInstance[]>(() => {
  const all = props.definition.sections
  const order = props.content.sectionOrder
  if (!order || !order.length) return all
  const byId = new Map(all.map((section) => [section.id, section]))
  const picked = order
    .map((id) => byId.get(id))
    .filter((section): section is SectionInstance => Boolean(section))
  return picked.length ? picked : all
})
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
