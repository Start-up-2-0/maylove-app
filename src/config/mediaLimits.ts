/** Limites alinhados ao backend (MediaUploadPolicy). */
export const MEDIA_LIMITS = {
  photo: {
    acceptedMimes: ['image/jpeg', 'image/png', 'image/webp'],
    acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxFileBytes: 15 * 1024 * 1024,
    maxLongEdgePx: 2560,
    maxCountPerAlbum: 40,
  },
  audio: {
    acceptedMimes: ['audio/mpeg', 'audio/mp3'],
    acceptedExtensions: ['mp3', 'mpeg'],
    maxFileBytes: 10 * 1024 * 1024,
    maxCountPerAlbum: 1,
  },
} as const

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }
  return `${Math.round(bytes / 1024)} KB`
}
