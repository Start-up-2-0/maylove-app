import { defineAsyncComponent, type Component } from 'vue'

const ProfessionalGalleryTemplate = defineAsyncComponent(
  () => import('./templates/ProfessionalGalleryTemplate.vue'),
)

/** Álbum público: galeria fotográfica masonry + lightbox. */
export function getBookTemplate(_presentation?: string): Component {
  return ProfessionalGalleryTemplate
}
