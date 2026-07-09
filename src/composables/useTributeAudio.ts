import { onMounted, onUnmounted, ref, watch } from 'vue'

export interface TributeAudioOptions {
  loop?: () => boolean
  autoplay?: () => boolean
}

export function useTributeAudio(
  audioUrl: () => string | null | undefined,
  options: TributeAudioOptions = {},
) {
  const playing = ref(false)
  const blocked = ref(false)
  let audio: HTMLAudioElement | null = null

  function ensureAudio(): HTMLAudioElement | null {
    const url = audioUrl()
    if (!url) return null

    if (!audio) {
      audio = new Audio(url)
      audio.volume = 0.6
      audio.addEventListener('play', () => {
        playing.value = true
        blocked.value = false
      })
      audio.addEventListener('pause', () => {
        playing.value = false
      })
    } else if (audio.src !== url) {
      audio.src = url
    }

    audio.loop = options.loop?.() ?? true
    return audio
  }

  async function play() {
    const element = ensureAudio()
    if (!element) return

    try {
      await element.play()
      blocked.value = false
    } catch {
      blocked.value = true
    }
  }

  function pause() {
    audio?.pause()
  }

  function toggle() {
    if (playing.value) {
      pause()
    } else {
      void play()
    }
  }

  // Tenta autoplay após a primeira interação do visitante (política dos browsers).
  let removeAutoplayListener: (() => void) | null = null

  function setupAutoplayOnGesture() {
    removeAutoplayListener?.()
    removeAutoplayListener = null
    if (!options.autoplay?.()) return

    const onGesture = () => {
      removeAutoplayListener?.()
      removeAutoplayListener = null
      if (options.autoplay?.()) void play()
    }

    window.addEventListener('pointerdown', onGesture, { once: true, passive: true })
    removeAutoplayListener = () => window.removeEventListener('pointerdown', onGesture)
  }

  onMounted(() => {
    ensureAudio()
    setupAutoplayOnGesture()
  })

  onUnmounted(() => {
    removeAutoplayListener?.()
    audio?.pause()
    audio = null
  })

  watch(
    () => [audioUrl(), options.loop?.(), options.autoplay?.()] as const,
    () => {
      ensureAudio()
      setupAutoplayOnGesture()
    },
  )

  return { playing, blocked, play, pause, toggle }
}
