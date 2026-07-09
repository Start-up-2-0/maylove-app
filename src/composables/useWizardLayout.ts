import { onMounted, onUnmounted, ref } from 'vue'

const DESKTOP_QUERY = '(min-width: 1024px)'

export function useWizardLayout() {
  const isDesktop = ref(false)
  const previewModalOpen = ref(false)
  const viewportWidth = ref(375)

  let mediaQuery: MediaQueryList | null = null

  function updateDesktop(e?: MediaQueryList | MediaQueryListEvent) {
    const mq = e ?? mediaQuery
    isDesktop.value = mq?.matches ?? false
    if (isDesktop.value && previewModalOpen.value) {
      previewModalOpen.value = false
    }
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(DESKTOP_QUERY)
    updateDesktop(mediaQuery)
    mediaQuery.addEventListener('change', updateDesktop)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', updateDesktop)
  })

  function openPreviewModal() {
    if (!isDesktop.value) {
      previewModalOpen.value = true
    }
  }

  function closePreviewModal() {
    previewModalOpen.value = false
  }

  return {
    isDesktop,
    previewModalOpen,
    viewportWidth,
    openPreviewModal,
    closePreviewModal,
  }
}
