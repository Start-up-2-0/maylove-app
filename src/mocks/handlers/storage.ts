import { http, HttpResponse } from 'msw'
import { storage } from './helpers'

export const storageHandlers = [
  // Upload real do arquivo no serviço de storages; no mock apenas confirmamos 200.
  http.post(storage('/files/upload'), () =>
    HttpResponse.json({ success: true, message: 'upload ok', data: null }),
  ),
]
