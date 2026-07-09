const HAVE_METADATA = 1

export function waitForAudioMetadata(audio: HTMLMediaElement): Promise<void> {
  if (audio.readyState >= HAVE_METADATA) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const onMetadata = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Falha ao carregar áudio.'))
    }
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onMetadata)
      audio.removeEventListener('error', onError)
    }

    audio.addEventListener('loadedmetadata', onMetadata, { once: true })
    audio.addEventListener('error', onError, { once: true })
  })
}

export async function seekAudioTo(audio: HTMLMediaElement, seconds: number): Promise<void> {
  const target = Math.max(0, seconds)
  await waitForAudioMetadata(audio)

  if (Math.abs(audio.currentTime - target) < 0.05) {
    return
  }

  await new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      audio.removeEventListener('seeked', onSeeked)
      resolve()
    }
    const onSeeked = () => finish()

    audio.addEventListener('seeked', onSeeked, { once: true })
    audio.currentTime = target
    window.setTimeout(finish, 120)
  })
}

export async function playFromSeconds(audio: HTMLMediaElement, seconds: number): Promise<void> {
  await seekAudioTo(audio, seconds)

  if (Math.abs(audio.currentTime - seconds) > 0.25) {
    await seekAudioTo(audio, seconds)
  }

  await audio.play()
}
