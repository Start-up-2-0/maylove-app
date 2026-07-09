import axios from 'axios'
import { STORAGE_UPLOAD_URL, type PresignResponse } from '@/api/types'

function resolveUploadUrl(presign: PresignResponse): string {
  if (presign.upload_url) {
    return presign.upload_url
  }

  return `${STORAGE_UPLOAD_URL}/files/upload`
}

export async function uploadFile(file: File, presign: PresignResponse): Promise<void> {
  const form = new FormData()
  form.append('file', file)

  await axios.post(resolveUploadUrl(presign), form, {
    headers: {
      'X-Upload-Ticket': presign.upload_ticket,
    },
  })
}
