const HAVE_METADATA = 1
const SEEK_TOLERANCE_SECONDS = 0.15
const SEEK_TIMEOUT_MS = 8000

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

function isNearTime(current: number, target: number): boolean {
  return Math.abs(current - target) <= SEEK_TOLERANCE_SECONDS
}

export async function seekAudioTo(audio: HTMLMediaElement, seconds: number): Promise<void> {
  const target = Math.max(0, seconds)
  await waitForAudioMetadata(audio)

  const duration = Number.isFinite(audio.duration) ? audio.duration : target
  const clampedTarget = Math.min(target, Math.max(duration - 0.05, 0))

  if (isNearTime(audio.currentTime, clampedTarget)) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    let pollTimer = 0
    let settled = false
    const deadline = Date.now() + SEEK_TIMEOUT_MS

    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(pollTimer)
      audio.removeEventListener('seeked', onSeeked)
      if (ok) {
        resolve()
        return
      }
      reject(new Error('Não foi possível posicionar o áudio no trecho escolhido.'))
    }

    const checkPosition = () => {
      if (isNearTime(audio.currentTime, clampedTarget)) {
        finish(true)
        return
      }
      if (Date.now() >= deadline) {
        finish(false)
        return
      }
      pollTimer = window.setTimeout(checkPosition, 40)
    }

    const onSeeked = () => {
      checkPosition()
    }

    audio.addEventListener('seeked', onSeeked)
    try {
      audio.currentTime = clampedTarget
    } catch (error) {
      settled = true
      window.clearTimeout(pollTimer)
      audio.removeEventListener('seeked', onSeeked)
      reject(error instanceof Error ? error : new Error('Falha ao posicionar áudio.'))
      return
    }

    checkPosition()
  })
}

export async function playFromSeconds(audio: HTMLMediaElement, seconds: number): Promise<void> {
  await seekAudioTo(audio, seconds)

  if (!isNearTime(audio.currentTime, seconds)) {
    await seekAudioTo(audio, seconds)
  }

  if (!isNearTime(audio.currentTime, seconds)) {
    throw new Error('Não foi possível iniciar o áudio no trecho escolhido.')
  }

  await audio.play()

  if (audio.currentTime < seconds - 0.2) {
    audio.pause()
    await seekAudioTo(audio, seconds)
    await audio.play()
  }
}
