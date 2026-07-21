<template>
  <div class="public-bouquet">
    <div v-if="loading" class="public-bouquet__loading">Carregando buquê...</div>
    <div v-else-if="error" class="public-bouquet__error">{{ error }}</div>

    <div v-else-if="bouquet" class="public-bouquet__layout">
      <BouquetLivePreview
        :stems="bouquet.stems"
        :wrap-color="bouquet.wrap_color"
        :recipient-name="bouquet.recipient_name"
        :sender-name="bouquet.sender_name"
        :letter-body="bouquet.letter_body"
        :letter-design="bouquet.letter_design"
        show-letter
      />
      <ShareBar :url="shareUrl" label="Compartilhar buquê" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicBouquet, recordBouquetView } from '@/api/bouquets'
import type { PublicDigitalBouquet } from '@/api/types'
import ShareBar from '@/components/experience/shared/ShareBar.vue'
import BouquetLivePreview from './components/BouquetLivePreview.vue'

const route = useRoute()
const slug = route.params.slug as string

const bouquet = ref<PublicDigitalBouquet | null>(null)
const loading = ref(true)
const error = ref('')

const shareUrl = computed(() => `${window.location.origin}/bouquet/${slug}`)

onMounted(async () => {
  try {
    bouquet.value = await fetchPublicBouquet(slug)
    const sessionId = sessionStorage.getItem('maylove_bouquet_session') ?? crypto.randomUUID()
    sessionStorage.setItem('maylove_bouquet_session', sessionId)
    await recordBouquetView(slug, sessionId).catch(() => undefined)
  } catch {
    error.value = 'Este buquê não foi encontrado.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.public-bouquet {
  min-height: 100vh;
  background: #faf6f0;
  padding: 24px 16px 40px;
}

.public-bouquet__layout {
  max-width: 720px;
  margin: 0 auto;
}

.public-bouquet__loading,
.public-bouquet__error {
  text-align: center;
  padding: 48px 16px;
  color: #8a7d74;
}
</style>
