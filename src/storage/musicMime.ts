const MUSIC_EXT_TO_MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  mpeg: 'audio/mpeg',
  mp4: 'video/mp4',
}

export function inferMusicMimeType(file: File): string {
  const type = file.type.trim().toLowerCase()
  if (type && type !== 'application/octet-stream') {
    return type
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return MUSIC_EXT_TO_MIME[extension] ?? ''
}

export function isVideoMusicSource(mimeType: string): boolean {
  return mimeType === 'video/mp4'
}

export function loadAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.preload = 'metadata'
    audio.addEventListener('loadedmetadata', () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0
      resolve(duration > 0 ? duration : 0)
    })
    audio.addEventListener('error', () => reject(new Error('Não foi possível ler a duração do áudio.')))
    audio.src = url
  })
}

export function isYoutubeUrl(url: string): boolean {
  const trimmed = url.trim()
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/i.test(trimmed)
}
