import { MEDIA_LIMITS, formatBytes } from '@/config/mediaLimits'
import { inferImageMimeType } from '@/storage/mime'

export interface UploadValidationResult {
  ok: boolean
  message?: string
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem.'))
    }
    img.src = url
  })
}

export async function validatePhotoUpload(
  file: File,
  currentCount: number,
): Promise<UploadValidationResult> {
  const limits = MEDIA_LIMITS.photo
  const mime = inferImageMimeType(file)

  if (!mime || !limits.acceptedMimes.includes(mime as (typeof limits.acceptedMimes)[number])) {
    return {
      ok: false,
      message: 'Formato não suportado. Use JPEG, PNG ou WebP.',
    }
  }

  if (file.size > limits.maxFileBytes) {
    return {
      ok: false,
      message: `Arquivo muito grande. Tamanho máximo: ${formatBytes(limits.maxFileBytes)}.`,
    }
  }

  if (currentCount >= limits.maxCountPerAlbum) {
    return {
      ok: false,
      message: `Limite de ${limits.maxCountPerAlbum} fotos por álbum atingido.`,
    }
  }

  try {
    const { width, height } = await readImageDimensions(file)
    const longEdge = Math.max(width, height)
    if (longEdge > limits.maxLongEdgePx) {
      // Resolução acima do alvo: o servidor redimensiona no confirm; não bloqueia o envio.
      return { ok: true }
    }
  } catch {
    return { ok: false, message: 'Não foi possível validar a imagem enviada.' }
  }

  return { ok: true }
}

export function validateAudioUpload(file: File, currentCount: number): UploadValidationResult {
  const limits = MEDIA_LIMITS.audio
  const mime = file.type.trim().toLowerCase() || 'audio/mpeg'
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const accepted =
    limits.acceptedMimes.includes(mime as (typeof limits.acceptedMimes)[number]) ||
    limits.acceptedExtensions.includes(extension as (typeof limits.acceptedExtensions)[number])

  if (!accepted) {
    return { ok: false, message: 'Formato não suportado. Use MP3.' }
  }

  if (file.size > limits.maxFileBytes) {
    return {
      ok: false,
      message: `Arquivo muito grande. Tamanho máximo: ${formatBytes(limits.maxFileBytes)}.`,
    }
  }

  if (currentCount >= limits.maxCountPerAlbum) {
    return { ok: false, message: 'Apenas uma música de fundo por álbum.' }
  }

  return { ok: true }
}

export function photoUploadHint(): string {
  const limits = MEDIA_LIMITS.photo
  return `JPEG, PNG ou WebP · até ${limits.maxCountPerAlbum} fotos · máx. ${formatBytes(limits.maxFileBytes)} por arquivo · resolução até ${limits.maxLongEdgePx}px`
}

export function audioUploadHint(): string {
  return `MP3 · máx. ${formatBytes(MEDIA_LIMITS.audio.maxFileBytes)}`
}
