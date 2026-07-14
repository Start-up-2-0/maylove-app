import { defineAsyncComponent, type Component } from 'vue'
import {
  isInstantPhotoPresentation,
  isPolaroidBoardPresentation,
  isPortraitAlbumPresentation,
  isTimelinePresentation,
  normalizePresentationId,
} from './presentations'
import type { BookPresentationId } from './types'

const PhotobookTemplate = defineAsyncComponent(() => import('./templates/PhotobookTemplate.vue'))
const TimelineTemplate = defineAsyncComponent(() => import('./templates/TimelineTemplate.vue'))
const PolaroidBoardTemplate = defineAsyncComponent(
  () => import('./templates/PolaroidBoardTemplate.vue'),
)
const PortraitAlbumTemplate = defineAsyncComponent(
  () => import('./templates/PortraitAlbumTemplate.vue'),
)
const InstantPhotoTemplate = defineAsyncComponent(
  () => import('./templates/InstantPhotoTemplate.vue'),
)

export function getBookTemplate(presentation: BookPresentationId | string): Component {
  const normalized = normalizePresentationId(presentation)
  if (isTimelinePresentation(normalized)) {
    return TimelineTemplate
  }
  if (isPolaroidBoardPresentation(normalized)) {
    return PolaroidBoardTemplate
  }
  if (isPortraitAlbumPresentation(normalized)) {
    return PortraitAlbumTemplate
  }
  if (isInstantPhotoPresentation(normalized)) {
    return InstantPhotoTemplate
  }
  return PhotobookTemplate
}
