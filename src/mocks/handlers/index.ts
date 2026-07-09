import { authHandlers } from './auth'
import { catalogHandlers } from './catalog'
import { storageHandlers } from './storage'
import { tributeHandlers } from './tributes'

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...tributeHandlers,
  ...storageHandlers,
]
