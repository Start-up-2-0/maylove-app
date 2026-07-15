import { onUnmounted, watch, type Ref } from 'vue'

interface ModalLifecycleOptions {
  lockScroll?: boolean
}

/** Escape, scroll lock e cleanup ao desmontar — evita overlays invisíveis bloqueando cliques. */
export function useModalLifecycle(
  isOpen: Ref<unknown>,
  close: () => void,
  options: ModalLifecycleOptions = {},
) {
  const { lockScroll = false } = options

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !isOpen.value) return
    event.preventDefault()
    close()
  }

  watch(
    isOpen,
    (open) => {
      if (open) {
        if (lockScroll) document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeydown)
      } else {
        if (lockScroll) document.body.style.overflow = ''
        window.removeEventListener('keydown', onKeydown)
      }
    },
    { flush: 'sync' },
  )

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    if (lockScroll) document.body.style.overflow = ''
    if (isOpen.value) close()
  })
}
