import { http } from 'msw'
import { db } from '../db'
import { mockMusicCategories, mockTemplates, mockTributeTypes } from '../fixtures'
import { getTemplateDefinition } from '@/templates/registry'
import { buildPresentationCatalog } from '@/templates/presentationSchema'
import { api, ok } from './helpers'

export const catalogHandlers = [
  http.get(api('/tribute-types'), () => ok(mockTributeTypes)),

  http.get(api('/presentations'), () => ok(buildPresentationCatalog())),

  http.get(api('/templates'), ({ request }) => {
    const url = new URL(request.url)
    const typeId = url.searchParams.get('tribute_type_id')
    if (!typeId) return ok(mockTemplates)

    const type = mockTributeTypes.find((item) => item.id === typeId)
    if (!type) return ok(mockTemplates)

    // Filtra pelos templates cuja definição pertence ao tipo/ocasião selecionado.
    const filtered = mockTemplates.filter(
      (tpl) => getTemplateDefinition(tpl.slug).tributeTypeSlug === type.slug,
    )
    return ok(filtered.length ? filtered : mockTemplates)
  }),

  http.get(api('/music-tracks'), ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category') ?? undefined
    return ok({
      tracks: db.musicTracks(category),
      categories: mockMusicCategories,
    })
  }),
]
