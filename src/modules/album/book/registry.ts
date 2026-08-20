import { defineAsyncComponent, type Component } from 'vue'
import { isMemorialPresentation } from './presentations'

const ProfessionalGalleryTemplate = defineAsyncComponent(
  () => import('./templates/ProfessionalGalleryTemplate.vue'),
)

const MemorialTemplate = defineAsyncComponent(
  () => import('./templates/MemorialTemplate.vue'),
)
const RomanticBookTemplate = defineAsyncComponent(() => import('./templates/RomanticBookTemplate.vue'))
const FamilyAlbumTemplate = defineAsyncComponent(() => import('./templates/FamilyAlbumTemplate.vue'))
const MemoryNotebookTemplate = defineAsyncComponent(() => import('./templates/MemoryNotebookTemplate.vue'))
const PhotoMagazineTemplate = defineAsyncComponent(() => import('./templates/PhotoMagazineTemplate.vue'))
const InstantPhotoTemplate = defineAsyncComponent(() => import('./templates/InstantPhotoTemplate.vue'))

/** Resolve o template público conforme apresentação do álbum. */
export function getBookTemplate(presentation?: string): Component {
  if (isMemorialPresentation(presentation)) {
    return MemorialTemplate
  }
  if (presentation === 'wedding-book' || presentation === 'romantic-book') return RomanticBookTemplate
  if (presentation === 'family-memories' || presentation === 'family-album') return FamilyAlbumTemplate
  if (presentation === 'scrapbook' || presentation === 'travel-journal' || presentation === 'memory-notebook') return MemoryNotebookTemplate
  if (presentation === 'magazine-style' || presentation === 'photo-magazine') return PhotoMagazineTemplate
  if (presentation === 'instant-photo') return InstantPhotoTemplate
  return ProfessionalGalleryTemplate
}
