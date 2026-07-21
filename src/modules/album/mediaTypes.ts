/** Tipos de mídia retornados pela API de álbum (`photo` no MVP; `image` reservado). */
export function isAlbumPhotoMedia(type: string): boolean {
  return type === 'photo' || type === 'image'
}

export function isAlbumVideoMedia(type: string): boolean {
  return type === 'video'
}

export function isAlbumVisualMedia(type: string): boolean {
  return isAlbumPhotoMedia(type) || isAlbumVideoMedia(type)
}
