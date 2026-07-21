import { onMounted, onUnmounted, ref, watch } from 'vue'
import { playFromSeconds, seekAudioTo } from '@/utils/audioPlayback'

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
  const currentTime = ref(0)
  const duration = ref(0)
  let audio: HTMLAudioElement | null = null

  function resolveStartAt(): number {
    const start = options.startAt?.() ?? 0
    return Number.isFinite(start) && start >= 0 ? start : 0
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
      audio.preload = 'auto'
      audio.volume = 0.6
      audio.addEventListener('play', () => {
        playing.value = true
        blocked.value = false
      })
      audio.addEventListener('pause', () => {
        playing.value = false
      })
      audio.addEventListener('playing', onPlaying)
      audio.addEventListener('timeupdate', onTimeUpdate)
      audio.addEventListener('loadedmetadata', onLoadedMetadata)
    } else if (audio.src !== url) {
      audio.src = url
    }

    audio.loop = false
    return audio
  }

  function onPlaying() {
    if (!audio) return
    const startAt = resolveStartAt()
    if (startAt > 0 && audio.currentTime < startAt - 0.1) {
      void seekAudioTo(audio, startAt)
    }
  }

  function onLoadedMetadata() {
    if (!audio) return
    duration.value = Number.isFinite(audio.duration) ? audio.duration : 0
  }

  function onTimeUpdate() {
    if (!audio) return
    currentTime.value = audio.currentTime

    const startAt = resolveStartAt()
    const endAt = resolveEndAt()

    if (startAt > 0 && audio.currentTime < startAt - 0.05) {
      audio.currentTime = startAt
      return
    }

    if (endAt === null || audio.currentTime < endAt) {
      return
    }

    if (options.loop?.() ?? true) {
      void seekAudioTo(audio, startAt).then(() => {
        void audio?.play().catch(() => {
          playing.value = false
        })
      })
      return
    }

    audio.pause()
    playing.value = false
  }

  async function seek(seconds: number) {
    const element = ensureAudio()
    if (!element) return
    try {
      await seekAudioTo(element, seconds)
      currentTime.value = element.currentTime
    } catch {
      // Mantém posição atual se o seek falhar.
    }
  }

  async function play() {
    const element = ensureAudio()
    if (!element) return

    const startAt = resolveStartAt()
    const endAt = resolveEndAt()

    try {
      if (
        endAt !== null &&
        element.currentTime >= endAt - 0.05
      ) {
        await playFromSeconds(element, startAt)
      } else if (
        startAt > 0 &&
        (element.currentTime < startAt - 0.05 || element.currentTime === 0)
      ) {
        await playFromSeconds(element, startAt)
      } else {
        await element.play()
      }
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

  return { playing, blocked, currentTime, duration, play, pause, toggle, seek }
}
