<template>
  <div class="public-page min-h-screen py-6 px-4">
    <section v-if="loading" class="text-gray-500 text-center py-20">
      Carregando homenagem...
    </section>
    <section v-else-if="error" class="text-red-600 text-center py-20">{{ error }}</section>
    <div v-else-if="tribute" class="max-w-4xl mx-auto">
      <TributeLivePreview
        :public-data="tribute"
        readonly
        :show-viewport-tabs="false"
        :viewport-width="1280"
        compact
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicTribute, recordPublicView } from '@/api/tributes'
import type { PublicTribute } from '@/api/types'
import TributeLivePreview from '@/components/wizard/TributeLivePreview.vue'

const route = useRoute()
const tribute = ref<PublicTribute | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    tribute.value = await fetchPublicTribute(slug)
    const sessionId = getSessionId()
    await recordPublicView(slug, sessionId)
  } catch {
    error.value = 'Homenagem não encontrada ou indisponível.'
  } finally {
    loading.value = false
  }
})

function getSessionId(): string {
  const key = 'maylove_view_session'
  const existing = localStorage.getItem(key)
  if (existing) return existing

  const created = crypto.randomUUID()
  localStorage.setItem(key, created)
  return created
}
</script>

<style scoped>
.public-page {
  background:
    radial-gradient(circle at top, #fff4f7 0%, transparent 55%),
    #fbf7f8;
}
</style>
