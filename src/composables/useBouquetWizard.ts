import { computed, reactive, ref } from 'vue'
import { fetchBouquet, updateBouquet } from '@/api/bouquets'
import type { BouquetLetterDesign, BouquetWrapColor, DigitalBouquetDetail } from '@/api/types'
import { BOUQUET_MAX_STEMS } from '@/modules/bouquet/bouquetCatalog'
import { useAutosave } from './useAutosave'

export function useBouquetWizard(bouquetId: string) {
  const bouquet = ref<DigitalBouquetDetail | null>(null)
  const loading = ref(true)
  const error = ref('')

  const form = reactive({
    title: '',
    stems: [] as string[],
    wrap_color: 'blush' as BouquetWrapColor,
    recipient_name: '',
    sender_name: '',
    letter_body: '',
    letter_design: 'classic' as BouquetLetterDesign,
  })

  const isEditable = computed(
    () => bouquet.value?.status === 'draft' || bouquet.value?.status === 'awaiting_payment',
  )

  const autosavePayload = computed(() => ({
    title: form.title.trim() || 'Meu buquê digital',
    stems: form.stems.slice(0, BOUQUET_MAX_STEMS),
    wrap_color: form.wrap_color,
    recipient_name: form.recipient_name.trim(),
    sender_name: form.sender_name.trim(),
    letter_body: form.letter_body.trim(),
    letter_design: form.letter_design,
  }))

  const { saving, savedAt, error: saveError, flush: flushAutosave } = useAutosave(
    autosavePayload,
    async (payload) => {
      if (!bouquet.value || !isEditable.value) return
      bouquet.value = await updateBouquet(bouquetId, payload)
    },
  )

  async function load() {
    loading.value = true
    error.value = ''
    try {
      bouquet.value = await fetchBouquet(bouquetId)
      syncFormFromBouquet(bouquet.value)
    } catch {
      error.value = 'Não foi possível carregar o buquê.'
    } finally {
      loading.value = false
    }
  }

  function syncFormFromBouquet(data: DigitalBouquetDetail) {
    form.title = data.title ?? ''
    form.stems = [...(data.stems ?? [])]
    form.wrap_color = data.wrap_color ?? 'blush'
    form.recipient_name = data.recipient_name ?? ''
    form.sender_name = data.sender_name ?? ''
    form.letter_body = data.letter_body ?? ''
    form.letter_design = data.letter_design ?? 'classic'
  }

  function addStem(flowerId: string) {
    if (form.stems.length >= BOUQUET_MAX_STEMS) return
    form.stems.push(flowerId)
  }

  function removeStem(index: number) {
    form.stems.splice(index, 1)
  }

  return {
    bouquet,
    form,
    loading,
    error,
    saving,
    savedAt,
    saveError,
    flushAutosave,
    isEditable,
    load,
    addStem,
    removeStem,
  }
}
