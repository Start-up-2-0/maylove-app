import { onMounted, onUnmounted, ref, watch } from 'vue'

export interface TributeAudioOptions {
  loop?: () => boolean
  autoplay?: () => boolean
  startAt?: () => number
  endAt?: () => number | null | undefined
}

export function useTributeAudio(
  audioUrl: () => string | null | undefined,
  options: TributeAudioOptions = {},
) {
  const playing = ref(false)
  const blocked = ref(false)
  let audio: HTMLAudioElement | null = null

  function resolveStartAt(): number {
    const start = options.startAt?.() ?? 0
    return Number.isFinite(start) && start > 0 ? start : 0
  }

  function resolveEndAt(): number | null {
    const end = options.endAt?.()
    if (end === null || end === undefined || !Number.isFinite(end) || end <= 0) {
      return null
    }
    return end
  }

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
      audio.addEventListener('timeupdate', onTimeUpdate)
    } else if (audio.src !== url) {
      audio.src = url
    }

    audio.loop = false
    return audio
  }

  function onTimeUpdate() {
    if (!audio) return
    const endAt = resolveEndAt()
    if (endAt === null || audio.currentTime < endAt) {
      return
    }

    if (options.loop?.() ?? true) {
      audio.currentTime = resolveStartAt()
      void audio.play().catch(() => {
        playing.value = false
      })
      return
    }

    audio.pause()
    playing.value = false
  }

  async function play() {
    const element = ensureAudio()
    if (!element) return

    const startAt = resolveStartAt()
    if (element.currentTime < startAt || (resolveEndAt() !== null && element.currentTime >= (resolveEndAt() ?? 0))) {
      element.currentTime = startAt
    }

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
    () => [audioUrl(), options.loop?.(), options.autoplay?.(), options.startAt?.(), options.endAt?.()] as const,
    () => {
      ensureAudio()
      setupAutoplayOnGesture()
    },
  )

  return { playing, blocked, play, pause, toggle }
}
