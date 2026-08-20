import { authHandlers } from './auth'
import { albumHandlers } from './albums'
import { catalogHandlers } from './catalog'
import { storageHandlers } from './storage'
import { tributeHandlers } from './tributes'

export const handlers = [
  ...authHandlers,
  ...albumHandlers,
  ...catalogHandlers,
  ...tributeHandlers,
  ...storageHandlers,
]
