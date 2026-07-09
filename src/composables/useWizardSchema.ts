import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { listPresentations } from '@/api/catalog'
import {
  resolvePresentationSchema,
  setPresentationCatalog,
  type PresentationSchema,
} from '@/templates/presentationSchema'
import type { TemplateDefinition } from '@/templates/types'

/**
 * Hidrata (uma única vez) o catálogo de apresentações servido pelo backend
 * (`GET /api/v1/presentations`) e expõe o schema do wizard de forma reativa.
 *
 * O backend é a fonte de `config`/`limits`/`required`; a composição dos passos é
 * resolvida no cliente (`resolvePresentationSchema`) porque depende também do
 * template escolhido (vídeo por capacidade, evento por categoria). Se o fetch
 * falhar, o resolver usa os defaults locais — o fluxo continua funcionando.
 */
let catalogLoaded = false
let catalogPromise: Promise<void> | null = null
const catalogVersion = ref(0)

export function ensurePresentationCatalog(): Promise<void> {
  if (catalogLoaded) return Promise.resolve()
  if (!catalogPromise) {
    catalogPromise = listPresentations()
      .then((entries) => {
        setPresentationCatalog(entries)
        catalogLoaded = true
        catalogVersion.value += 1
      })
      .catch(() => {
        // Sem catálogo do backend: seguimos com os defaults locais.
        catalogLoaded = true
      })
  }
  return catalogPromise
}

export function useWizardSchema(
  presentationId: MaybeRefOrGetter<string | null | undefined>,
  definition: MaybeRefOrGetter<TemplateDefinition | null | undefined>,
): ComputedRef<PresentationSchema> {
  void ensurePresentationCatalog()
  return computed<PresentationSchema>(() => {
    // Recalcula quando o catálogo do backend termina de carregar.
    void catalogVersion.value
    return resolvePresentationSchema(toValue(presentationId), toValue(definition))
  })
}
