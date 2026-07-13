import { defineAsyncComponent, type Component } from 'vue'
import { isTimelinePresentation, normalizePresentationId } from './presentations'
import type { BookPresentationId } from './types'

const PhotobookTemplate = defineAsyncComponent(() => import('./templates/PhotobookTemplate.vue'))
const TimelineTemplate = defineAsyncComponent(() => import('./templates/TimelineTemplate.vue'))

export function getBookTemplate(presentation: BookPresentationId | string): Component {
  const normalized = normalizePresentationId(presentation)
  if (isTimelinePresentation(normalized)) {
    return TimelineTemplate
  }
  return PhotobookTemplate
}
