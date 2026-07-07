import { onMounted, ref } from 'vue'

export function useTributeAudio(audioUrl: () => string | null | undefined) {
  const playing = ref(false)
  const blocked = ref(false)
  let audio: HTMLAudioElement | null = null

  onMounted(() => {
    const url = audioUrl()
    if (!url) return

    audio = new Audio(url)
    audio.loop = true
    audio.volume = 0.6
    audio.addEventListener('play', () => {
      playing.value = true
      blocked.value = false
    })
    audio.addEventListener('pause', () => {
      playing.value = false
    })
  })

  async function play() {
    if (!audio) {
      const url = audioUrl()
      if (!url) return
      audio = new Audio(url)
      audio.loop = true
      audio.volume = 0.6
    }

    try {
      await audio.play()
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

  return { playing, blocked, play, pause, toggle }
}
