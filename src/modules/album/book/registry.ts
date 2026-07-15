import { defineAsyncComponent, type Component } from 'vue'

const PhotobookTemplate = defineAsyncComponent(
  () => import('./templates/PhotobookTemplate.vue'),
)

/** Álbum público: livro editorial página a página. */
export function getBookTemplate(_presentation?: string): Component {
  return PhotobookTemplate
}
