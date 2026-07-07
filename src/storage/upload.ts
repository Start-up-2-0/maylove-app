import axios from 'axios'
import { STORAGE_UPLOAD_URL, type PresignResponse } from '@/api/types'

export async function uploadFile(file: File, presign: PresignResponse): Promise<void> {
  const form = new FormData()
  form.append('file', file)

  await axios.post(`${STORAGE_UPLOAD_URL}/files/upload`, form, {
    headers: {
      'X-Upload-Ticket': presign.upload_ticket,
    },
  })
}
