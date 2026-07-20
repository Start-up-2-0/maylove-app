import { defineAsyncComponent, type Component } from 'vue'
import { isMemorialPresentation } from '../albumModels'

const ProfessionalGalleryTemplate = defineAsyncComponent(
  () => import('./templates/ProfessionalGalleryTemplate.vue'),
)

const MemorialTemplate = defineAsyncComponent(
  () => import('./templates/MemorialTemplate.vue'),
)

/** Resolve o template público conforme apresentação do álbum. */
export function getBookTemplate(presentation?: string): Component {
  if (isMemorialPresentation(presentation)) {
    return MemorialTemplate
  }
  return ProfessionalGalleryTemplate
}
