const HAVE_METADATA = 1

export function waitForAudioMetadata(audio: HTMLMediaElement, timeoutMs = 15000): Promise<void> {
  if (audio.readyState >= HAVE_METADATA) {
    return Promise.resolve()
  }

  if (!audio.src) {
    return Promise.reject(new Error('Áudio sem URL.'))
  }

  if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
    audio.load()
  }

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('Timeout ao carregar áudio.'))
    }, timeoutMs)

    const onReady = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Falha ao carregar áudio.'))
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      audio.removeEventListener('loadedmetadata', onReady)
      audio.removeEventListener('canplay', onReady)
      audio.removeEventListener('error', onError)
    }

    audio.addEventListener('loadedmetadata', onReady, { once: true })
    audio.addEventListener('canplay', onReady, { once: true })
    audio.addEventListener('error', onError, { once: true })
  })
}

export async function seekAudioTo(audio: HTMLMediaElement, seconds: number): Promise<void> {
  const target = Math.max(0, seconds)
  await waitForAudioMetadata(audio)

  const duration = Number.isFinite(audio.duration) ? audio.duration : target
  const clampedTarget = Math.min(target, Math.max(duration - 0.05, 0))

  if (Math.abs(audio.currentTime - clampedTarget) < 0.05) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      audio.removeEventListener('seeked', onSeeked)
      window.clearTimeout(timer)
      resolve()
    }
    const onSeeked = () => finish()
    const timer = window.setTimeout(finish, 250)

    audio.addEventListener('seeked', onSeeked, { once: true })
    try {
      audio.currentTime = clampedTarget
    } catch (error) {
      settled = true
      window.clearTimeout(timer)
      audio.removeEventListener('seeked', onSeeked)
      reject(error instanceof Error ? error : new Error('Falha ao posicionar áudio.'))
    }
  })
}

export async function playFromSeconds(audio: HTMLMediaElement, seconds: number): Promise<void> {
  await seekAudioTo(audio, seconds)

  if (Math.abs(audio.currentTime - seconds) > 0.35) {
    await seekAudioTo(audio, seconds)
  }

  await audio.play()
}
