<template>
  <div class="tribute-live-preview">
    <div v-if="showViewportTabs" class="mb-4">
      <FwbTabs v-model="activeViewport" variant="underline">
        <FwbTab name="375" title="Mobile" />
        <FwbTab name="768" title="Tablet" />
        <FwbTab name="1280" title="Desktop" />
      </FwbTabs>
    </div>

    <section v-if="loading" class="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
      <FwbSpinner size="8" class="mr-3" />
      Carregando preview...
    </section>

    <section v-else-if="loadError" class="text-red-600 text-sm py-4">{{ loadError }}</section>

    <div v-else class="preview-viewport-wrap overflow-x-auto pb-2">
      <EnvelopeFrame :auto-open="!compact">
        <article
          class="preview-viewport-frame tribute-preview-content p-5"
          :style="frameStyle"
        >
          <div
            class="rounded-xl p-5"
            :style="{
              borderTop: `4px solid ${accent}`,
              background: `radial-gradient(circle at top, color-mix(in srgb, ${accent} 14%, white), transparent 60%)`,
            }"
          >
            <p class="text-xs font-bold uppercase tracking-widest mb-2" :style="{ color: accent }">
              {{ typeName }}
            </p>
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ displayTitle }}
            </h3>
            <p v-if="displaySubtitle" class="text-gray-600 dark:text-gray-300 mb-3">
              {{ displaySubtitle }}
            </p>
            <p v-if="displayMessage" class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {{ displayMessage }}
            </p>
          </div>

          <div v-if="photos.length" class="grid gap-3 mt-4">
            <img
              v-for="photo in photos"
              :key="photo.id"
              :src="photo.url || photo.url_thumbnail || ''"
              alt=""
              class="w-full rounded-xl object-cover max-h-72"
            />
          </div>

          <footer class="mt-5 text-center text-gray-500 dark:text-gray-400 text-sm space-y-3">
            <p>{{ displayClosing }}</p>
            <FwbButton
              v-if="musicUrl"
              color="alternative"
              size="sm"
              @click="toggle"
            >
              {{ playing ? 'Pausar música' : blocked ? 'Toque para ouvir' : 'Ouvir música' }}
            </FwbButton>
            <p v-if="readonly && viewsCount !== null" class="text-xs">
              {{ viewsCount }} visualizações
            </p>
          </footer>
        </article>
      </EnvelopeFrame>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FwbButton, FwbSpinner, FwbTab, FwbTabs } from 'flowbite-vue'
import { fetchPreviewData } from '@/api/tributes'
import type { PublicTribute, TributeDetail, TributeMedia } from '@/api/types'
import type { useTributeWizard } from '@/composables/useTributeWizard'
import { useTributeAudio } from '@/composables/useTributeAudio'
import EnvelopeFrame from './EnvelopeFrame.vue'

const props = withDefaults(
  defineProps<{
    tributeId?: string
    form?: ReturnType<typeof useTributeWizard>['form']
    tribute?: TributeDetail | null
    publicData?: PublicTribute | null
    readonly?: boolean
    compact?: boolean
    showViewportTabs?: boolean
    viewportWidth?: number
    refreshToken?: number
  }>(),
  {
    tributeId: undefined,
    form: undefined,
    tribute: null,
    publicData: null,
    readonly: false,
    compact: false,
    showViewportTabs: true,
    viewportWidth: 375,
    refreshToken: 0,
  },
)

const apiData = ref<TributeDetail | null>(null)
const loading = ref(false)
const loadError = ref('')
const activeViewport = ref(String(props.viewportWidth))

const frameStyle = computed(() => {
  const width = props.showViewportTabs ? Number(activeViewport.value) : props.viewportWidth
  return { width: `${width}px`, maxWidth: '100%' }
})

const accent = computed(() => {
  if (props.form?.color_primary) return props.form.color_primary
  if (props.publicData?.color_primary) return props.publicData.color_primary
  return (
    props.tribute?.color_primary ||
    props.tribute?.template.primary_color ||
    props.publicData?.template.primary_color ||
    apiData.value?.template.primary_color ||
    '#d94f7a'
  )
})

const typeName = computed(
  () =>
    props.tribute?.tribute_type.name ||
    props.publicData?.tribute_type.name ||
    apiData.value?.tribute_type.name ||
    'Homenagem',
)

const displayTitle = computed(
  () =>
    props.form?.title ||
    props.form?.honoree_name ||
    props.publicData?.title ||
    props.publicData?.honoree_name ||
    apiData.value?.title ||
    apiData.value?.honoree_name ||
    'Homenagem',
)

const displaySubtitle = computed(
  () => props.form?.subtitle || props.publicData?.subtitle || apiData.value?.subtitle || '',
)

const displayMessage = computed(
  () => props.form?.message || props.publicData?.message || apiData.value?.message || '',
)

const displayClosing = computed(
  () =>
    props.form?.closing_message ||
    props.publicData?.closing_message ||
    apiData.value?.closing_message ||
    'Feito com carinho no MayLove',
)

const viewsCount = computed(() =>
  props.readonly && props.publicData ? props.publicData.views_count : null,
)

const photos = computed((): TributeMedia[] => {
  if (props.publicData?.media?.length) {
    return props.publicData.media.map((item) => ({
      id: item.id,
      storage_file_id: '',
      media_type: item.media_type as 'photo',
      original_filename: '',
      mime_type: null,
      size_bytes: null,
      sort_order: item.sort_order,
      url_thumbnail: item.url_thumbnail,
      url: item.url,
      created_at: '',
    }))
  }
  return (apiData.value?.media ?? []).filter((item) => item.media_type === 'photo')
})

const musicUrl = computed(() => {
  if (props.publicData?.music && typeof props.publicData.music === 'object') {
    const music = props.publicData.music as { preview_url?: string; url?: string }
    return music.preview_url || music.url || null
  }
  return apiData.value?.music?.preview_url || apiData.value?.music?.url || null
})

const { playing, blocked, toggle } = useTributeAudio(() => musicUrl.value)

watch(
  () => props.viewportWidth,
  (width) => {
    activeViewport.value = String(width)
  },
)

watch(
  () => [props.tributeId, props.refreshToken] as const,
  () => {
    if (props.tributeId && !props.readonly) {
      void loadPreviewData()
    }
  },
)

onMounted(() => {
  if (props.tributeId && !props.readonly) {
    void loadPreviewData()
  }
})

async function loadPreviewData() {
  if (!props.tributeId) return
  loading.value = true
  loadError.value = ''
  try {
    apiData.value = await fetchPreviewData(props.tributeId)
  } catch {
    loadError.value = 'Não foi possível carregar o preview.'
  } finally {
    loading.value = false
  }
}
</script>
