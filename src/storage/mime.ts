const IMAGE_EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export function inferImageMimeType(file: File): string {
  const type = file.type.trim().toLowerCase()
  if (type && type !== 'application/octet-stream') {
    return type
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXT_TO_MIME[extension] ?? ''
}
